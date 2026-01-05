import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import {
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "../utils/constants";

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get("mode") === "signup";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ✅ Envoyer email de vérification via notre backend
  const sendCustomVerificationEmail = async (email, name) => {
    try {
      const response = await fetch(`${API_URL}/sendVerificationEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Erreur envoi email:", error);
      return false;
    }
  };

  // ✅ Renvoyer email de vérification
  const handleResendEmail = async () => {
    if (!resendEmail) return;

    setResendLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/resendVerificationEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMessage(t("auth.success.emailResent"));
        setSuccessEmail(resendEmail);
        setShowResendOption(false);
        setError("");
      } else if (data.alreadyVerified) {
        setError(t("auth.success.alreadyVerified"));
        setShowResendOption(false);
      } else {
        setError(data.error || t("auth.errors.genericError"));
      }
    } catch (error) {
      console.error("Erreur renvoi email:", error);
      setError(t("auth.errors.genericError"));
    }
    setResendLoading(false);
  };

  // ✅ Inscription
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSuccessEmail("");
    setShowResendOption(false);

    // Validations
    if (!formData.name.trim()) {
      setError(t("auth.errors.enterName"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }
    if (formData.password.length < 6) {
      setError(t("auth.errors.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Mettre à jour le profil avec le nom
      await updateProfile(user, { displayName: formData.name });

      // Créer le document client dans Firestore
      await setDoc(doc(db, "clients", user.uid), {
        email: formData.email,
        name: formData.name,
        role: "client",
        createdAt: Timestamp.now(),
        emailVerified: false,
      });

      // ✅ Envoyer notre email personnalisé (pas celui de Firebase)
      await sendCustomVerificationEmail(formData.email, formData.name);

      // Afficher le message de succès
      setSuccessMessage(t("auth.success.accountCreated"));
      setSuccessEmail(formData.email);

      // Déconnecter l'utilisateur (il doit vérifier son email)
      await auth.signOut();

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Erreur inscription:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError(t("auth.errors.emailInUse"));
          break;
        case "auth/invalid-email":
          setError(t("auth.errors.invalidEmail"));
          break;
        case "auth/weak-password":
          setError(t("auth.errors.weakPassword"));
          break;
        case "auth/network-request-failed":
          setError(t("auth.errors.networkError"));
          break;
        default:
          setError(t("auth.errors.genericError"));
      }
    }
    setLoading(false);
  };

  // ✅ Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSuccessEmail("");
    setShowResendOption(false);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Vérifier si l'email est vérifié
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setError(t("auth.errors.emailNotVerified"));
        setShowResendOption(true);
        setResendEmail(formData.email);
        setLoading(false);
        return;
      }

      // Connexion réussie
      navigate("/");
    } catch (err) {
      console.error("Erreur connexion:", err);
      switch (err.code) {
        case "auth/user-not-found":
          setError(t("auth.errors.userNotFound"));
          break;
        case "auth/wrong-password":
          setError(t("auth.errors.wrongPassword"));
          break;
        case "auth/invalid-credential":
          setError(t("auth.errors.invalidCredential"));
          break;
        case "auth/too-many-requests":
          setError(t("auth.errors.tooManyAttempts"));
          break;
        case "auth/network-request-failed":
          setError(t("auth.errors.networkError"));
          break;
        default:
          setError(t("auth.errors.genericError"));
      }
    }
    setLoading(false);
  };

  // ✅ Connexion Google
  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Créer/mettre à jour le document client
      await setDoc(
        doc(db, "clients", user.uid),
        {
          email: user.email,
          name: user.displayName || user.email,
          role: "client",
          createdAt: Timestamp.now(),
          emailVerified: true,
        },
        { merge: true }
      );

      navigate("/");
    } catch (err) {
      console.error("Erreur Google:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError(t("auth.errors.popupClosed"));
      } else if (err.code === "auth/unauthorized-domain") {
        setError(t("auth.errors.unauthorizedDomain"));
      } else {
        setError(t("auth.errors.googleError"));
      }
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
          <p className="text-zinc-400 mt-2">
            {isSignup ? t("auth.signupTitle") : t("auth.loginTitle")}
          </p>
        </div>

        {/* ✅ Message de succès */}
        {successMessage && (
          <div className="bg-green-900/30 border border-green-600 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle
                className="text-green-500 flex-shrink-0 mt-0.5"
                size={24}
              />
              <div>
                <p className="text-green-400 font-medium">{successMessage}</p>
                {successEmail && (
                  <p className="text-white font-semibold mt-2 bg-green-800/50 px-3 py-2 rounded inline-block">
                    📧 {successEmail}
                  </p>
                )}
                <p className="text-green-400/80 text-sm mt-3">
                  {t("auth.success.clickLink")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Message d'erreur */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="flex-1">
                <p className="text-red-400">{error}</p>

                {/* Option de renvoi d'email */}
                {showResendOption && (
                  <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="mt-3 flex items-center gap-2 text-sm bg-red-800/50 hover:bg-red-800 text-red-300 px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={resendLoading ? "animate-spin" : ""}
                    />
                    {resendLoading ? "Envoi..." : t("auth.resendEmail")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          {/* Bouton Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("auth.googleLogin")}
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-zinc-700"></div>
            <span className="px-4 text-zinc-500 text-sm">{t("auth.or")}</span>
            <div className="flex-1 border-t border-zinc-700"></div>
          </div>

          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="space-y-4"
          >
            {/* Nom (inscription seulement) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  <User className="inline mr-2" size={16} />
                  {t("auth.fullName")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                <Mail className="inline mr-2" size={16} />
                {t("auth.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                <Lock className="inline mr-2" size={16} />
                {t("auth.password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Confirmer mot de passe (inscription seulement) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  <Lock className="inline mr-2" size={16} />
                  {t("auth.confirmPassword")}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>
            )}

            {/* Mot de passe oublié (connexion seulement) */}
            {!isSignup && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw size={18} className="animate-spin" />}
              {loading
                ? t("auth.loading")
                : isSignup
                ? t("auth.signup")
                : t("auth.login")}
            </button>
          </form>

          {/* Lien vers l'autre mode */}
          <p className="text-center text-zinc-400 mt-6 text-sm">
            {isSignup ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
            <Link
              to={isSignup ? "/login" : "/login?mode=signup"}
              className="text-green-500 hover:text-green-400 font-medium"
            >
              {isSignup ? t("auth.loginLink") : t("auth.signupLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
