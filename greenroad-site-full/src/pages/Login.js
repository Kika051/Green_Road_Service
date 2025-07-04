import React from "react";
import LoginForm from "../components/LoginForm"; // 🟢 Assure-toi que le nom du fichier est bien LoginForm.js ou LoginForm.jsx

export default function Login() {
  return (
    <div className="p-10">
      <LoginForm /> {/* 🔥 Ton composant est bien inséré ici */}
    </div>
  );
}
