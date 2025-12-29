import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

/**
 * Hook réutilisable pour l'authentification
 * @returns {Object} { user, roles, loading, isAdmin, isDriver, canAccessDashboard, logout }
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const userRoles = snap.data().role || [];
          setRoles(Array.isArray(userRoles) ? userRoles : [userRoles]);
        }
      } catch (e) {
        console.error('Erreur récupération rôles:', e);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    window.location.href = '/';
  }, []);

  // Helpers calculés
  const isAdmin = roles.includes('admin');
  const isDriver = roles.includes('driver') || roles.includes('chauffeur');
  const canAccessDashboard = isAdmin || isDriver;

  return {
    user,
    roles,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isDriver,
    canAccessDashboard,
    logout,
  };
};

export default useAuth;
