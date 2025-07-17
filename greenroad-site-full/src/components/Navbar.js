// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // clean on unmount
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

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
          <Link to="/services">Services</Link>
        </li>
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
