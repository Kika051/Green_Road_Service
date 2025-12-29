import { useState, useCallback } from 'react';

/**
 * Hook réutilisable pour gérer les formulaires
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @returns {Object} { values, errors, handleChange, handleSubmit, reset, setValues }
 */
const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effacer l'erreur du champ modifié
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const validate = useCallback((rules = {}) => {
    const newErrors = {};

    Object.keys(rules).forEach((field) => {
      const value = values[field];
      const fieldRules = rules[field];

      if (fieldRules.required && !value?.toString().trim()) {
        newErrors[field] = fieldRules.message || 'Ce champ est requis';
      }

      if (fieldRules.minLength && value?.length < fieldRules.minLength) {
        newErrors[field] = `Minimum ${fieldRules.minLength} caractères`;
      }

      if (fieldRules.email && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = 'Email invalide';
      }

      if (fieldRules.match && value !== values[fieldRules.match]) {
        newErrors[field] = fieldRules.matchMessage || 'Les valeurs ne correspondent pas';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    handleChange,
    setValue,
    setValues,
    reset,
    validate,
    setErrors,
  };
};

export default useForm;
