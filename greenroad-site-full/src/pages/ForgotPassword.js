import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import {
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email, {
        url: "https://green-road-services.fr/login",
        handleCodeInApp: false,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Erreur reset password:", err);
      if (err.code === "auth/user-not-found") {
        setError("Aucun compte trouvé avec cette adresse email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Adresse email invalide.");
      } else {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          Retour à la connexion
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="text-green-500">Green</span>RoadServices
          </h1>
          <p className="text-zinc-400 mt-2">Réinitialiser votre mot de passe</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Email envoyé !
              </h2>
              <p className="text-zinc-400 mb-6">
                Un email de réinitialisation a été envoyé à{" "}
                <strong className="text-white">{email}</strong>. Vérifiez votre
                boîte mail et suivez les instructions.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <p className="text-zinc-400 mb-6 text-center">
                Entrez votre adresse email et nous vous enverrons un lien pour
                réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    <Mail className="inline mr-2" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    placeholder="votre@email.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={18} />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
