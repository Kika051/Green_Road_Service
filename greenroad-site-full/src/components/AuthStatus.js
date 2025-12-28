// src/components/AuthStatus.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      setUser(u);

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setRoles(snap.data().role || []);
        } else {
          setRoles([]);
        }
      } catch (err) {
        console.error("Erreur récupération rôle :", err);
        setRoles([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  const isAdmin = roles.includes("admin");
  const isDriver = roles.includes("driver");
  const canAccessDashboard = isAdmin || isDriver;

  return (
    <div className="text-white flex items-center gap-4">
      {user ? (
        <>
          <span>
            Connecté : <strong>{user.email}</strong>
          </span>

          {canAccessDashboard && (
            <Link
              to="/dashboard"
              className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Déconnexion
          </button>
        </>
      ) : (
        <p>Non connecté</p>
      )}
    </div>
  );
}
