const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

admin.initializeApp();

// ✅ Création d'un app express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Import des handlers
const { createQuote } = require("./handlers/createQuote");
const { createUserProfile } = require("./handlers/createUserProfile");
const { generateInvoice } = require("./handlers/generateInvoice");
const { generateStripeLink } = require("./handlers/generateStripeLink");
const { stripeWebhook } = require("./handlers/stripeWebhook");
const { createBookingRequest } = require("./handlers/createBookingRequest");
const { validateBooking } = require("./handlers/validateBooking");
const { requestAvailability } = require("./handlers/requestAvailability");
const { refuseBooking } = require("./handlers/refuseBooking");
const { cancelBooking } = require("./handlers/cancelBooking");

// ✅ Définition des routes express
app.post("/createQuote", createQuote);
app.post("/createUserProfile", createUserProfile);
app.post("/createBookingRequest", createBookingRequest);
app.post("/generateStripeLink", generateStripeLink);
app.post("/generateInvoice", generateInvoice);
app.post("/validateBooking", validateBooking);
app.post("/requestAvailability", requestAvailability);
app.post("/refuseBooking", refuseBooking);
app.post("/cancelBooking", cancelBooking);

// ✅ Export des fonctions Firebase
exports.api = functions.https.onRequest(app);

// ✅ Webhook Stripe - Export direct de la fonction v1
exports.stripeWebhook = stripeWebhook;
