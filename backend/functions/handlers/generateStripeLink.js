const functions = require("firebase-functions");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");
const cors = require("cors");

const corsHandler = cors({ origin: true });

// URLs de redirection (change en prod)
const SUCCESS_URL =
  "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}";
const CANCEL_URL = "http://localhost:3000/cancel";

exports.generateStripeLink = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Méthode non autorisée");
    }

    try {
      let bookingData;
      let bookingId;

      // Option 1 : On reçoit un bookingId → récupérer les données depuis Firestore
      if (req.body.bookingId) {
        bookingId = req.body.bookingId;
        const bookingRef = admin
          .firestore()
          .collection("bookings")
          .doc(bookingId);
        const bookingSnap = await bookingRef.get();

        if (!bookingSnap.exists) {
          return res.status(404).json({
            success: false,
            error: "Course non trouvée.",
          });
        }

        const booking = bookingSnap.data();

        // Vérifier que la course est bien acceptée
        if (booking.status !== "acceptee") {
          return res.status(400).json({
            success: false,
            error: "Cette course n'est pas en attente de paiement.",
          });
        }

        bookingData = {
          email: booking.email,
          uid: booking.clientId,
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          datetime: booking.date?.toDate?.().toISOString() || "",
          passengers: booking.passengers || 1,
          carSeat: booking.carSeat || "non",
          carSeatCount: booking.carSeatCount || 0,
          prix: booking.price,
          kilometers: booking.kilometers || 0,
        };
      }
      // Option 2 : On reçoit les données directement (ancien fonctionnement)
      else {
        const { email, uid, pickup, dropoff, prix } = req.body;

        if (!email || !uid || !pickup || !dropoff || !prix) {
          return res.status(400).json({
            success: false,
            error: "Champs requis manquants",
          });
        }

        bookingData = req.body;
      }

      // Créer la session Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: bookingData.email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Course VTC : ${bookingData.pickup} ➜ ${bookingData.dropoff}`,
              },
              unit_amount: Math.round(Number(bookingData.prix) * 100),
            },
            quantity: 1,
          },
        ],
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
        metadata: {
          bookingId: bookingId || "",
          uid: bookingData.uid,
          email: bookingData.email,
          pickup: bookingData.pickup,
          dropoff: bookingData.dropoff,
          datetime: bookingData.datetime || "",
          passengers: String(bookingData.passengers || "1"),
          carSeat: bookingData.carSeat || "non",
          carSeatCount: String(bookingData.carSeatCount || "0"),
          kilometers: String(bookingData.kilometers || "0"),
          prix: String(bookingData.prix),
        },
      });

      // Si on a un bookingId, mettre à jour le lien dans Firestore
      if (bookingId) {
        await admin.firestore().collection("bookings").doc(bookingId).update({
          stripeCheckoutUrl: session.url,
          stripeSessionId: session.id,
        });
      }

      return res.status(200).json({
        success: true,
        checkoutUrl: session.url,
      });
    } catch (err) {
      console.error("❌ Erreur Stripe :", err);
      return res.status(500).json({
        success: false,
        error: "Erreur création lien Stripe",
      });
    }
  });
});
