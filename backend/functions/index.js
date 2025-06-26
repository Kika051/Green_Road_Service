require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });

exports.createQuote = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { pickup, dropoff, stops = [] } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        error: "pickup et dropoff requis",
      });
    }

    try {
      // Appel à Google Maps Distance Matrix API
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        pickup
      )}&destinations=${encodeURIComponent(
        dropoff
      )}&mode=driving&units=metric&key=${apiKey}`;

      const result = await axios.get(url);
      const element = result.data.rows[0].elements[0];

      if (element.status !== "OK") {
        throw new Error("Distance Matrix API a échoué");
      }

      const distanceKm = element.distance.value / 1000; // en km
      const basePrice = distanceKm * 2;
      const price = basePrice < 20 ? 20 : basePrice;

      const quote = {
        pickup,
        dropoff,
        stops,
        kilometers: distanceKm.toFixed(2),
        price: price.toFixed(2),
        createdAt: new Date().toISOString(),
      };

      return res.status(200).json({ success: true, quote });
    } catch (error) {
      console.error("Erreur backend :", error.message);
      return res.status(500).json({
        success: false,
        error: "Erreur interne backend",
      });
    }
  });
});

exports.testKey = functions.https.onRequest((req, res) => {
  const key = functions.config().google.key;
  res.send(`Clé récupérée : ${key ? "OK ✅" : "Non chargée ❌"}`);
});
