import React from "react";
import { CheckCircle } from "lucide-react";

export default function AdminConfirmPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <CheckCircle size={64} className="text-green-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Course acceptée</h1>
      <p className="text-center text-gray-600 max-w-md">
        Le client a reçu le lien de paiement. Vous pouvez suivre l’évolution
        depuis votre espace admin.
      </p>
    </div>
  );
}
