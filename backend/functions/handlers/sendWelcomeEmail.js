const { sendEmail } = require("../services/emailService");
const { welcomeEmailTemplate } = require("../templates/emailTemplates");

/**
 * Envoyer un email de bienvenue après vérification
 */
const sendWelcomeEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validation
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: "Email et nom sont requis",
      });
    }

    // Générer le template HTML
    const htmlContent = welcomeEmailTemplate(name);

    // Envoyer l'email
    const sent = await sendEmail(
      email,
      "Bienvenue chez Green Road Services ! 🎉",
      htmlContent
    );

    if (sent) {
      res.json({
        success: true,
        message: "Email de bienvenue envoyé",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Échec de l'envoi de l'email",
      });
    }
  } catch (error) {
    console.error("Erreur sendWelcomeEmail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { sendWelcomeEmail };
