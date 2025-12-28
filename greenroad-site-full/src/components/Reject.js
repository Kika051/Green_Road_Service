import React from "react";
import { XCircle } from "lucide-react";

export default function AdminRejectPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <XCircle size={64} className="text-red-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Course refusée</h1>
      <p className="text-center text-gray-600 max-w-md">
        Le client a été informé par e-mail que la course n’a pas été acceptée.
      </p>
    </div>
  );
}
