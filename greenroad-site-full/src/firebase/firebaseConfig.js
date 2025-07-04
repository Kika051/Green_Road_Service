import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdjlN8SDGjg2nYCy-dTVsIGlNKX_a_KMU",
  authDomain: "green-road-servicesvtc.firebaseapp.com",
  projectId: "green-road-servicesvtc",
  storageBucket: "green-road-servicesvtc.appspot.com", // ✅ correction ici
  messagingSenderId: "1029892955242",
  appId: "1:1029892955242:web:7a8cfdf2fe8482beeb3e13",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
