const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

const db = admin.firestore();

// Configuration email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Frais d'annulation (pourcentage du prix)
const CANCELLATION_FEE_PERCENT = 30;
const CANCELLATION_DELAY_HOURS = 5;

exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId, cancelledBy, reason } = req.body;

    if (!bookingId || !cancelledBy) {
      return res.status(400).json({
        success: false,
        error: "bookingId et cancelledBy sont requis",
      });
    }

    // Récupérer la réservation
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({
        success: false,
        error: "Réservation introuvable",
      });
    }

    const booking = bookingSnap.data();

    // Vérifier si annulation possible
    if (booking.status === "refuse" || booking.status === "annulee") {
      return res.status(400).json({
        success: false,
        error: "Cette réservation ne peut pas être annulée",
      });
    }

    const now = new Date();
    const bookingDate = booking.datetime?.toDate() || new Date(booking.date);
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

    let refundAmount = 0;
    let cancellationFee = 0;
    let refundStatus = "none";

    // Logique de remboursement
    if (cancelledBy === "driver") {
      if (booking.status === "payee" && booking.stripePaymentIntentId) {
        refundAmount = Math.round(booking.prix * 100);
        refundStatus = "full";

        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: refundAmount,
        });
      }
    } else if (cancelledBy === "client") {
      if (booking.status === "payee" && booking.stripePaymentIntentId) {
        if (hoursUntilBooking < CANCELLATION_DELAY_HOURS) {
          cancellationFee = Math.round(
            booking.prix * (CANCELLATION_FEE_PERCENT / 100)
          );
          refundAmount = Math.round((booking.prix - cancellationFee) * 100);
          refundStatus = "partial";

          await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: refundAmount,
          });
        } else {
          refundAmount = Math.round(booking.prix * 100);
          refundStatus = "full";

          await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: refundAmount,
          });
        }
      }
    }

    // Mettre à jour la réservation
    await bookingRef.update({
      status: "annulee",
      cancelledBy: cancelledBy,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancellationReason: reason || "Non spécifié",
      refundAmount: refundAmount / 100,
      cancellationFee: cancellationFee,
      refundStatus: refundStatus,
    });

    // Envoyer email au client
    const clientEmailContent =
      cancelledBy === "driver"
        ? `
      <h2>Votre course a été annulée par le chauffeur</h2>
      <p>Nous sommes désolés, votre course du ${bookingDate.toLocaleDateString(
        "fr-FR"
      )} a été annulée par le chauffeur.</p>
      <p><strong>Trajet :</strong> ${booking.pickup} → ${booking.dropoff}</p>
      ${
        refundStatus !== "none"
          ? `<p><strong>Remboursement :</strong> ${
              refundAmount / 100
            }€ (total)</p>`
          : ""
      }
      <p>Raison : ${reason || "Non spécifiée"}</p>
    `
        : `
      <h2>Confirmation d'annulation de votre course</h2>
      <p>Votre course du ${bookingDate.toLocaleDateString(
        "fr-FR"
      )} a bien été annulée.</p>
      <p><strong>Trajet :</strong> ${booking.pickup} → ${booking.dropoff}</p>
      ${
        refundStatus === "full"
          ? `<p><strong>Remboursement :</strong> ${
              refundAmount / 100
            }€ (total)</p>`
          : ""
      }
      ${
        refundStatus === "partial"
          ? `<p><strong>Frais d'annulation :</strong> ${cancellationFee}€<br>Remboursement : ${
              refundAmount / 100
            }€</p>`
          : ""
      }
    `;

    await transporter.sendMail({
      from: `"Green Road Services" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject:
        cancelledBy === "driver"
          ? "Course annulée par le chauffeur - Green Road Services"
          : "Confirmation d'annulation - Green Road Services",
      html: clientEmailContent,
    });

    if (cancelledBy === "client") {
      await transporter.sendMail({
        from: `"Green Road Services" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "Annulation de course - Green Road Services",
        html: `
          <h2>Une course a été annulée par le client</h2>
          <p><strong>Client :</strong> ${
            booking.clientName || booking.email
          }</p>
          <p><strong>Trajet :</strong> ${booking.pickup} → ${
          booking.dropoff
        }</p>
          <p><strong>Date :</strong> ${bookingDate.toLocaleDateString(
            "fr-FR"
          )}</p>
          <p><strong>Raison :</strong> ${reason || "Non spécifiée"}</p>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Réservation annulée avec succès",
      refundAmount: refundAmount / 100,
      cancellationFee: cancellationFee,
      refundStatus: refundStatus,
    });
  } catch (error) {
    console.error("Erreur annulation:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
