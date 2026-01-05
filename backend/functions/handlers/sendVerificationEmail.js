const admin = require("firebase-admin");
const { sendEmail } = require("../services/emailService");
const { verificationEmailTemplate } = require("../templates/emailTemplates");
const { companyInfo } = require("../config/emailConfig");

/**
 * Envoyer un email de vérification personnalisé
 */
const sendVerificationEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validation
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: "Email et nom sont requis",
      });
    }

    // Générer le lien de vérification Firebase
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        url: `${companyInfo.website}/login`,
      });

    // Générer le template HTML
    const htmlContent = verificationEmailTemplate(name, verificationLink);

    // Envoyer l'email
    const sent = await sendEmail(
      email,
      "Confirmez votre adresse email - Green Road Services",
      htmlContent
    );

    if (sent) {
      res.json({
        success: true,
        message: "Email de vérification envoyé",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Échec de l'envoi de l'email",
      });
    }
  } catch (error) {
    console.error("Erreur sendVerificationEmail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { sendVerificationEmail };
