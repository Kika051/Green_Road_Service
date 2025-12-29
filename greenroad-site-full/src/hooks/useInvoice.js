import { useState, useCallback } from 'react';
import { API_URL } from '../utils/constants';
import { formatKilometers, getBookingDateISO } from '../utils/formatters';

/**
 * Hook réutilisable pour générer et télécharger des factures
 * @returns {Object} { loading, downloadInvoice, downloadBonCommande }
 */
const useInvoice = () => {
  const [loading, setLoading] = useState(false);

  // Télécharger un blob
  const downloadBlob = useCallback((blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  // Générer facture
  const downloadInvoice = useCallback(async (booking, user) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/generateInvoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: booking.id,
          date: new Date().toLocaleDateString('fr-FR'),
          email: user?.email || booking.email,
          clientName: booking.clientName || user?.displayName || user?.email,
          phone: booking.phone || '',
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          datetime: getBookingDateISO(booking),
          paymentAt: booking.paymentAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          createdAt: booking.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          passengers: booking.passengers,
          carSeat: booking.carSeat,
          carSeatCount: booking.carSeatCount,
          price: booking.price,
          kilometers: formatKilometers(booking.kilometers),
        }),
      });

      if (!response.ok) throw new Error('Erreur génération PDF');

      const blob = await response.blob();
      downloadBlob(blob, `facture-${booking.id}.pdf`);
      return { success: true };
    } catch (error) {
      console.error('Erreur facture:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [downloadBlob]);

  // Télécharger bon de commande (chauffeur)
  const downloadBonCommande = useCallback(async (booking) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/generateInvoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: booking.id,
          date: new Date().toLocaleDateString('fr-FR'),
          email: booking.email,
          clientName: booking.clientName || booking.email,
          phone: booking.phone || '',
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          datetime: getBookingDateISO(booking),
          paymentAt: booking.paymentAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          passengers: booking.passengers,
          carSeat: booking.carSeat,
          carSeatCount: booking.carSeatCount,
          price: booking.price,
          kilometers: formatKilometers(booking.kilometers),
          type: 'bon_commande',
        }),
      });

      if (!response.ok) throw new Error('Erreur génération PDF');

      const blob = await response.blob();
      downloadBlob(blob, `bon-commande-${booking.id}.pdf`);
      return { success: true };
    } catch (error) {
      console.error('Erreur bon de commande:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [downloadBlob]);

  return { loading, downloadInvoice, downloadBonCommande };
};

export default useInvoice;
