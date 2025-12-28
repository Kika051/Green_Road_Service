import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import {
  Plane,
  MapPin,
  Wine,
  Church,
  Castle,
  Clock,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Car,
  CheckCircle,
  Loader2,
  Navigation,
  Phone,
} from "lucide-react";

// === FORFAITS DÉFINIS ===
// Tarif forfait: 2€/km (minimum 20€)
// Tarif normal barré: 2.5€/km (minimum 25€)
// Aéroports: prix fixes définis
// ✅ IMPORTANT: distance en nombre uniquement (sans "km")

const forfaits = {
  aeroports: {
    titre: "Aéroports",
    icon: Plane,
    color: "from-blue-600 to-blue-800",
    destinations: [
      {
        id: "cdg",
        nom: "Aéroport Paris CDG",
        distance: 145,
        duree: "1h30",
        prix: 190,
        prixNormal: 230,
        image: "✈️",
      },
      {
        id: "orly",
        nom: "Aéroport Paris Orly",
        distance: 165,
        duree: "1h45",
        prix: 210,
        prixNormal: 250,
        image: "✈️",
      },
      {
        id: "beauvais",
        nom: "Aéroport Beauvais-Tillé",
        distance: 170,
        duree: "1h50",
        prix: 220,
        prixNormal: 260,
        image: "✈️",
      },
      {
        id: "vatry",
        nom: "Aéroport Châlons-Vatry",
        distance: 55,
        duree: "45min",
        prix: 75,
        prixNormal: 90,
        image: "✈️",
      },
    ],
  },
  champagne: {
    titre: "Route du Champagne",
    icon: Wine,
    color: "from-amber-600 to-amber-800",
    destinations: [
      {
        id: "epernay",
        nom: "Épernay - Avenue de Champagne",
        distance: 28,
        duree: "30min",
        prix: 56,
        prixNormal: 70,
        image: "🍾",
      },
      {
        id: "hautvillers",
        nom: "Hautvillers - Village de Dom Pérignon",
        distance: 25,
        duree: "25min",
        prix: 50,
        prixNormal: 63,
        image: "🍾",
      },
      {
        id: "ay",
        nom: "Aÿ-Champagne",
        distance: 24,
        duree: "25min",
        prix: 48,
        prixNormal: 60,
        image: "🍾",
      },
      {
        id: "verzenay",
        nom: "Verzenay - Phare et Musée de la Vigne",
        distance: 18,
        duree: "20min",
        prix: 36,
        prixNormal: 45,
        image: "🍾",
      },
      {
        id: "bouzy",
        nom: "Bouzy - Coteaux Champenois",
        distance: 22,
        duree: "25min",
        prix: 44,
        prixNormal: 55,
        image: "🍾",
      },
    ],
  },
  tourisme: {
    titre: "Sites Touristiques",
    icon: Castle,
    color: "from-purple-600 to-purple-800",
    destinations: [
      {
        id: "cathedrale",
        nom: "Cathédrale Notre-Dame de Reims",
        distance: 5,
        duree: "10min",
        prix: 20,
        prixNormal: 25,
        image: "⛪",
      },
      {
        id: "palais-tau",
        nom: "Palais du Tau",
        distance: 5,
        duree: "10min",
        prix: 20,
        prixNormal: 25,
        image: "🏛️",
      },
      {
        id: "basilique",
        nom: "Basilique Saint-Remi",
        distance: 6,
        duree: "10min",
        prix: 20,
        prixNormal: 25,
        image: "⛪",
      },
      {
        id: "fort-pomelle",
        nom: "Fort de la Pompelle",
        distance: 10,
        duree: "15min",
        prix: 20,
        prixNormal: 25,
        image: "🏰",
      },
      {
        id: "caves-pommery",
        nom: "Caves Pommery",
        distance: 5,
        duree: "10min",
        prix: 20,
        prixNormal: 25,
        image: "🍷",
      },
      {
        id: "caves-taittinger",
        nom: "Caves Taittinger",
        distance: 5,
        duree: "10min",
        prix: 20,
        prixNormal: 25,
        image: "🍷",
      },
    ],
  },
  gares: {
    titre: "Gares TGV",
    icon: Church,
    color: "from-green-600 to-green-800",
    destinations: [
      {
        id: "gare-reims",
        nom: "Gare de Reims Centre",
        distance: 5,
        duree: "10min",
        prix: 20,
        prixNormal: 25,
        image: "🚄",
      },
      {
        id: "gare-champagne",
        nom: "Gare Champagne-Ardenne TGV",
        distance: 8,
        duree: "12min",
        prix: 20,
        prixNormal: 25,
        image: "🚄",
      },
      {
        id: "gare-paris-est",
        nom: "Gare de Paris Est",
        distance: 145,
        duree: "1h30",
        prix: 290,
        prixNormal: 363,
        image: "🚄",
      },
    ],
  },
  villes: {
    titre: "Villes Proches",
    icon: MapPin,
    color: "from-red-600 to-red-800",
    destinations: [
      {
        id: "paris",
        nom: "Paris Centre",
        distance: 145,
        duree: "1h30",
        prix: 290,
        prixNormal: 363,
        image: "🗼",
      },
      {
        id: "chalons",
        nom: "Châlons-en-Champagne",
        distance: 45,
        duree: "40min",
        prix: 90,
        prixNormal: 113,
        image: "🏙️",
      },
      {
        id: "charleville",
        nom: "Charleville-Mézières",
        distance: 85,
        duree: "1h",
        prix: 170,
        prixNormal: 213,
        image: "🏙️",
      },
      {
        id: "troyes",
        nom: "Troyes",
        distance: 125,
        duree: "1h20",
        prix: 250,
        prixNormal: 313,
        image: "🏙️",
      },
      {
        id: "laon",
        nom: "Laon",
        distance: 55,
        duree: "45min",
        prix: 110,
        prixNormal: 138,
        image: "🏙️",
      },
    ],
  },
};

