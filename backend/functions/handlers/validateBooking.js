// handlers/validateBooking.js

const functions = require("firebase-functions/v1");
const stripe = require("stripe")(
  functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY
);
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_EMAIL,
    pass: functions.config().gmail?.pass || process.env.GMAIL_APP_PASSWORD,
  },
});

exports.validateBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "bookingId requis",
      });
    }

    const bookingRef = admin.firestore().collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({
        success: false,
        error: "Course non trouvée.",
      });
    }

    const booking = bookingSnap.data();

    // 1. Génération du lien Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Course VTC : ${booking.pickup} → ${booking.dropoff}`,
            },
            unit_amount: Math.round(booking.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        "https://green-road-services.fr/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://green-road-services.fr/cancel",
      metadata: { bookingId },
    });

    // 2. Mise à jour Firestore
    await bookingRef.update({
      status: "acceptee",
      stripeCheckoutUrl: session.url,
      stripeSessionId: session.id,
      adminValidatedAt: admin.firestore.Timestamp.now(),
    });

    // 3. Formatage de la date
    let dateFormatted = "À définir";
    if (booking.date) {
      const dateObj = booking.date.toDate
        ? booking.date.toDate()
        : new Date(booking.date);
      dateFormatted = dateObj.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // 4. Envoi de l'email au client
    const gmailEmail =
      functions.config().gmail?.email || process.env.GMAIL_EMAIL;

    if (gmailEmail && booking.email) {
      const mailOptions = {
        from: `"Green Road Services" <${gmailEmail}>`,
        to: booking.email,
        subject: "✅ Votre course VTC a été acceptée - Paiement requis",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e; margin: 0;">🚗 Green Road Services</h1>
                <p style="color: #666; margin-top: 5px;">Service VTC Premium</p>
              </div>
              
              <h2 style="color: #333;">Bonne nouvelle ! 🎉</h2>
              <p style="color: #555; line-height: 1.6;">
                Votre demande de course a été <strong style="color: #22c55e;">acceptée</strong> par notre chauffeur.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin-top: 0; color: #333;">📍 Détails de votre course</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #666; width: 40%;">Départ :</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                      booking.pickup
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666;">Arrivée :</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                      booking.dropoff
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666;">Date :</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #333;">${dateFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666;">Passagers :</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                      booking.passengers
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #666;">Distance :</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                      booking.kilometers || "N/A"
                    } km</td>
                  </tr>
                  <tr style="border-top: 2px solid #22c55e;">
                    <td style="padding: 15px 0; color: #333; font-size: 18px; font-weight: bold;">Total :</td>
                    <td style="padding: 15px 0; font-weight: bold; font-size: 24px; color: #22c55e;">${
                      booking.price
                    } €</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #555; line-height: 1.6;">
                Pour <strong>confirmer définitivement</strong> votre réservation, veuillez procéder au paiement sécurisé :
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${session.url}" 
                   style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); 
                          color: white; padding: 18px 50px; text-decoration: none; border-radius: 50px; 
                          font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);">
                  💳 Payer maintenant - ${booking.price} €
                </a>
              </div>
              
              <p style="color: #555; text-align: center; font-size: 14px;">
                Ou connectez-vous à votre espace client :<br>
                <a href="https://green-road-services.fr/account" style="color: #22c55e;">https://green-road-services.fr/account</a>
              </p>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  ⏰ <strong>Important :</strong> Ce lien de paiement est valable 24 heures. 
                  Passé ce délai, votre réservation pourra être annulée.
                </p>
              </div>
              
              <p style="color: #999; font-size: 13px; text-align: center;">
                🔒 Paiement 100% sécurisé via Stripe
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px;">
                Une question ? Contactez-nous :<br>
                📞 06 18 71 05 34<br>
                📧 <a href="mailto:contact.greenroadservices@gmail.com" style="color: #22c55e;">contact.greenroadservices@gmail.com</a>
              </p>
              
              <p style="color: #666; margin-top: 20px;">
                Merci de votre confiance,<br>
                <strong style="color: #22c55e;">L'équipe Green Road Services</strong>
              </p>
              
            </div>
            
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              © 2025 Green Road Services - VTC Reims - Tous droits réservés
            </p>
          </body>
          </html>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé à:", booking.email);
      } catch (emailError) {
        console.error("⚠️ Erreur envoi email:", emailError.message);
        // On continue même si l'email échoue
      }
    } else {
      console.log(
        "⚠️ Email non envoyé: configuration manquante ou email client absent"
      );
    }

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      message: "Course acceptée et email envoyé au client",
    });
  } catch (error) {
    console.error("❌ Erreur validateBooking:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la validation de la course.",
    });
  }
};
