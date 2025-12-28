const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");
const nodemailer = require("nodemailer");

const db = admin.firestore();

// Configuration email (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_EMAIL,
    pass: functions.config().gmail?.pass || process.env.GMAIL_APP_PASSWORD,
  },
});

exports.requestAvailability = async (req, res) => {
  try {
    const { pickupAddress, date, time, duration, name, email, phone, details } =
      req.body;

    // Validation des champs requis
    if (!pickupAddress || !date || !time || !duration) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Formater la date
    let formattedDate;
    try {
      formattedDate = new Date(`${date}T${time}`).toLocaleString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      formattedDate = `${date} à ${time}`;
    }

    // Sauvegarder la demande dans Firestore
    const demande = {
      pickupAddress,
      date,
      time,
      duration,
      name: name || "Non précisé",
      email: email || "Non précisé",
      phone: phone || "Non précisé",
      details: details || "",
      status: "pending",
      createdAt: admin.firestore.Timestamp.now(),
      type: "mise_a_disposition",
    };

    const docRef = await db.collection("disponibilites").add(demande);
    console.log("✅ Demande de mise à disposition enregistrée:", docRef.id);

    // Envoyer un email de notification
    try {
      const gmailEmail =
        functions.config().gmail?.email || process.env.GMAIL_EMAIL;

      if (gmailEmail) {
        const mailOptions = {
          from: `"Green Road Services" <${gmailEmail}>`,
          to: gmailEmail,
          subject: `🚗 Nouvelle demande de mise à disposition`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #22c55e; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Nouvelle demande de mise à disposition</h1>
              </div>
              
              <div style="padding: 20px; background: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
                  📋 Détails de la demande
                </h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">📍 Adresse</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${pickupAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">📅 Date et heure</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">⏱️ Durée</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${duration}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">👤 Nom</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                      name || "Non précisé"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">📧 Email</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                      email || "Non précisé"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">📞 Téléphone</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                      phone || "Non précisé"
                    }</td>
                  </tr>
                  ${
                    details
                      ? `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">📝 Détails</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${details}</td>
                  </tr>
                  `
                      : ""
                  }
                </table>
                
                <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; color: #856404;">
                  ⚠️ Pensez à recontacter le client rapidement pour confirmer la disponibilité et établir un devis.
                </p>
              </div>
              
              <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                Green Road Services - VTC Reims<br>
                Ce message a été généré automatiquement.
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email de notification envoyé");
      } else {
        console.log("⚠️ Email non configuré, notification non envoyée");
      }
    } catch (emailError) {
      console.error("⚠️ Erreur envoi email:", emailError.message);
      // On continue même si l'email échoue
    }

    return res.status(200).json({
      success: true,
      message: "Demande envoyée avec succès",
      id: docRef.id,
    });
  } catch (error) {
    console.error("❌ Erreur requestAvailability:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi de la demande.",
    });
  }
};
