// handlers/refuseBooking.js

const functions = require("firebase-functions/v1");
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

exports.refuseBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

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

    // 1. Mise à jour Firestore
    await bookingRef.update({
      status: "refuse",
      refusedAt: admin.firestore.Timestamp.now(),
      refuseReason: reason || "Non spécifiée",
    });

    // 2. Formatage de la date
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

    // 3. Envoi de l'email au client
    const gmailEmail =
      functions.config().gmail?.email || process.env.GMAIL_EMAIL;

    if (gmailEmail && booking.email) {
      const mailOptions = {
        from: `"Green Road Services" <${gmailEmail}>`,
        to: booking.email,
        subject: "❌ Votre demande de course VTC n'a pas pu être acceptée",
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
              
              <h2 style="color: #333;">Nous sommes désolés 😔</h2>
              <p style="color: #555; line-height: 1.6;">
                Malheureusement, nous ne sommes pas en mesure d'accepter votre demande de course pour le moment.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #333;">📍 Détails de votre demande</h3>
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
                    <td style="padding: 10px 0; color: #666;">Prix estimé :</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #333;">${
                      booking.price
                    } €</td>
                  </tr>
                </table>
              </div>
              
              ${
                reason
                  ? `
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
                <p style="color: #991b1b; margin: 0; font-size: 14px;">
                  <strong>Motif :</strong> ${reason}
                </p>
              </div>
              `
                  : ""
              }
              
              <p style="color: #555; line-height: 1.6;">
                Nous vous invitons à effectuer une nouvelle demande pour une autre date ou un autre horaire. 
                Notre équipe fera tout son possible pour vous satisfaire.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://green-road-services.fr/reservation" 
                   style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); 
                          color: white; padding: 18px 50px; text-decoration: none; border-radius: 50px; 
                          font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);">
                  🚗 Faire une nouvelle réservation
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #666; font-size: 14px;">
                Une question ? Contactez-nous directement :<br>
                📞 06 18 71 05 34<br>
                📧 <a href="mailto:contact.greenroadservices@gmail.com" style="color: #22c55e;">contact.greenroadservices@gmail.com</a>
              </p>
              
              <p style="color: #666; margin-top: 20px;">
                Nous espérons vous compter parmi nos clients très bientôt,<br>
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
        console.log("✅ Email de refus envoyé à:", booking.email);
      } catch (emailError) {
        console.error("⚠️ Erreur envoi email:", emailError.message);
      }
    } else {
      console.log(
        "⚠️ Email non envoyé: configuration manquante ou email client absent"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Course refusée et email envoyé au client",
    });
  } catch (error) {
    console.error("❌ Erreur refuseBooking:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors du refus de la course.",
    });
  }
};
