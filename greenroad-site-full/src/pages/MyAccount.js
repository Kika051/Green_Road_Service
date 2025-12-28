import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  MapPin,
  FileDown,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const MyAccount = () => {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return;

      try {
        const snapshot = await getDocs(collection(db, "bookings"));
        const allBookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = allBookings.filter(
          (booking) => booking.clientId === user.uid
        );

        setBookings(filtered);
      } catch (error) {
        console.error("❌ Erreur Firestore :", error);
      }
    };

    fetchBookings();
  }, [user]);

  // ✅ Fonction pour formater la date (gère datetime ET date)
  const formatDate = (booking) => {
    const dateField = booking.datetime || booking.date;

    if (!dateField) return "Date inconnue";

    try {
      if (dateField?.toDate && typeof dateField.toDate === "function") {
        return dateField.toDate().toLocaleString("fr-FR");
      }
      if (dateField?._seconds) {
        return new Date(dateField._seconds * 1000).toLocaleString("fr-FR");
      }
      if (typeof dateField === "string") {
        return new Date(dateField).toLocaleString("fr-FR");
      }
      if (dateField instanceof Date) {
        return dateField.toLocaleString("fr-FR");
      }
      return "Date inconnue";
    } catch (e) {
      return "Date inconnue";
    }
  };

  // ✅ Fonction pour obtenir la date ISO
  const getDateISO = (booking) => {
    const dateField = booking.datetime || booking.date;

    if (!dateField) return new Date().toISOString();

    try {
      if (dateField?.toDate && typeof dateField.toDate === "function") {
        return dateField.toDate().toISOString();
      }
      if (dateField?._seconds) {
        return new Date(dateField._seconds * 1000).toISOString();
      }
      if (typeof dateField === "string") {
        return new Date(dateField).toISOString();
      }
      if (dateField instanceof Date) {
        return dateField.toISOString();
      }
      return new Date().toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  // ✅ Fonction pour nettoyer les km
  const formatKilometers = (km) => {
    if (!km) return "?";
    if (typeof km === "number") return km;
    if (typeof km === "string") {
      return km.replace(/\s*km\s*/gi, "").trim();
    }
    return km;
  };

  // Fonction pour générer un nouveau lien de paiement
  const handlePayment = async (bookingId) => {
    setLoadingPayment(bookingId);

    try {
      const response = await fetch(
        "https://us-central1-green-road-servicesvtc.cloudfunctions.net/api/generateStripeLink",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(
          "Erreur : " +
            (data.error || "Impossible de générer le lien de paiement.")
        );
      }
    } catch (error) {
      console.error("❌ Erreur paiement:", error);
      alert("Erreur lors de la redirection vers le paiement.");
    }

    setLoadingPayment(null);
  };

  // ✅ Télécharger facture avec toutes les infos
  const downloadInvoice = async (booking) => {
    try {
      const response = await fetch(
        "https://us-central1-green-road-servicesvtc.cloudfunctions.net/api/generateInvoice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber: booking.id,
            date: new Date().toLocaleDateString("fr-FR"),
            email: user?.email || "client inconnu",
            clientName: booking.clientName || user?.displayName || user?.email, // ✅ Nom
            phone: booking.phone || "", // ✅ Téléphone
            pickup: booking.pickup,
            dropoff: booking.dropoff,
            datetime: getDateISO(booking), // ✅ Date corrigée
            paymentAt:
              booking.paymentAt?.toDate instanceof Function
                ? booking.paymentAt.toDate().toISOString()
                : booking.paymentAt || new Date().toISOString(),
            createdAt:
              booking.createdAt?.toDate instanceof Function
                ? booking.createdAt.toDate().toISOString()
                : booking.createdAt || new Date().toISOString(),
            passengers: booking.passengers,
            carSeat: booking.carSeat,
            carSeatCount: booking.carSeatCount,
            price: booking.price,
            kilometers: formatKilometers(booking.kilometers), // ✅ Km nettoyés
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur génération PDF : ${text}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Téléchargement facture :", error);
      alert("Erreur lors du téléchargement de la facture.");
    }
  };

  const CourseCard = ({ booking, showPayButton, showInvoiceButton }) => (
    <div className="border border-zinc-700 bg-zinc-900 p-4 rounded-xl shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium">
            <MapPin className="inline-block mr-2" size={16} />
            {booking.pickup} ➔ {booking.dropoff}
          </p>
          {/* ✅ Date corrigée */}
          <p className="text-sm text-zinc-400 mt-1">{formatDate(booking)}</p>
          {/* ✅ Km nettoyés */}
          <p className="text-sm text-zinc-400">
            {booking.passengers} passager
            {booking.passengers > 1 ? "s" : ""} •{" "}
            {formatKilometers(booking.kilometers)} km
          </p>
          {/* Forfait info */}
          {booking.type === "forfait" && (
            <p className="text-green-400 text-sm mt-1">
              🎫 Forfait : {booking.forfaitNom}
            </p>
          )}
          {booking.allerRetour && (
            <p className="text-blue-400 text-sm">↔️ Aller-retour</p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <span className="text-right font-semibold text-lg">
            {booking.price} €
          </span>

          {showPayButton && (
            <button
              onClick={() => handlePayment(booking.id)}
              disabled={loadingPayment === booking.id}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition disabled:opacity-50"
            >
              {loadingPayment === booking.id ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />{" "}
                  Chargement...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 w-4 h-4" /> Payer
                </>
              )}
            </button>
          )}

          {showInvoiceButton && (
            <button
              onClick={() => downloadInvoice(booking)}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
            >
              <FileDown className="mr-1 w-4 h-4" /> Facture PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const filterByStatus = (status) =>
    bookings.filter((b) => b.status === status);

  const sections = [
    {
      title: "Courses en attente",
      icon: <Clock className="mr-2 text-yellow-500" size={20} />,
      color: "text-yellow-500",
      bookings: filterByStatus("en_attente"),
      showPay: false,
      showInvoice: false,
      message: "En attente de validation par notre chauffeur...",
    },
    {
      title: "Courses acceptées - Paiement requis",
      icon: <CheckCircle className="mr-2 text-blue-500" size={20} />,
      color: "text-blue-500",
      bookings: filterByStatus("acceptee"),
      showPay: true,
      showInvoice: false,
    },
    {
      title: "Courses confirmées",
      icon: <CheckCircle className="mr-2 text-green-500" size={20} />,
      color: "text-green-500",
      bookings: filterByStatus("payee"),
      showPay: false,
      showInvoice: true,
    },
    {
      title: "Courses refusées",
      icon: <XCircle className="mr-2 text-red-500" size={20} />,
      color: "text-red-500",
      bookings: filterByStatus("refuse"),
      showPay: false,
      showInvoice: false,
    },
  ];

  if (!user) {
    return <p className="p-6 text-yellow-400">Chargement utilisateur...</p>;
  }

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mes courses</h2>

      {bookings.length === 0 ? (
        <p className="text-zinc-400">Aucune course réservée pour l'instant.</p>
      ) : (
        <div className="space-y-8">
          {sections.map(
            ({ title, icon, color, bookings, showPay, showInvoice, message }) =>
              bookings.length > 0 && (
                <div key={title}>
                  <h3
                    className={`text-xl font-semibold mb-3 flex items-center ${color}`}
                  >
                    {icon}
                    <span>{title}</span>
                    <span className="ml-2 text-sm text-zinc-400">
                      ({bookings.length})
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <CourseCard
                        key={b.id}
                        booking={b}
                        showPayButton={showPay}
                        showInvoiceButton={showInvoice}
                      />
                    ))}
                  </div>

                  {message && (
                    <p className="text-sm text-zinc-500 mt-2">{message}</p>
                  )}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default MyAccount;
