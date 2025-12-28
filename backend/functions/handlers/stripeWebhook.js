const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const db = admin.firestore();

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  console.log("🔔 Webhook Stripe appelé");

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ Pas de signature Stripe");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Signature vérifiée, événement:", event.type);
  } catch (err) {
    console.error("❌ Erreur signature Stripe:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;
    const bookingId = metadata?.bookingId;

    console.log("💳 Paiement réussi!");
    console.log("🆔 BookingId:", bookingId);

    try {
      if (bookingId && bookingId !== "") {
        await db.collection("bookings").doc(bookingId).update({
          status: "payee",
          paymentAt: admin.firestore.Timestamp.now(),
          stripePaymentId: session.payment_intent,
          stripeCheckoutUrl: null,
        });
        console.log("✅ Réservation mise à jour:", bookingId);
      } else {
        console.log("⚠️ Pas de bookingId dans metadata");
      }

      return res.status(200).send("OK");
    } catch (err) {
      console.error("❌ Erreur Firestore:", err);
      return res.status(500).send("Erreur mise à jour réservation");
    }
  }

  res.status(200).send("OK");
});
