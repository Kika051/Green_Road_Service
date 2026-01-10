const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const { rateLimit, validateFields } = require("./middlewares/security");

const { createQuote } = require("./handlers/createQuote");
const { createUserProfile } = require("./handlers/createUserProfile");
const { createBookingRequest } = require("./handlers/createBookingRequest");
const { generateStripeLink } = require("./handlers/generateStripeLink");
const { generateInvoice } = require("./handlers/generateInvoice");
const { validateBooking } = require("./handlers/validateBooking");
const { requestAvailability } = require("./handlers/requestAvailability");
const { refuseBooking } = require("./handlers/refuseBooking");
const { cancelBooking } = require("./handlers/cancelBooking");
const { sendVerificationEmail } = require("./handlers/sendVerificationEmail");
const {
  resendVerificationEmail,
} = require("./handlers/resendVerificationEmail");
const { sendPasswordResetEmail } = require("./handlers/sendPasswordResetEmail");
const { sendWelcomeEmail } = require("./handlers/sendWelcomeEmail");
const { stripeWebhook } = require("./handlers/stripeWebhook");

// 📊 Devis
app.post(
  "/createQuote",
  rateLimit(15, 60 * 60 * 1000, "quote"),
  validateFields(["pickup", "dropoff"]),
  createQuote
);

// 📝 Réservations
app.post(
  "/createBookingRequest",
  rateLimit(5, 60 * 60 * 1000, "booking"),
  validateFields(["email", "uid", "pickup", "dropoff", "datetime", "prix"]),
  createBookingRequest
);

// 👤 Profil utilisateur
app.post(
  "/createUserProfile",
  rateLimit(3, 60 * 60 * 1000, "profile"),
  createUserProfile
);

// 💳 Paiements
app.post(
  "/generateStripeLink",
  rateLimit(10, 60 * 60 * 1000, "payment"),
  validateFields(["bookingId"]),
  generateStripeLink
);

// 🧾 Factures
app.post(
  "/generateInvoice",
  rateLimit(10, 60 * 60 * 1000, "invoice"),
  generateInvoice
);

// ✅ Validation réservation (admin)
app.post(
  "/validateBooking",
  rateLimit(30, 60 * 60 * 1000, "admin"),
  validateFields(["bookingId"]),
  validateBooking
);

// ⏱️ Mise à disposition
app.post(
  "/requestAvailability",
  rateLimit(5, 60 * 60 * 1000, "availability"),
  requestAvailability
);

// ❌ Refus réservation (admin)
app.post(
  "/refuseBooking",
  rateLimit(30, 60 * 60 * 1000, "admin"),
  validateFields(["bookingId"]),
  refuseBooking
);

// 🚫 Annulation
app.post(
  "/cancelBooking",
  rateLimit(10, 60 * 60 * 1000, "cancel"),
  validateFields(["bookingId"]),
  cancelBooking
);

// 📧 Emails
app.post(
  "/sendVerificationEmail",
  rateLimit(3, 60 * 60 * 1000, "email"),
  validateFields(["email"]),
  sendVerificationEmail
);

app.post(
  "/resendVerificationEmail",
  rateLimit(3, 60 * 60 * 1000, "email"),
  validateFields(["email"]),
  resendVerificationEmail
);

app.post(
  "/sendPasswordResetEmail",
  rateLimit(3, 60 * 60 * 1000, "email"),
  validateFields(["email"]),
  sendPasswordResetEmail
);

app.post(
  "/sendWelcomeEmail",
  rateLimit(3, 60 * 60 * 1000, "email"),
  sendWelcomeEmail
);

exports.api = functions.region("europe-west1").https.onRequest(app);
exports.stripeWebhook = stripeWebhook;
