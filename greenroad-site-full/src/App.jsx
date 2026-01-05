import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "./components";
import {
  Home,
  Booking,
  Services,
  Forfaits,
  MiseADisposition,
  MyAccount,
  Auth,
  ForgotPassword,
  DriverDashboard,
  PaymentSuccess,
  PaymentCancel,
  MentionsLegales,
  CGU,
  CGV,
  PolitiqueConfidentialite,
} from "./pages";
import ProtectedDashboardRoute from "./routes/ProtectedDashboardRoute";

const App = () => (
  <Router>
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/services" element={<Services />} />
          <Route path="/forfaits" element={<Forfaits />} />
          <Route path="/miseadisposition" element={<MiseADisposition />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route
            path="/politique-confidentialite"
            element={<PolitiqueConfidentialite />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedDashboardRoute>
                <DriverDashboard />
              </ProtectedDashboardRoute>
            }
          />
        </Routes>
      </main>
    </div>
    <Footer />
  </Router>
);

export default App;
