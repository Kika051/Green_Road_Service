import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { FileDown, Loader2, Phone, User } from "lucide-react";

const backendUrl =
  "https://us-central1-green-road-servicesvtc.cloudfunctions.net/api";

export default function DriverDashboard() {
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert("Vous devez être connecté pour accéder à ce tableau de bord.");
        window.location.href = "/login";
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "bookings"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllRides(rides);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fonction pour formater la date (gère datetime ET date)
  const formatDate = (ride) => {
    // Essayer datetime d'abord (Forfaits), puis date (Booking)
    const dateField = ride.datetime || ride.date;

    if (!dateField) return "Non précisée";

    try {
      // Si c'est un Timestamp Firestore
      if (dateField?.toDate && typeof dateField.toDate === "function") {
        return dateField.toDate().toLocaleString("fr-FR");
      }
      // Si c'est un objet avec _seconds (Timestamp sérialisé)
      if (dateField?._seconds) {
        return new Date(dateField._seconds * 1000).toLocaleString("fr-FR");
      }
      // Si c'est une string ISO
      if (typeof dateField === "string") {
        return new Date(dateField).toLocaleString("fr-FR");
      }
      // Si c'est déjà un Date
      if (dateField instanceof Date) {
        return dateField.toLocaleString("fr-FR");
      }
      return "Non précisée";
    } catch (e) {
      console.error("Erreur formatage date:", e);
      return "Non précisée";
    }
  };

  // ✅ Fonction pour obtenir la date ISO (pour le PDF)
  const getDateISO = (ride) => {
    const dateField = ride.datetime || ride.date;

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

  // ✅ Fonction pour nettoyer les km (enlever "km" si présent)
  const formatKilometers = (km) => {
    if (!km) return "?";
    if (typeof km === "number") return km;
    if (typeof km === "string") {
      return km.replace(/\s*km\s*/gi, "").trim();
    }
    return km;
  };

  // ✅ Accepter une course (avec notification email)
  const handleAccept = async (rideId) => {
    const user = auth.currentUser;
    if (!user) return alert("Vous devez être connecté.");

    const confirmAccept = window.confirm(
      "Accepter cette course ? Un email avec le lien de paiement sera envoyé au client."
    );
    if (!confirmAccept) return;

    setProcessingId(rideId);

    try {
      const response = await fetch(`${backendUrl}/validateBooking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: rideId }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          "✅ Course acceptée ! Le client a reçu un email avec le lien de paiement."
        );
      } else {
        alert(
          "❌ Erreur : " + (data.error || "Impossible d'accepter la course")
        );
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("Erreur serveur lors de l'acceptation.");
    }

    setProcessingId(null);
  };

  // ✅ Refuser une course (avec notification email)
  const handleRefuse = async (rideId) => {
    const user = auth.currentUser;
    if (!user) return alert("Vous devez être connecté.");

    const confirmRefuse = window.confirm(
      "Refuser cette course ? Un email sera envoyé au client pour l'informer."
    );
    if (!confirmRefuse) return;

    const reason = window.prompt(
      "Motif du refus (optionnel) :",
      "Indisponibilité du chauffeur"
    );

    setProcessingId(rideId);

    try {
      const response = await fetch(`${backendUrl}/refuseBooking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: rideId,
          reason: reason || "Indisponibilité",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Course refusée. Le client a été notifié par email.");
      } else {
        alert(
          "❌ Erreur : " + (data.error || "Impossible de refuser la course")
        );
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("Erreur serveur lors du refus.");
    }

    setProcessingId(null);
  };

  // ✅ Télécharger le bon de commande avec toutes les infos
  const downloadBonCommande = async (ride) => {
    try {
      const response = await fetch(`${backendUrl}/generateInvoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: ride.id,
          date: new Date().toLocaleDateString("fr-FR"),
          email: ride.email,
          clientName: ride.clientName || ride.email, // ✅ Nom du client
          phone: ride.phone || "", // ✅ Téléphone
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          datetime: getDateISO(ride), // ✅ Utilise la bonne date
          paymentAt:
            ride.paymentAt?.toDate?.().toISOString() ||
            ride.createdAt?.toDate?.().toISOString() ||
            new Date().toISOString(),
          passengers: ride.passengers,
          carSeat: ride.carSeat,
          carSeatCount: ride.carSeatCount,
          price: ride.price,
          kilometers: formatKilometers(ride.kilometers), // ✅ Nettoie les km
          type: "bon_commande",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur génération PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bon-commande-${ride.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Erreur téléchargement:", error);
      alert("Erreur lors du téléchargement du bon de commande.");
    }
  };

  const renderRides = (
    title,
    statusFilter,
    showActions = false,
    showBonCommande = false
  ) => {
    const rides = allRides.filter((ride) => {
      if (statusFilter === "en_attente") {
        return ride.status === "en_attente" && ride.driverStatus === "pending";
      }
      return ride.status === statusFilter;
    });

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({rides.length})
          </span>
        </h2>
        {rides.length === 0 ? (
          <p className="text-gray-400">Aucune course.</p>
        ) : (
          rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-gray-800 p-4 mb-4 rounded shadow border border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p>
                    <strong>Trajet :</strong> {ride.pickup} → {ride.dropoff}
                  </p>
                  {/* ✅ Date corrigée */}
                  <p>
                    <strong>Date :</strong> {formatDate(ride)}
                  </p>
                  <p>
                    <strong>Passagers :</strong> {ride.passengers}
                  </p>
                  {/* ✅ Distance nettoyée */}
                  <p>
                    <strong>Distance :</strong>{" "}
                    {formatKilometers(ride.kilometers)} km
                  </p>
                  <p>
                    <strong>Prix :</strong> {ride.price} €
                  </p>
                  {/* ✅ Nom du client */}
                  <p className="flex items-center gap-1">
                    <User size={14} className="text-zinc-400" />
                    <strong>Client :</strong> {ride.clientName || ride.email}
                  </p>
                  {/* ✅ Téléphone du client */}
                  {ride.phone && (
                    <p className="flex items-center gap-1 text-green-400">
                      <Phone size={14} />
                      <strong>Tél :</strong>{" "}
                      <a href={`tel:${ride.phone}`} className="hover:underline">
                        {ride.phone}
                      </a>
                    </p>
                  )}
                  {/* Email si différent du nom */}
                  {ride.clientName && ride.clientName !== ride.email && (
                    <p className="text-zinc-500 text-sm">📧 {ride.email}</p>
                  )}
                  {ride.type === "forfait" && (
                    <p className="text-green-400 text-sm mt-1">
                      🎫 Forfait : {ride.forfaitNom}
                    </p>
                  )}
                  {ride.allerRetour && (
                    <p className="text-blue-400 text-sm">↔️ Aller-retour</p>
                  )}
                  {ride.commentaire && (
                    <p className="text-yellow-400 text-sm mt-1">
                      💬 {ride.commentaire}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {showActions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(ride.id)}
                        disabled={processingId === ride.id}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-50 flex items-center"
                      >
                        {processingId === ride.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Accepter"
                        )}
                      </button>
                      <button
                        onClick={() => handleRefuse(ride.id)}
                        disabled={processingId === ride.id}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded disabled:opacity-50 flex items-center"
                      >
                        {processingId === ride.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Refuser"
                        )}
                      </button>
                    </div>
                  )}

                  {showBonCommande && (
                    <button
                      onClick={() => downloadBonCommande(ride)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      <FileDown className="mr-2 w-4 h-4" /> Bon de commande
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="text-white p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Chargement des courses...
      </div>
    );

  return (
    <div className="text-white p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord chauffeur</h1>
      {renderRides("🟡 Courses en attente", "en_attente", true, false)}
      {renderRides(
        "🔵 Courses acceptées (en attente de paiement)",
        "acceptee",
        false,
        false
      )}
      {renderRides("🟢 Courses confirmées (payées)", "payee", false, true)}
      {renderRides("🔴 Courses refusées", "refuse", false, false)}
    </div>
  );
}
