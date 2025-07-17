import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const backendUrl =
  import.meta.env?.VITE_BACKEND_URL ||
  "http://127.0.0.1:5001/green-road-servicesvtc/us-central1";

export default function Booking() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [datetime, setDatetime] = useState("");
  const [passengers, setPassengers] = useState(1);
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

  useEffect(() => {
    if (!window.google || !window.google.maps?.places) {
      console.error("Google Maps API non chargée !");
      return;
    }

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

  const handleCalculate = async () => {
    if (!pickup || !dropoff) {
      alert("Merci d’indiquer un lieu de prise en charge et de destination.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/createQuote`, {
        pickup,
        dropoff,
        stops,
      });

      if (response.data.success && response.data.quote) {
        const { price, kilometers } = response.data.quote;
        setPrix(price);
        setKilometers(kilometers);
        setShowConfirmation(true);
      } else {
        alert("Impossible de calculer le prix.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête au backend :", error.message);
      alert("Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Vous devez être connecté pour réserver.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.post(`${backendUrl}/generateStripeLink`, {
          email: user.email,
          pickup,
          dropoff,
          datetime,
          passengers: parseInt(passengers),
          carSeat,
          carSeatCount: parseInt(carSeatCount),
          prix: parseFloat(prix),
          kilometers: parseFloat(kilometers),
        });

        if (response.data.success && response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
        } else {
          alert("Une erreur est survenue.");
        }
      } catch (error) {
        console.error("Erreur Stripe :", error.message);
        alert("Erreur lors de la réservation.");
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
          {kilometers && (
            <p>
              Distance estimée : <strong>{kilometers} km</strong>
            </p>
          )}

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
