// src/components/RegisterForm.js
import React, { useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!prenom || !nom || !telephone || !dateNaissance || !email) {
      alert("❌ Tous les champs doivent être remplis.");
      return;
    }

    // ✅ Vérification âge
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    const isMinor =
      age < 18 ||
      (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

    if (isMinor) {
      alert("❌ Inscription impossible : vous devez être majeur (18+)");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Les mots de passe ne sont pas identiques");
      return;
    }

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!regex.test(password)) {
      alert(
        "❌ Le mot de passe doit contenir au moins 10 caractères, une majuscule, un chiffre et un caractère spécial"
      );
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Compte créé avec succès !");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          "❌ Ce compte existe déjà. Redirection vers la page de connexion..."
        );
        window.location.href = "/login";
        return;
      }

      alert("❌ Erreur Firebase : " + error.message);
    }
  }; // ✅ <-- ici c'était manquant

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-primary">
          Créer un compte
        </h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <input
            type="tel"
            placeholder="Numéro de téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <input
            type="date"
            placeholder="Date de naissance"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
          />
          <button
            type="submit"
            className="bg-primary text-black py-3 rounded-lg font-semibold hover:opacity-90 transition duration-200"
          >
            S’inscrire
          </button>
        </form>
      </div>
    </div>
  );
}
