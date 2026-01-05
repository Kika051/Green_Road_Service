const admin = require("firebase-admin");
const { sendEmail } = require("../services/emailService");
const { passwordResetEmailTemplate } = require("../templates/emailTemplates");
const { companyInfo } = require("../config/emailConfig");

/**
 * Envoyer un email de réinitialisation de mot de passe personnalisé
 */
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email requis",
      });
    }

    // Récupérer l'utilisateur Firebase
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return res.json({
        success: true,
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé",
      });
    }

    // Générer le lien de réinitialisation
    const resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: `${companyInfo.website}/login`,
    });

    // Générer le template HTML
    const htmlContent = passwordResetEmailTemplate(
      user.displayName || "Client",
      resetLink
    );

    // Envoyer l'email
    await sendEmail(
      email,
      "Réinitialisation de votre mot de passe - Green Road Services",
      htmlContent
    );

    res.json({
      success: true,
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    });
  } catch (error) {
    console.error("Erreur sendPasswordResetEmail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { sendPasswordResetEmail };
