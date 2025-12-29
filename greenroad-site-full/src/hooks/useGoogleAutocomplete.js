import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook réutilisable pour Google Places Autocomplete
 * @param {Function} onPlaceSelect - Callback appelé quand une adresse est sélectionnée
 * @param {Object} options - Options Google Places
 * @returns {Object} { inputRef }
 */
const useGoogleAutocomplete = (onPlaceSelect, options = {}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const defaultOptions = {
    types: ['geocode'],
    componentRestrictions: { country: 'fr' },
    ...options,
  };

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      defaultOptions
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address && onPlaceSelect) {
        onPlaceSelect(place.formatted_address);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  return { inputRef };
};

export default useGoogleAutocomplete;
