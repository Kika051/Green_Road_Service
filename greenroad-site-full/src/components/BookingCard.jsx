import { MapPin, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBookingDate, formatKilometers } from '../utils/formatters';

/**
 * Carte de réservation réutilisable
 */
const BookingCard = ({ booking, actions, showClientInfo = false }) => {
  const { t } = useTranslation();

  return (
    <div className="border border-zinc-700 bg-zinc-900 p-4 rounded-xl shadow">
      <div className="flex justify-between items-start flex-wrap gap-4">
        {/* Infos trajet */}
        <div className="flex-1 min-w-0">
          <p className="font-medium flex items-start gap-2">
            <MapPin className="flex-shrink-0 mt-1" size={16} />
            <span>{booking.pickup} ➔ {booking.dropoff}</span>
          </p>
          <p className="text-sm text-zinc-400 mt-1">{formatBookingDate(booking)}</p>
          <p className="text-sm text-zinc-400">
            {booking.passengers} {t('common.passengers')} • {formatKilometers(booking.kilometers)} km
          </p>

          {/* Infos client (mode chauffeur) */}
          {showClientInfo && (
            <div className="mt-2 pt-2 border-t border-zinc-700">
              <p className="flex items-center gap-1 text-sm">
                <User size={14} className="text-zinc-400" />
                {booking.clientName || booking.email}
              </p>
              {booking.phone && (
                <p className="flex items-center gap-1 text-sm text-green-400">
                  <Phone size={14} />
                  <a href={`tel:${booking.phone}`} className="hover:underline">{booking.phone}</a>
                </p>
              )}
            </div>
          )}

          {/* Badges */}
          {booking.type === 'forfait' && (
            <p className="text-green-400 text-sm mt-1">🎫 {booking.forfaitNom}</p>
          )}
          {booking.allerRetour && (
            <p className="text-blue-400 text-sm">↔️ {t('common.roundTrip')}</p>
          )}
          {booking.commentaire && (
            <p className="text-yellow-400 text-sm mt-1">💬 {booking.commentaire}</p>
          )}
        </div>

        {/* Prix et actions */}
        <div className="flex flex-col gap-2 items-end">
          <span className="font-semibold text-lg">{booking.price} €</span>
          {actions}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
