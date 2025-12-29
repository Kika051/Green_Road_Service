/**
 * Formate une date Firestore en string lisible
 */
export const formatDate = (dateField, locale = 'fr-FR') => {
  if (!dateField) return 'Date inconnue';

  try {
    if (dateField?.toDate) return dateField.toDate().toLocaleString(locale);
    if (dateField?._seconds) return new Date(dateField._seconds * 1000).toLocaleString(locale);
    if (typeof dateField === 'string') return new Date(dateField).toLocaleString(locale);
    if (dateField instanceof Date) return dateField.toLocaleString(locale);
    return 'Date inconnue';
  } catch {
    return 'Date inconnue';
  }
};

/**
 * Obtient la date ISO d'un booking
 */
export const getBookingDateISO = (booking) => {
  const dateField = booking.datetime || booking.date;
  if (!dateField) return new Date().toISOString();

  try {
    if (dateField?.toDate) return dateField.toDate().toISOString();
    if (dateField?._seconds) return new Date(dateField._seconds * 1000).toISOString();
    if (typeof dateField === 'string') return new Date(dateField).toISOString();
    if (dateField instanceof Date) return dateField.toISOString();
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
};

/**
 * Formate la date d'un booking
 */
export const formatBookingDate = (booking, locale = 'fr-FR') => {
  return formatDate(booking.datetime || booking.date, locale);
};

/**
 * Nettoie les kilomètres
 */
export const formatKilometers = (km) => {
  if (!km && km !== 0) return '?';
  if (typeof km === 'number') return km;
  if (typeof km === 'string') return km.replace(/\s*km\s*/gi, '').trim();
  return km;
};
