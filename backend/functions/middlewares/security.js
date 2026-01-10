const rateLimitStore = new Map();

/**
 * Middleware de Rate Limiting
 * @param {number} maxRequests - Nombre max de requêtes
 * @param {number} windowMs - Fenêtre de temps en ms
 * @param {string} keyPrefix - Préfixe pour identifier le type de requête
 */
const rateLimit = (maxRequests, windowMs, keyPrefix = "global") => {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      "unknown";
    const userId = req.body?.uid || "anonymous";
    const key = `${keyPrefix}:${ip}:${userId}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    const validRequests = requests.filter(
      (timestamp) => timestamp > windowStart
    );
    rateLimitStore.set(key, validRequests);

    if (validRequests.length >= maxRequests) {
      console.warn(`⚠️ Rate limit atteint pour ${key}`);
      return res.status(429).json({
        success: false,
        error: "Trop de requêtes. Veuillez réessayer plus tard.",
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000),
      });
    }

    validRequests.push(now);
    rateLimitStore.set(key, validRequests);

    next();
  };
};

/**
 * Middleware pour valider les champs requis
 * @param {string[]} requiredFields - Liste des champs obligatoires
 */
const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Champs requis manquants: ${missing.join(", ")}`,
      });
    }
    next();
  };
};

/**
 * Middleware pour vérifier l'authentification Firebase (optionnel)
 */
const requireAuth = async (req, res, next) => {
  const admin = require("firebase-admin");
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (req.body?.uid) {
      return next();
    }
    return res.status(401).json({
      success: false,
      error: "Authentification requise",
    });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    if (req.body?.uid) {
      return next();
    }
    return res.status(401).json({
      success: false,
      error: "Token invalide",
    });
  }
};

// Nettoyage périodique du store (toutes les 10 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 2 * 60 * 60 * 1000; // 2 heures

  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(
      (timestamp) => timestamp > now - maxAge
    );
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
}, 10 * 60 * 1000);

module.exports = {
  rateLimit,
  validateFields,
  requireAuth,
};