const Forfaits = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [expandedCategory, setExpandedCategory] = useState("aeroports");
  const [selectedForfait, setSelectedForfait] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: "",
    date: "",
    time: "",
    passengers: 1,
    phone: "", // ✅ Ajout du téléphone
    allerRetour: false,
    commentaire: "",
  });

  // Ref pour l'autocomplétion Google Maps
  const pickupInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialiser l'autocomplétion Google Maps quand le modal s'ouvre
  useEffect(() => {
    if (showModal && pickupInputRef.current && window.google) {
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
          setFormData((prev) => ({
            ...prev,
            pickupAddress: place.formatted_address,
          }));
        }
      });
    }
  }, [showModal]);

  const handleSelectForfait = (categorie, destination) => {
    if (!user) {
      alert("Veuillez vous connecter pour réserver un forfait.");
      navigate("/login");
      return;
    }
    setSelectedForfait({ categorie, ...destination });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickupAddress.trim()) {
      alert("Veuillez entrer votre adresse de prise en charge.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        clientId: user.uid,
        email: user.email,
        clientName: user.displayName || user.email, // ✅ Nom du client
        phone: formData.phone, // ✅ Téléphone
        pickup: formData.pickupAddress,
        dropoff: selectedForfait.nom,
        datetime: Timestamp.fromDate(
          new Date(`${formData.date}T${formData.time}`)
        ),
        passengers: parseInt(formData.passengers),
        price: formData.allerRetour
          ? selectedForfait.prix * 2
          : selectedForfait.prix,
        kilometers: selectedForfait.distance, // ✅ Maintenant c'est un nombre
        status: "en_attente",
        driverStatus: "pending",
        createdAt: Timestamp.now(),
        type: "forfait",
        forfaitId: selectedForfait.id,
        forfaitNom: selectedForfait.nom,
        allerRetour: formData.allerRetour,
        commentaire: formData.commentaire,
      };

      await addDoc(collection(db, "bookings"), bookingData);

      alert(
        "✅ Votre réservation forfait a été envoyée ! Vous recevrez une confirmation après validation par notre chauffeur."
      );
      setShowModal(false);
      setSelectedForfait(null);
      setFormData({
        pickupAddress: "",
        date: "",
        time: "",
        passengers: 1,
        phone: "",
        allerRetour: false,
        commentaire: "",
      });
      navigate("/account");
    } catch (error) {
      console.error("❌ Erreur réservation:", error);
      alert("Erreur lors de la réservation. Veuillez réessayer.");
    }

    setLoading(false);
  };

  const toggleCategory = (key) => {
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Nos <span className="text-green-500">Forfaits</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Profitez de nos prix préférentiels pour vos trajets depuis Reims.
            Tarifs fixes, sans surprise !
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
            <CheckCircle size={20} />
            <span>Jusqu'à 20% d'économie par rapport au tarif standard</span>
          </div>
        </div>

        {/* Catégories de forfaits */}
        <div className="space-y-4">
          {Object.entries(forfaits).map(([key, categorie]) => {
            const Icon = categorie.icon;
            const isExpanded = expandedCategory === key;

            return (
              <div
                key={key}
                className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
              >
                {/* Header de catégorie */}
                <button
                  onClick={() => toggleCategory(key)}
                  className={`w-full p-5 flex items-center justify-between bg-gradient-to-r ${categorie.color} hover:opacity-90 transition`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={28} />
                    <span className="text-xl font-semibold">
                      {categorie.titre}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {categorie.destinations.length} destinations
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </button>

                {/* Liste des destinations */}
                {isExpanded && (
                  <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categorie.destinations.map((dest) => (
                      <div
                        key={dest.id}
                        className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition border border-zinc-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{dest.image}</span>
                            <h3 className="font-semibold">{dest.nom}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {dest.distance} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {dest.duree}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-green-500">
                              {dest.prix}€
                            </span>
                            <span className="text-sm text-zinc-500 line-through ml-2">
                              {dest.prixNormal}€
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectForfait(key, dest)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Infos supplémentaires */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center">
            <Car className="mx-auto mb-3 text-green-500" size={40} />
            <h3 className="font-semibold mb-2">Véhicule Premium</h3>
            <p className="text-zinc-400 text-sm">
              Mercedes Classe E ou équivalent, climatisé, WiFi à bord
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center">
            <Users className="mx-auto mb-3 text-green-500" size={40} />
            <h3 className="font-semibold mb-2">Jusqu'à 4 passagers</h3>
            <p className="text-zinc-400 text-sm">
              Prix forfaitaire, pas de supplément par passager
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center">
            <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
            <h3 className="font-semibold mb-2">Annulation gratuite</h3>
            <p className="text-zinc-400 text-sm">
              Annulation sans frais jusqu'à 24h avant le départ
            </p>
          </div>
        </div>
      </div>

      {/* Modal de réservation */}
      {showModal && selectedForfait && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-700 my-8">
            <h2 className="text-2xl font-bold mb-4">Réserver ce forfait</h2>

            {/* Résumé du forfait */}
            <div className="bg-zinc-800 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{selectedForfait.image}</span>
                <span className="font-semibold">{selectedForfait.nom}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>{selectedForfait.distance} km</span>
                <span>{selectedForfait.duree}</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-green-500">
                  {selectedForfait.prix}€
                </span>
                <span className="text-zinc-500 text-sm ml-2">/ trajet</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Adresse de prise en charge */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Navigation className="inline mr-2" size={16} />
                  Adresse de prise en charge *
                </label>
                <input
                  ref={pickupInputRef}
                  type="text"
                  required
                  value={formData.pickupAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupAddress: e.target.value })
                  }
                  placeholder="Entrez votre adresse à Reims..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Commencez à taper pour voir les suggestions
                </p>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="inline mr-2" size={16} />
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="06 12 34 56 78"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Pour vous contacter avant la prise en charge
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="inline mr-2" size={16} />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Heure */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Clock className="inline mr-2" size={16} />
                  Heure de prise en charge *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Passagers */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Users className="inline mr-2" size={16} />
                  Nombre de passagers
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) =>
                    setFormData({ ...formData, passengers: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} passager{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aller-retour */}
              <div className="flex items-center gap-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                <input
                  type="checkbox"
                  id="allerRetour"
                  checked={formData.allerRetour}
                  onChange={(e) =>
                    setFormData({ ...formData, allerRetour: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 text-green-500 focus:ring-green-500"
                />
                <label htmlFor="allerRetour" className="flex-1">
                  <span className="font-medium">Aller-retour</span>
                  <span className="text-green-500 ml-2">
                    (+{selectedForfait.prix}€)
                  </span>
                </label>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) =>
                    setFormData({ ...formData, commentaire: e.target.value })
                  }
                  placeholder="Numéro de vol, instructions particulières..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white h-20 resize-none placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Récapitulatif trajet */}
              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <h4 className="font-medium mb-2 text-sm text-zinc-400">
                  Récapitulatif du trajet
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-green-500" />
                  <span className="truncate">
                    {formData.pickupAddress || "Votre adresse"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Navigation size={16} className="text-red-500" />
                  <span>{selectedForfait.nom}</span>
                </div>
                {formData.allerRetour && (
                  <p className="text-xs text-zinc-500 mt-2">
                    + Retour vers votre adresse
                  </p>
                )}
              </div>

              {/* Prix total */}
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Prix total</span>
                  <span className="text-2xl font-bold text-green-500">
                    {formData.allerRetour
                      ? selectedForfait.prix * 2
                      : selectedForfait.prix}
                    €
                  </span>
                </div>
                {formData.allerRetour && (
                  <p className="text-xs text-green-400 mt-1">
                    {selectedForfait.prix}€ x 2 trajets
                  </p>
                )}
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      pickupAddress: "",
                      date: "",
                      time: "",
                      passengers: 1,
                      phone: "",
                      allerRetour: false,
                      commentaire: "",
                    });
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-3 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Envoi...
                    </>
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forfaits;
