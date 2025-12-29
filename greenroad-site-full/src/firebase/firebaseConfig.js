import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyBdjlN8SDGjg2nYCy-dTVsIGlNKX_a_KMU',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'green-road-servicesvtc.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'green-road-servicesvtc',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'green-road-servicesvtc.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '1029892955242',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:1029892955242:web:7a8cfdf2fe8482beeb3e13',
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Providers OAuth
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Connexion aux émulateurs en développement
if (
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true'
) {
  console.warn('🔥 Firebase Emulator activé !');
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
