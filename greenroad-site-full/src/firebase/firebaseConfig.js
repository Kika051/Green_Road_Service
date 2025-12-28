// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdjlN8SDGjg2nYCy-dTVsIGlNKX_a_KMU",
  authDomain: "green-road-servicesvtc.firebaseapp.com",
  projectId: "green-road-servicesvtc",
  storageBucket: "green-road-servicesvtc.appspot.com",
  messagingSenderId: "1029892955242",
  appId: "1:1029892955242:web:7a8cfdf2fe8482beeb3e13",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Providers pour connexion sociale
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account", // Force la sélection du compte Google
});

const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// ✅ CRA version (REACT_APP_...) pour activer ou non les émulateurs
if (
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  process.env.REACT_APP_USE_FIREBASE_EMULATOR === "true"
) {
  console.warn("🔥 Firebase Emulator activé !");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { app, auth, db, storage, googleProvider, appleProvider };
