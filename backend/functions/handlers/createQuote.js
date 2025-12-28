const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors");

const corsHandler = cors({
  origin: true,
  methods: ["POST", "OPTIONS"],
  credentials: true,
});

exports.createQuote = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // ✅ Gérer les requêtes preflight (OPTIONS)
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    // ❌ Méthode non autorisée
    if (req.method !== "POST") {
      return res.status(405).send("Méthode non autorisée");
    }

    const { pickup, dropoff, stops = [] } = req.body;

    // ⚠️ Champs obligatoires
    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        error: "Les champs 'pickup' et 'dropoff' sont obligatoires.",
      });
    }

    try {
      // 🔑 Clé API Google Maps
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        pickup
      )}&destinations=${encodeURIComponent(
        dropoff
      )}&mode=driving&units=metric&key=${apiKey}`;

      // 📡 Appel à l’API Distance Matrix
      const response = await axios.get(url);
      const element = response.data?.rows?.[0]?.elements?.[0];

      if (!element || element.status !== "OK") {
        throw new Error("La réponse de Google Maps est invalide.");
      }

      const distanceKm = element.distance.value / 1000;
      const basePrice = distanceKm * 2;
      const finalPrice = basePrice < 20 ? 20 : basePrice;

      // 🧾 Structure du devis
      const quote = {
        pickup,
        dropoff,
        stops,
        kilometers: distanceKm.toFixed(2),
        price: finalPrice.toFixed(2),
        createdAt: new Date().toISOString(),
      };

      return res.status(200).json({ success: true, quote });
    } catch (error) {
      console.error("❌ Erreur lors de la génération du devis :", error);
      return res.status(500).json({
        success: false,
        error: "Une erreur est survenue lors du calcul du devis.",
      });
    }
  });
});
