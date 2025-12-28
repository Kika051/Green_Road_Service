import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig";

import Home from "./pages/Home";
import Booking from "./pages/Booking";
import MyBooking from "./pages/MyBooking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import MyAccount from "./pages/MyAccount"; // page "Votre compte" à venir
import DriverDashboard from "./pages/DriverDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import ProtectedDashboardRoute from "./routes/ProtectedDashboardRoutes";
import Services from "./pages/Services";
import Forfaits from "./pages/Forfaits";
import MiseADisposition from "./pages/MiseADisposition";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/mybooking" element={<MyBooking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/cancel" element={<PaymentCancel />} />
        <Route path="/services" element={<Services />} />
        <Route path="/forfaits" element={<Forfaits />} />
        <Route path="/miseadisposition" element={<MiseADisposition />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedDashboardRoute>
              <DriverDashboard />
            </ProtectedDashboardRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
