const admin = require("firebase-admin");
const db = admin.firestore();

exports.createUserProfile = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  const {
    uid,
    email,
    firstName,
    lastName,
    phone,
    birthDate,
    role = ["client"],
  } = req.body;

  if (!uid || !email || !firstName || !lastName || !phone || !birthDate) {
    return res.status(400).json({
      success: false,
      error: "Tous les champs requis doivent être fournis.",
    });
  }

  try {
    await db.collection("users").doc(uid).set({
      email,
      firstName,
      lastName,
      phone,
      birthDate,
      role,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Profil utilisateur créé avec succès.",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du profil :", error);
    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors de la création du profil.",
    });
  }
};
