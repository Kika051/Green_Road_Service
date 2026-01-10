const axios = require("axios");
const quoteCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const generateCacheKey = (pickup, dropoff) => {
  const normalizedPickup = pickup.toLowerCase().trim().replace(/\s+/g, " ");
  const normalizedDropoff = dropoff.toLowerCase().trim().replace(/\s+/g, " ");
  return `${normalizedPickup}|${normalizedDropoff}`;
};

// Nettoyage périodique du cache
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of quoteCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      quoteCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

const sanitizeAddress = (address) => {
  if (!address || typeof address !== "string") return null;
  if (address.length > 500) return null;
  return address
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[<>\"']/g, "");
};

const isValidAddress = (address) => {
  if (!address) return false;
  return address.length >= 5 && /[a-zA-ZÀ-ÿ]/.test(address);
};

exports.createQuote = async (req, res) => {
  try {
    const { pickup: rawPickup, dropoff: rawDropoff, stops = [] } = req.body;

    // Validation
    const pickup = sanitizeAddress(rawPickup);
    const dropoff = sanitizeAddress(rawDropoff);

    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        error: "Les champs 'pickup' et 'dropoff' sont obligatoires.",
      });
    }

    if (!isValidAddress(pickup) || !isValidAddress(dropoff)) {
      return res.status(400).json({
        success: false,
        error: "Les adresses fournies ne sont pas valides.",
      });
    }

    // Vérifier le cache
    const cacheKey = generateCacheKey(pickup, dropoff);
    const cachedQuote = quoteCache.get(cacheKey);

    if (cachedQuote && Date.now() - cachedQuote.timestamp < CACHE_DURATION) {
      console.log(`✅ Cache hit pour devis`);
      return res.status(200).json({
        success: true,
        quote: cachedQuote.quote,
        cached: true,
      });
    }

    // Appel Google Maps API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("❌ GOOGLE_MAPS_API_KEY non configurée");
      return res.status(500).json({
        success: false,
        error: "Erreur de configuration serveur.",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      pickup
    )}&destinations=${encodeURIComponent(
      dropoff
    )}&mode=driving&units=metric&key=${apiKey}`;

    const response = await axios.get(url, { timeout: 10000 });
    const element = response.data?.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      const errorMessages = {
        NOT_FOUND: "Une des adresses n'a pas été trouvée.",
        ZERO_RESULTS: "Aucun itinéraire trouvé entre ces deux adresses.",
        MAX_ROUTE_LENGTH_EXCEEDED: "La distance est trop grande.",
      };

      return res.status(400).json({
        success: false,
        error:
          errorMessages[element?.status] ||
          "Impossible de calculer l'itinéraire.",
      });
    }

    // Calcul du prix
    const distanceKm = element.distance.value / 1000;
    const durationMinutes = Math.ceil(element.duration.value / 60);
    const basePrice = distanceKm * 2;
    const finalPrice = Math.max(20, basePrice);

    const quote = {
      pickup,
      dropoff,
      stops,
      distance: parseFloat(distanceKm.toFixed(2)),
      kilometers: distanceKm.toFixed(2),
      duree: `${durationMinutes} min`,
      durationMinutes,
      prix: parseFloat(finalPrice.toFixed(2)),
      price: finalPrice.toFixed(2),
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder en cache
    quoteCache.set(cacheKey, {
      quote,
      timestamp: Date.now(),
    });

    console.log(
      `✅ Devis créé: ${distanceKm.toFixed(2)}km = ${finalPrice.toFixed(2)}€`
    );

    return res.status(200).json({
      success: true,
      quote,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Erreur createQuote:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        error:
          "Le service est temporairement indisponible. Veuillez réessayer.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors du calcul du devis.",
    });
  }
};
