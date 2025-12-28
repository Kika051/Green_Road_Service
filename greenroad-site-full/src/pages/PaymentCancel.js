import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-6">
      <div className="text-center max-w-md">
        <XCircle className="mx-auto text-red-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold mb-4">Paiement annulé</h1>
        <p className="text-zinc-400 mb-6">
          Votre paiement a été annulé. Vous pouvez réessayer à tout moment
          depuis votre compte.
        </p>
        <Link
          to="/account"
          className="inline-block bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Retour à mon compte
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
