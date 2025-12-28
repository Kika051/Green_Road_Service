import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import {
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Provider Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Créer le profil utilisateur dans Firestore
  const createUserProfile = async (user, displayName = null) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name:
            displayName || user.displayName || formData.name || "Utilisateur",
          photoURL: user.photoURL || null,
          provider: user.providerData[0]?.providerId || "email",
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          role: "client",
        });
      }

      return userSnap.exists() ? userSnap.data() : { role: "client" };
    } catch (err) {
      console.error("Erreur création profil:", err);
      // Ne pas bloquer l'inscription si Firestore échoue
      return { role: "client" };
    }
  };

  // Inscription avec email/password
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Veuillez entrer votre nom et prénom.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      // 1. Créer le compte
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log("✅ Compte créé:", userCredential.user.uid);

      // 2. Mettre à jour le displayName
      try {
        await updateProfile(userCredential.user, {
          displayName: formData.name.trim(),
        });
        console.log("✅ DisplayName mis à jour:", formData.name.trim());
      } catch (profileError) {
        console.warn("⚠️ Erreur updateProfile (non bloquant):", profileError);
      }

      // 3. Créer le profil Firestore
      try {
        await createUserProfile(userCredential.user, formData.name.trim());
        console.log("✅ Profil Firestore créé");
      } catch (firestoreError) {
        console.warn("⚠️ Erreur Firestore (non bloquant):", firestoreError);
      }

      // 4. Envoyer l'email de vérification
      try {
        await sendEmailVerification(userCredential.user, {
          url: window.location.origin + "/login?verified=true",
          handleCodeInApp: false,
        });
        console.log("✅ Email de vérification envoyé");

        setShowVerificationMessage(true);
        setSuccess(
          `✅ Compte créé avec succès ! Un email de confirmation a été envoyé à ${formData.email}. Veuillez cliquer sur le lien pour activer votre compte.`
        );
      } catch (emailError) {
        console.error("❌ Erreur envoi email:", emailError);

        // Même si l'email échoue, le compte est créé
        setShowVerificationMessage(true);
        setSuccess(
          `✅ Compte créé avec succès ! L'envoi de l'email de vérification a échoué. Vous pouvez demander un nouvel envoi depuis la page de connexion.`
        );
      }

      // 5. Déconnecter l'utilisateur jusqu'à vérification
      await auth.signOut();
    } catch (err) {
      console.error("❌ Erreur inscription:", err);

      if (err.code === "auth/email-already-in-use") {
        setError(
          "Cette adresse email est déjà utilisée. Essayez de vous connecter."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("Adresse email invalide.");
      } else if (err.code === "auth/weak-password") {
        setError("Mot de passe trop faible. Utilisez au moins 6 caractères.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Erreur réseau. Vérifiez votre connexion internet.");
      } else {
        setError(`Erreur lors de l'inscription: ${err.message}`);
      }
    }

    setLoading(false);
  };

  // Connexion avec email/password
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Récupérer le profil utilisateur pour vérifier le rôle
      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      // Bypass vérification email pour admin et chauffeur
      const isAdminOrDriver =
        userData?.role === "admin" ||
        userData?.role === "chauffeur" ||
        userData?.role === "driver";

      if (!userCredential.user.emailVerified && !isAdminOrDriver) {
        await auth.signOut();
        setError(
          "Votre adresse email n'est pas encore vérifiée. Veuillez consulter votre boîte mail et cliquer sur le lien de confirmation."
        );
        setLoading(false);
        return;
      }

      // Mettre à jour le statut emailVerified dans Firestore
      if (userCredential.user.emailVerified && userSnap.exists()) {
        await setDoc(userRef, { emailVerified: true }, { merge: true });
      }

      // Redirection selon le rôle
      if (isAdminOrDriver) {
        navigate("/dashboard");
      } else {
        navigate("/"); // ✅ Redirige vers l'accueil
      }
    } catch (err) {
      console.error("Erreur connexion:", err);
      if (err.code === "auth/user-not-found") {
        setError("Aucun compte trouvé avec cette adresse email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Mot de passe incorrect.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Email ou mot de passe incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Trop de tentatives. Veuillez réessayer dans quelques minutes."
        );
      } else if (err.code === "auth/network-request-failed") {
        setError("Erreur réseau. Vérifiez votre connexion internet.");
      } else {
        setError("Erreur de connexion. Veuillez réessayer.");
      }
    }

    setLoading(false);
  };

  // Connexion avec Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = await createUserProfile(result.user);

      // Redirection selon le rôle
      if (
        userData?.role === "admin" ||
        userData?.role === "chauffeur" ||
        userData?.role === "driver"
      ) {
        navigate("/dashboard");
      } else {
        navigate("/"); // ✅ Redirige vers l'accueil
      }
    } catch (err) {
      console.error("Erreur Google:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Connexion annulée.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Ce domaine n'est pas autorisé pour la connexion Google.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Erreur réseau. Vérifiez votre connexion internet.");
      } else {
        setError("Erreur de connexion avec Google. Veuillez réessayer.");
      }
    }

    setLoading(false);
  };

  // Renvoyer l'email de vérification
  const handleResendVerification = async () => {
    if (!formData.email || !formData.password) {
      setError(
        "Veuillez entrer votre email et mot de passe pour renvoyer l'email."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user, {
          url: window.location.origin + "/login?verified=true",
          handleCodeInApp: false,
        });
        setSuccess(
          "Un nouvel email de confirmation a été envoyé à " + formData.email
        );
        setShowVerificationMessage(true);
        setError("");
      } else {
        setSuccess("Votre email est déjà vérifié. Vous pouvez vous connecter.");
      }

      await auth.signOut();
    } catch (err) {
      console.error("Erreur renvoi email:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Trop de tentatives. Veuillez patienter quelques minutes.");
      } else {
        setError("Impossible de renvoyer l'email. Vérifiez vos identifiants.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="text-green-500">Green</span>RoadServices
          </h1>
          <p className="text-zinc-400 mt-2">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        {/* Message de vérification */}
        {showVerificationMessage && success && (
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle
                className="text-green-500 mt-0.5 flex-shrink-0"
                size={20}
              />
              <div>
                <p className="text-green-400 font-medium">
                  Vérifiez votre email
                </p>
                <p className="text-green-300 text-sm mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50 mb-6"
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
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="text-zinc-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          {/* Form */}
          <form
            onSubmit={isLogin ? handleLogin : handleSignUp}
            className="space-y-4"
          >
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  <User className="inline mr-2" size={16} />
                  Nom et prénom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Jean Dupont"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                <Mail className="inline mr-2" size={16} />
                Email
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

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                <Lock className="inline mr-2" size={16} />
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  <Lock className="inline mr-2" size={16} />
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="text-red-500 flex-shrink-0 mt-0.5"
                    size={18}
                  />
                  <div>
                    <p className="text-red-400 text-sm">{error}</p>
                    {error.includes("vérifiée") && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="text-red-300 hover:text-white text-sm underline mt-2"
                      >
                        Renvoyer l'email de confirmation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success message (sans vérification email) */}
            {success && !showVerificationMessage && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <p className="text-green-400 text-sm">{success}</p>
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
                  Chargement...
                </>
              ) : isLogin ? (
                "Se connecter"
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          {/* Toggle login/signup */}
          <p className="text-center text-zinc-400 mt-6">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
                setShowVerificationMessage(false);
              }}
              className="text-green-500 hover:text-green-400 ml-2 font-medium"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>

          {/* Forgot password */}
          {isLogin && (
            <p className="text-center mt-4">
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-zinc-500 hover:text-zinc-400 text-sm"
              >
                Mot de passe oublié ?
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          En continuant, vous acceptez nos{" "}
          <a href="/cgv" className="text-zinc-500 hover:text-zinc-400">
            Conditions Générales
          </a>{" "}
          et notre{" "}
          <a href="/privacy" className="text-zinc-500 hover:text-zinc-400">
            Politique de Confidentialité
          </a>
        </p>
      </div>
    </div>
  );
}
