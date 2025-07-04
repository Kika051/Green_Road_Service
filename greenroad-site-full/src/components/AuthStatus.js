// src/components/AuthStatus.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AuthStatus() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="text-white">
      {user ? (
        <div>
          Connecté en tant que : <strong>{user.email}</strong>
          <button
            onClick={() => signOut(auth)}
            className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <p>Non connecté</p>
      )}
    </div>
  );
}
