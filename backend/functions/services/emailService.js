const { transporter, companyInfo } = require("../config/emailConfig");

/**
 * Envoyer un email
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Objet de l'email
 * @param {string} html - Contenu HTML de l'email
 * @returns {Promise<boolean>}
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"${companyInfo.name}" <${companyInfo.email}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à: ${to} | Sujet: ${subject}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error.message);
    return false;
  }
};

/**
 * Envoyer un email avec copie
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Objet de l'email
 * @param {string} html - Contenu HTML de l'email
 * @param {string} bcc - Copie cachée (optionnel)
 * @returns {Promise<boolean>}
 */
const sendEmailWithCopy = async (to, subject, html, bcc = null) => {
  try {
    const mailOptions = {
      from: `"${companyInfo.name}" <${companyInfo.email}>`,
      to,
      subject,
      html,
    };

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à: ${to} | Sujet: ${subject}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendEmailWithCopy,
};
