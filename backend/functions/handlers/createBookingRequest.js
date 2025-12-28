const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const cors = require("cors");
const corsHandler = cors({ origin: true });

exports.createBookingRequest = (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const {
        email,
        uid,
        clientName, // ✅ Nom du client
        phone, // ✅ Téléphone
        pickup,
        dropoff,
        datetime,
        passengers,
        carSeat,
        carSeatCount,
        prix,
        kilometers,
      } = req.body;

      if (!email || !uid || !pickup || !dropoff || !datetime || !prix) {
        return res.status(400).json({
          success: false,
          error: "Champs requis manquants.",
        });
      }

      const newBooking = {
        clientId: uid,
        email,
        clientName: clientName || email, // ✅ Sauvegarde le nom (ou email si pas de nom)
        phone: phone || "", // ✅ Sauvegarde le téléphone
        pickup,
        dropoff,
        datetime: new Date(datetime),
        passengers: parseInt(passengers),
        carSeat: carSeat === "oui" ? "oui" : "non",
        carSeatCount: parseInt(carSeatCount) || 0,
        price: parseFloat(prix),
        kilometers: parseFloat(kilometers),
        status: "en_attente",
        driverStatus: "pending",
        createdAt: Timestamp.now(),
      };

      const bookingRef = await admin
        .firestore()
        .collection("bookings")
        .add(newBooking);

      return res.status(200).json({
        success: true,
        message: "Demande enregistrée",
        bookingId: bookingRef.id,
      });
    } catch (error) {
      console.error("❌ Erreur createBookingRequest:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'enregistrement de la demande de course.",
      });
    }
  });
};
