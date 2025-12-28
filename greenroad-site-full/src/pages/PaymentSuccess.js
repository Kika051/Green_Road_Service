import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-6">
      <div className="text-center max-w-md">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold mb-4">Paiement réussi ! 🎉</h1>
        <p className="text-zinc-400 mb-6">
          Votre course a été confirmée. Vous recevrez un email de confirmation.
        </p>
        <Link
          to="/account"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Voir mes courses
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
