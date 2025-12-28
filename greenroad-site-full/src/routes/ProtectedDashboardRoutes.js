import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedDashboardRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      const roles = snap.exists() ? snap.data().role || [] : [];

      setAuthorized(roles.includes("admin") || roles.includes("driver"));
    });

    return () => unsub();
  }, []);

  if (authorized === null) return null;

  if (!authorized) return <Navigate to="/" replace />;

  return children;
}
