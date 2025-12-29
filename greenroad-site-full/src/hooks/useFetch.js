import { useState, useCallback } from 'react';

/**
 * Hook réutilisable pour les appels API
 * @returns {Object} { data, loading, error, fetchData, postData }
 */
const useFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur serveur');
      }

      setData(result);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const postData = useCallback(async (url, body) => {
    return fetchData(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, fetchData, postData, reset };
};

export default useFetch;
