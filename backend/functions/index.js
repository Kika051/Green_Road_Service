require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const axios = require("axios");
const puppeteer = require("puppeteer");
const { format } = require("date-fns");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

// 🔹 Fonction de création de devis
exports.createQuote = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { pickup, dropoff, stops = [] } = req.body;

    if (!pickup || !dropoff) {
      return res
        .status(400)
        .json({ success: false, error: "pickup et dropoff requis" });
    }

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        pickup
      )}&destinations=${encodeURIComponent(
        dropoff
      )}&mode=driving&units=metric&key=${apiKey}`;
      const result = await axios.get(url);
      const element = result.data.rows[0].elements[0];

      if (element.status !== "OK")
        throw new Error("Distance Matrix API a échoué");

      const distanceKm = element.distance.value / 1000;
      const basePrice = distanceKm * 2;
      const price = basePrice < 20 ? 20 : basePrice;

      const quote = {
        pickup,
        dropoff,
        stops,
        kilometers: distanceKm.toFixed(2),
        price: price.toFixed(2),
        createdAt: new Date().toISOString(),
      };

      return res.status(200).json({ success: true, quote });
    } catch (error) {
      console.error("Erreur backend :", error.message);
      return res
        .status(500)
        .json({ success: false, error: "Erreur interne backend" });
    }
  });
});

// 🔹 Test des clés (optionnel)
exports.testKey = functions.https.onRequest((req, res) => {
  const key = functions.config().google.key;
  res.send(`Clé récupérée : ${key ? "OK ✅" : "Non chargée ❌"}`);
});

// 🔹 Génération de la facture PDF (avec Puppeteer)
exports.generateInvoice = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {
      email,
      pickup,
      dropoff,
      datetime,
      passengers,
      carSeat,
      carSeatCount,
      prix,
      kilometers,
    } = req.body;

    if (!pickup || !dropoff || !prix || !email) {
      return res.status(400).send("Données incomplètes pour la facture.");
    }

    const now = new Date();
    const formattedDate = format(now, "dd/MM/yyyy HH:mm");
    const invoiceNumber = `GRS-${now.getTime()}`;

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              font-size: 14px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #222;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            td, th {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            .total {
              font-weight: bold;
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <h1>FACTURE VTC</h1>
          <p><strong>Date :</strong> ${formattedDate}</p>
          <p><strong>Facture n° :</strong> ${invoiceNumber}</p>
          <p><strong>Client :</strong> ${email}</p>

          <table>
            <tr>
              <th>Trajet</th>
              <th>Date/heure</th>
              <th>Distance</th>
              <th>Passagers</th>
              <th>Siège auto</th>
            </tr>
            <tr>
              <td>${pickup} ➜ ${dropoff}</td>
              <td>${datetime || "Non précisée"}</td>
              <td>${kilometers} km</td>
              <td>${passengers}</td>
              <td>${carSeat === "oui" ? `${carSeatCount} siège(s)` : "Non"}</td>
            </tr>
          </table>

          <table>
            <tr>
              <td class="total">Montant TTC</td>
              <td class="total">${prix} €</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 12px;">TVA incluse. Merci pour votre confiance.</p>
        </body>
      </html>
    `;

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4" });
      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=facture-${invoiceNumber}.pdf`
      );
      res.status(200).send(pdfBuffer);
    } catch (err) {
      console.error("Erreur Puppeteer :", err);
      res.status(500).send("Erreur lors de la génération du PDF.");
    }
  });
});

// 🔹 Génération du lien de paiement Stripe
exports.generateStripeLink = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {
      email,
      pickup,
      dropoff,
      datetime,
      passengers,
      carSeat,
      carSeatCount,
      prix,
      kilometers,
    } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Course VTC : ${pickup} ➜ ${dropoff}`,
              },
              unit_amount: Math.round(Number(prix) * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: "https://green-road-services.fr/success",
        cancel_url: "https://green-road-services.fr/cancel",
        metadata: {
          pickup,
          dropoff,
          datetime,
          passengers,
          carSeat,
          carSeatCount,
          kilometers,
        },
      });

      return res.status(200).json({
        success: true,
        checkoutUrl: session.url,
      });
    } catch (err) {
      console.error("Erreur Stripe :", err);
      return res.status(500).json({ success: false, error: "Erreur Stripe" });
    }
  });
});
