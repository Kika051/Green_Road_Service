const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const cors = require("cors");
const corsHandler = cors({ origin: true });
const { sendEmail } = require("../services/emailService");
const {
  newBookingNotificationTemplate,
} = require("../templates/emailTemplates");

exports.createBookingRequest = (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const {
        // Champs communs
        email,
        uid,
        clientName,
        phone,
        pickup,
        dropoff,
        datetime,
        passengers,
        prix,
        kilometers,
        // Champs course classique
        carSeat,
        carSeatCount,
        // Champs forfait
        type,
        forfaitId,
        forfaitNom,
        allerRetour,
        commentaire,
      } = req.body;

      // Validation
      if (!email || !uid || !pickup || !dropoff || !datetime || !prix) {
        return res.status(400).json({
          success: false,
          error: "Champs requis manquants.",
        });
      }

      // Construire l'objet booking selon le type
      const newBooking = {
        clientId: uid,
        email,
        clientName: clientName || email,
        phone: phone || "",
        pickup,
        dropoff,
        datetime: new Date(datetime),
        passengers: parseInt(passengers) || 1,
        prix: parseFloat(prix),
        kilometers: parseFloat(kilometers) || 0,
        status: "en_attente",
        driverStatus: "pending",
        createdAt: Timestamp.now(),
      };

      // Si c'est un forfait
      if (type === "forfait") {
        newBooking.type = "forfait";
        newBooking.forfaitId = forfaitId || "";
        newBooking.forfaitNom = forfaitNom || "";
        newBooking.allerRetour = allerRetour || false;
        newBooking.commentaire = commentaire || "";
      } else {
        // Course classique
        newBooking.type = "course";
        newBooking.carSeat = carSeat === "oui" ? "oui" : "non";
        newBooking.carSeatCount = parseInt(carSeatCount) || 0;
      }

      // Enregistrer dans Firestore
      const bookingRef = await admin
        .firestore()
        .collection("bookings")
        .add(newBooking);

      console.log(
        "✅ Réservation créée:",
        bookingRef.id,
        "| Type:",
        newBooking.type
      );

      // ✅ Envoyer notification email au chauffeur
      try {
        const htmlContent = newBookingNotificationTemplate({
          clientName: clientName || email,
          phone: phone || "Non renseigné",
          email,
          pickup,
          dropoff,
          datetime,
          passengers: parseInt(passengers) || 1,
          prix: parseFloat(prix),
          kilometers: parseFloat(kilometers) || 0,
          bookingId: bookingRef.id,
          type: type || "course",
          forfaitNom: forfaitNom || "",
          allerRetour: allerRetour || false,
        });

        // Sujet de l'email selon le type
        let subject = "🚗 Nouvelle demande de course !";
        if (type === "forfait") {
          subject = `🎫 Nouveau forfait${
            allerRetour ? " (A/R)" : ""
          } - ${forfaitNom}`;
        }

        await sendEmail(
          "contact.greenroadservices@gmail.com",
          subject,
          htmlContent
        );

        console.log("✅ Notification email envoyée au chauffeur");
      } catch (emailError) {
        console.error(
          "⚠️ Erreur envoi notification email:",
          emailError.message
        );
      }

      return res.status(200).json({
        success: true,
        message: "Demande enregistrée",
        bookingId: bookingRef.id,
      });
    } catch (error) {
      console.error("❌ Erreur createBookingRequest:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'enregistrement de la demande.",
      });
    }
  });
};
