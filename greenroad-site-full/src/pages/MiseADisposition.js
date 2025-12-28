import { useState, useRef, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseConfig";
import {
  MapPin,
  Calendar,
  Clock,
  Timer,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  Car,
} from "lucide-react";

export default function MiseADisposition() {
  const [user] = useAuthState(auth);
  const [form, setForm] = useState({
    pickupAddress: "",
    date: "",
    time: "",
    duration: "",
    name: "",
    email: "",
    phone: "",
    details: "",
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ref pour l'autocomplétion Google Maps
  const pickupInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Pré-remplir l'email si l'utilisateur est connecté
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Initialiser l'autocomplétion Google Maps
  useEffect(() => {
    if (pickupInputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        pickupInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "fr" },
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          setForm((prev) => ({
            ...prev,
            pickupAddress: place.formatted_address,
          }));
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://us-central1-green-road-servicesvtc.cloudfunctions.net/api/requestAvailability",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setForm({
          pickupAddress: "",
          date: "",
          time: "",
          duration: "",
          name: "",
          email: user?.email || "",
          phone: "",
          details: "",
        });
      } else {
        setError(data.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion. Veuillez réessayer.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Car size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Mise à <span className="text-green-500">disposition</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Besoin d'un chauffeur pour plusieurs heures ? Mariage, événement
            d'entreprise, journée touristique... Nous nous adaptons à vos
            besoins.
          </p>
        </div>

        {success ? (
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-xl font-semibold mb-2">
              Demande envoyée avec succès !
            </h2>
            <p className="text-zinc-400 mb-6">
              Nous avons bien reçu votre demande de mise à disposition. Notre
              équipe vous recontactera dans les plus brefs délais pour établir
              un devis personnalisé.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Faire une nouvelle demande
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-5"
          >
            {/* Adresse de prise en charge */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="inline mr-2" size={16} />
                Adresse de prise en charge *
              </label>
              <input
                ref={pickupInputRef}
                type="text"
                name="pickupAddress"
                placeholder="Entrez l'adresse de départ..."
                value={form.pickupAddress}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none placeholder-zinc-500"
              />
            </div>

            {/* Date et Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="inline mr-2" size={16} />
                  Heure *
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Timer className="inline mr-2" size={16} />
                Durée de la mise à disposition *
              </label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none"
              >
                <option value="">Sélectionnez une durée</option>
                <option value="2h">2 heures</option>
                <option value="3h">3 heures</option>
                <option value="4h">4 heures (demi-journée)</option>
                <option value="6h">6 heures</option>
                <option value="8h">8 heures (journée)</option>
                <option value="10h">10 heures</option>
                <option value="12h">12 heures</option>
                <option value="custom">
                  Autre (précisez dans les détails)
                </option>
              </select>
            </div>

            {/* Informations de contact */}
            <div className="border-t border-zinc-700 pt-5 mt-5">
              <h3 className="font-medium mb-4 text-zinc-300">
                Vos coordonnées
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline mr-2" size={16} />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none placeholder-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="votre@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="inline mr-2" size={16} />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="06 XX XX XX XX"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Détails supplémentaires */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Détails supplémentaires (optionnel)
              </label>
              <textarea
                name="details"
                placeholder="Type d'événement, nombre de passagers, itinéraire prévu, besoins spécifiques..."
                value={form.details}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-green-500 focus:outline-none placeholder-zinc-500 resize-none"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer ma demande"
              )}
            </button>

            {/* Note */}
            <p className="text-xs text-zinc-500 text-center">
              En soumettant ce formulaire, vous acceptez d'être recontacté par
              notre équipe pour établir un devis personnalisé.
            </p>
          </form>
        )}

        {/* Infos tarifs */}
        <div className="mt-10 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h3 className="font-semibold mb-4">💡 Informations tarifaires</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Tarif horaire : à partir de 50€/heure</li>
            <li>• Demi-journée (4h) : à partir de 180€</li>
            <li>• Journée complète (8h) : à partir de 350€</li>
            <li>• Kilométrage inclus selon la formule choisie</li>
            <li>• Devis personnalisé pour les événements spéciaux</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
