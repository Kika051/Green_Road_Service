import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Phone } from "lucide-react";

// URL réelle de tes Cloud Functions déployées
const backendUrl =
  "https://us-central1-green-road-servicesvtc.cloudfunctions.net/api";

export default function Booking() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [datetime, setDatetime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [phone, setPhone] = useState(""); // ✅ Ajout du téléphone
  const [carSeat, setCarSeat] = useState("non");
  const [carSeatCount, setCarSeatCount] = useState(1);
  const [prix, setPrix] = useState(null);
  const [kilometers, setKilometers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const navigate = useNavigate();

  // Autocomplete Google Maps
  useEffect(() => {
    if (!window.google || !window.google.maps?.places) return;

    const pickupAutocomplete = new window.google.maps.places.Autocomplete(
      pickupRef.current,
      { types: ["geocode"], componentRestrictions: { country: "fr" } }
    );
    pickupAutocomplete.addListener("place_changed", () => {
      const place = pickupAutocomplete.getPlace();
      setPickup(place.formatted_address || place.name);
    });

    const dropoffAutocomplete = new window.google.maps.places.Autocomplete(
      dropoffRef.current,
      { types: ["geocode"], componentRestrictions: { country: "fr" } }
    );
    dropoffAutocomplete.addListener("place_changed", () => {
      const place = dropoffAutocomplete.getPlace();
      setDropoff(place.formatted_address || place.name);
    });
  }, []);

  // Calculer devis
  const handleCalculate = async () => {
    if (!pickup || !dropoff) {
      alert("Merci de remplir les adresses.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/createQuote`, {
        pickup,
        dropoff,
        stops,
      });

      if (response.data.success) {
        setPrix(response.data.quote.price);
        setKilometers(response.data.quote.kilometers);
        setShowConfirmation(true);
      } else {
        alert("Erreur lors du calcul du prix.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur serveur.");
    }

    setLoading(false);
  };

  // Envoyer réservation
  const handleReservation = () => {
    console.log("🚀 handleReservation appelé");

    // Vérifier le téléphone
    if (!phone.trim()) {
      alert("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      console.log("👤 User:", user);

      if (!user) {
        console.log("❌ Pas d'utilisateur, redirection login");
        navigate("/login");
        return;
      }

      // ✅ Récupérer le nom du client (displayName pour Google, ou email)
      const clientName = user.displayName || user.email;

      console.log("📦 Envoi de la requête avec:", {
        email: user.email,
        uid: user.uid,
        clientName,
        phone,
        pickup,
        dropoff,
        datetime,
        passengers,
        prix,
        kilometers,
      });

      try {
        const response = await axios.post(
          `${backendUrl}/createBookingRequest`,
          {
            email: user.email,
            uid: user.uid,
            clientName, // ✅ Nom du client
            phone, // ✅ Téléphone
            pickup,
            dropoff,
            datetime,
            passengers: parseInt(passengers),
            carSeat,
            carSeatCount: carSeat === "oui" ? parseInt(carSeatCount) : 0,
            prix: parseFloat(prix),
            kilometers: parseFloat(kilometers),
          }
        );

        console.log("✅ Réponse:", response.data);

        if (response.data.success) {
          alert("Votre demande a bien été envoyée.");
          navigate("/account");
        } else {
          alert("Erreur lors de l'enregistrement.");
        }
      } catch (error) {
        console.error("❌ Erreur:", error);
        alert("Erreur serveur.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
      <h2 className="text-2xl font-semibold mb-6">Réserver une course</h2>

      <div className="w-full max-w-md mb-4">
        <input
          ref={pickupRef}
          type="text"
          placeholder="Adresse de prise en charge"
          className="text-black p-2 rounded w-full"
        />
      </div>

      <div className="w-full max-w-md mb-4">
        <input
          ref={dropoffRef}
          type="text"
          placeholder="Adresse de destination"
          className="text-black p-2 rounded w-full"
        />
      </div>

      <input
        type="datetime-local"
        className="text-black p-2 mb-4 rounded w-full max-w-md"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
      />

      {/* ✅ Champ téléphone */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center gap-2 mb-1 text-sm text-zinc-400">
          <Phone size={14} />
          <span>Numéro de téléphone *</span>
        </div>
        <input
          type="tel"
          placeholder="06 12 34 56 78"
          className="text-black p-2 rounded w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="text-xs text-zinc-500 mt-1">
          Pour vous contacter avant la prise en charge
        </p>
      </div>

      <select
        className="text-black p-2 mb-4 rounded w-full max-w-md"
        value={passengers}
        onChange={(e) => setPassengers(e.target.value)}
      >
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n} passager{n > 1 && "s"}
          </option>
        ))}
      </select>

      <select
        className="text-black p-2 mb-4 rounded w-full max-w-md"
        value={carSeat}
        onChange={(e) => setCarSeat(e.target.value)}
      >
        <option value="non">Siège auto : Non</option>
        <option value="oui">Siège auto : Oui</option>
      </select>

      {carSeat === "oui" && (
        <select
          className="text-black p-2 mb-4 rounded w-full max-w-md"
          value={carSeatCount}
          onChange={(e) => setCarSeatCount(e.target.value)}
        >
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>
              {n} siège{n > 1 && "s"}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleCalculate}
        className="bg-primary text-black font-bold px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Calcul..." : "Calculer le prix"}
      </button>

      {prix && (
        <div className="mt-6 bg-white text-black p-4 rounded shadow-lg">
          <p>
            Prix estimé : <strong>{prix} €</strong>
          </p>
          <p>
            Distance estimée : <strong>{kilometers} km</strong>
          </p>

          {showConfirmation && (
            <div className="mt-4">
              <p className="mb-2 font-medium">
                Souhaitez-vous réserver cette course ?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReservation}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Oui
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-400 text-black px-4 py-2 rounded"
                >
                  Non
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
