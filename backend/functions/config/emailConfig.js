const nodemailer = require("nodemailer");

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "contact.greenroadservices@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "xxxx xxxx xxxx xxxx", // Mot de passe d'application
  },
});

// Informations de l'entreprise
const companyInfo = {
  name: "Green Road Services",
  email: "contact.greenroadservices@gmail.com",
  phone: "+33 6 18 71 05 34",
  address: "Tinqueux, France",
  website: "https://green-road-servicesvtc.web.app",
  logo: "https://green-road-servicesvtc.web.app/logo.png",
};

module.exports = {
  transporter,
  companyInfo,
};
