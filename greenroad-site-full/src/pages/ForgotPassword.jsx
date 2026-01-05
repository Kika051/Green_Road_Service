import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "../utils/constants";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError(t("auth.errors.invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sendPasswordResetEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || t("auth.errors.genericError"));
      }
    } catch (error) {
      console.error("Erreur reset password:", error);
      setError(t("auth.errors.networkError"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-green-500">Green</span>
              <span className="text-white">RoadServices</span>
            </h1>
          </Link>
          <p className="text-zinc-400 mt-2">{t("auth.forgotPassword")}</p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="text-green-500 flex-shrink-0 mt-0.5"
                  size={24}
                />
                <div>
                  <p className="text-green-400 font-medium">
                    {t("auth.resetPassword.success")}
                  </p>
                  <p className="text-white font-semibold mt-2 bg-green-800/50 px-3 py-2 rounded inline-block">
                    📧 {email}
                  </p>
                  <p className="text-green-400/80 text-sm mt-3">
                    {t("auth.resetPassword.checkEmail")}
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-green-500 hover:text-green-400 font-medium"
            >
              <ArrowLeft size={18} />
              {t("auth.loginLink")}
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-600 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className="text-red-500 flex-shrink-0"
                    size={20}
                  />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            <p className="text-zinc-400 text-sm mb-6 text-center">
              {t("auth.resetPassword.description")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  <Mail className="inline mr-2" size={16} />
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw size={18} className="animate-spin" />}
                {loading ? t("auth.loading") : t("auth.resetPassword.submit")}
              </button>
            </form>

            <p className="text-center text-zinc-400 mt-6 text-sm">
              <Link
                to="/login"
                className="text-green-500 hover:text-green-400 font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                {t("auth.loginLink")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
