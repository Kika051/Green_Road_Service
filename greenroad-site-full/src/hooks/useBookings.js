import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { API_URL } from "../utils/constants";
import useFetch from "./useFetch";

/**
 * Hook réutilisable pour gérer les réservations
 * @param {string} userId - ID de l'utilisateur (optionnel, pour filtrer)
 * @returns {Object} { bookings, loading, acceptBooking, refuseBooking, generatePaymentLink }
 */
const useBookings = (userId = null) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { postData } = useFetch();

  // Écoute en temps réel des réservations
  useEffect(() => {
    const q = query(collection(db, "bookings"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrer par userId si fourni
      if (userId) {
        rides = rides.filter((b) => b.clientId === userId);
      }

      setBookings(rides);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Accepter une réservation
  const acceptBooking = useCallback(
    async (bookingId) => {
      return postData(`${API_URL}/validateBooking`, { bookingId });
    },
    [postData]
  );

  // Refuser une réservation
  const refuseBooking = useCallback(
    async (bookingId, reason = "Indisponibilité") => {
      return postData(`${API_URL}/refuseBooking`, { bookingId, reason });
    },
    [postData]
  );

  // Générer lien de paiement
  const generatePaymentLink = useCallback(
    async (bookingId) => {
      return postData(`${API_URL}/generateStripeLink`, { bookingId });
    },
    [postData]
  );

  // Filtrer par statut
  const filterByStatus = useCallback(
    (status) => {
      if (status === "en_attente") {
        return bookings.filter(
          (b) => b.status === "en_attente" && b.driverStatus === "pending"
        );
      }
      return bookings.filter((b) => b.status === status);
    },
    [bookings]
  );

  // Annuler une réservation
  const cancelBooking = useCallback(
    async (bookingId, cancelledBy, reason = "") => {
      return postData(`${API_URL}/cancelBooking`, {
        bookingId,
        cancelledBy,
        reason,
      });
    },
    [postData]
  );

  // N'oublie pas de l'ajouter au return
  return {
    bookings,
    loading,
    acceptBooking,
    refuseBooking,
    cancelBooking, // Ajouter ici
    generatePaymentLink,
    filterByStatus,
  };
};

export default useBookings;
