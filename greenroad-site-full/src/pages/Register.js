import React from "react";
import RegisterForm from "../components/RegisterForm"; // 🟢 Assure-toi que le nom du fichier est bien LoginForm.js ou LoginForm.jsx

export default function Login() {
  return (
    <div className="p-10">
      <RegisterForm /> {/* 🔥 Ton composant est bien inséré ici */}
    </div>
  );
}
