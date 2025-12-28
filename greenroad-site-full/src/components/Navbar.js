import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRoles([]);
        return;
      }

      setUser(currentUser);

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          setRoles(snap.data().role || []);
        } else {
          setRoles([]);
        }
      } catch (e) {
        console.error("Erreur récupération rôles :", e);
        setRoles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const canAccessDashboard =
    roles.includes("admin") || roles.includes("driver");

  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 bg-black text-white">
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-green-500 text-2xl font-extrabold">G</span>
        <span className="text-white text-xl font-medium">
          GreenRoad<span className="font-bold">Services</span>
        </span>
      </Link>

      <ul className="flex gap-6 items-center">
        <li>
          <Link to="/Booking">Réserver</Link>
        </li>
        <li>
          <Link to="/forfaits">Forfaits</Link>
        </li>
        <li>
          <Link to="/miseadisposition">Mise à disposition</Link>
        </li>
        <li>
          <Link to="/services">Services</Link>
        </li>

        {canAccessDashboard && (
          <li>
            <Link to="/dashboard" className="text-green-400 font-semibold">
              Dashboard
            </Link>
          </li>
        )}

        {user ? (
          <>
            <li>
              <Link to="/account">Votre compte</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="text-red-400">
                Déconnexion
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Connexion</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
