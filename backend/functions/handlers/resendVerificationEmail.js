const admin = require("firebase-admin");
const { sendEmail } = require("../services/emailService");
const {
  resendVerificationEmailTemplate,
} = require("../templates/emailTemplates");
const { companyInfo } = require("../config/emailConfig");

/**
 * Renvoyer un email de vérification
 */
const resendVerificationEmail = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        error: "Aucun compte trouvé avec cet email",
      });
    }

    // Vérifier si déjà vérifié
    if (user.emailVerified) {
      return res.json({
        success: false,
        error: "Email déjà vérifié",
        alreadyVerified: true,
      });
    }

    // Générer le lien de vérification
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        url: `${companyInfo.website}/login`,
      });

    // Générer le template HTML
    const htmlContent = resendVerificationEmailTemplate(
      user.displayName || "Client",
      verificationLink
    );

    // Envoyer l'email
    const sent = await sendEmail(
      email,
      "Confirmez votre adresse email - Green Road Services",
      htmlContent
    );

    if (sent) {
      res.json({
        success: true,
        message: "Email de vérification renvoyé",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Échec de l'envoi de l'email",
      });
    }
  } catch (error) {
    console.error("Erreur resendVerificationEmail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { resendVerificationEmail };
