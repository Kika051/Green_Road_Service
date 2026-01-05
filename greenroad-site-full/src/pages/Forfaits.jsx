import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseConfig";
import { API_URL } from "../utils/constants";
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

const Forfaits = () => {
  const { t } = useTranslation();
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
    phone: "",
    allerRetour: false,
    commentaire: "",
    acceptCgv: false,
  });

  const pickupInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const forfaits = {
    aeroports: {
      titreKey: "forfaits.categories.airports",
      icon: Plane,
      color: "from-blue-600 to-blue-800",
      destinations: [
        {
          id: "cdg",
          nomKey: "forfaits.destinations.cdg",
          distance: 145,
          duree: "1h30",
          prix: 190,
          prixNormal: 230,
          image: "✈️",
        },
        {
          id: "orly",
          nomKey: "forfaits.destinations.orly",
          distance: 165,
          duree: "1h45",
          prix: 210,
          prixNormal: 250,
          image: "✈️",
        },
        {
          id: "beauvais",
          nomKey: "forfaits.destinations.beauvais",
          distance: 170,
          duree: "1h50",
          prix: 220,
          prixNormal: 260,
          image: "✈️",
        },
        {
          id: "vatry",
          nomKey: "forfaits.destinations.vatry",
          distance: 55,
          duree: "45min",
          prix: 75,
          prixNormal: 90,
          image: "✈️",
        },
      ],
    },
    champagne: {
      titreKey: "forfaits.categories.champagne",
      icon: Wine,
      color: "from-amber-600 to-amber-800",
      destinations: [
        {
          id: "epernay",
          nomKey: "forfaits.destinations.epernay",
          distance: 28,
          duree: "30min",
          prix: 56,
          prixNormal: 70,
          image: "🍾",
        },
        {
          id: "hautvillers",
          nomKey: "forfaits.destinations.hautvillers",
          distance: 25,
          duree: "25min",
          prix: 50,
          prixNormal: 63,
          image: "🍾",
        },
        {
          id: "ay",
          nomKey: "forfaits.destinations.ay",
          distance: 24,
          duree: "25min",
          prix: 48,
          prixNormal: 60,
          image: "🍾",
        },
        {
          id: "verzenay",
          nomKey: "forfaits.destinations.verzenay",
          distance: 18,
          duree: "20min",
          prix: 36,
          prixNormal: 45,
          image: "🍾",
        },
        {
          id: "bouzy",
          nomKey: "forfaits.destinations.bouzy",
          distance: 22,
          duree: "25min",
          prix: 44,
          prixNormal: 55,
          image: "🍾",
        },
      ],
    },
    tourisme: {
      titreKey: "forfaits.categories.tourism",
      icon: Castle,
      color: "from-purple-600 to-purple-800",
      destinations: [
        {
          id: "cathedrale",
          nomKey: "forfaits.destinations.cathedrale",
          distance: 5,
          duree: "10min",
          prix: 20,
          prixNormal: 25,
          image: "⛪",
        },
        {
          id: "palais-tau",
          nomKey: "forfaits.destinations.palaisTau",
          distance: 5,
          duree: "10min",
          prix: 20,
          prixNormal: 25,
          image: "🏛️",
        },
        {
          id: "basilique",
          nomKey: "forfaits.destinations.basilique",
          distance: 6,
          duree: "10min",
          prix: 20,
          prixNormal: 25,
          image: "⛪",
        },
        {
          id: "fort-pomelle",
          nomKey: "forfaits.destinations.fortPompelle",
          distance: 10,
          duree: "15min",
          prix: 20,
          prixNormal: 25,
          image: "🏰",
        },
        {
          id: "caves-pommery",
          nomKey: "forfaits.destinations.cavesPommery",
          distance: 5,
          duree: "10min",
          prix: 20,
          prixNormal: 25,
          image: "🍷",
        },
        {
          id: "caves-taittinger",
          nomKey: "forfaits.destinations.cavesTaittinger",
          distance: 5,
          duree: "10min",
          prix: 20,
          prixNormal: 25,
          image: "🍷",
        },
      ],
    },
    gares: {
      titreKey: "forfaits.categories.stations",
      icon: Church,
      color: "from-green-600 to-green-800",
      destinations: [
        {
          id: "gare-reims",
          nomKey: "forfaits.destinations.gareReims",
          distance: 5,
          duree: "10min",
          prix: 20,
          prixNormal: 25,
          image: "🚄",
        },
        {
          id: "gare-champagne",
          nomKey: "forfaits.destinations.gareChampagne",
          distance: 8,
          duree: "12min",
          prix: 20,
          prixNormal: 25,
          image: "🚄",
        },
        {
          id: "gare-paris-est",
          nomKey: "forfaits.destinations.gareParisEst",
          distance: 145,
          duree: "1h30",
          prix: 290,
          prixNormal: 363,
          image: "🚄",
        },
      ],
    },
    villes: {
      titreKey: "forfaits.categories.cities",
      icon: MapPin,
      color: "from-red-600 to-red-800",
      destinations: [
        {
          id: "paris",
          nomKey: "forfaits.destinations.paris",
          distance: 145,
          duree: "1h30",
          prix: 290,
          prixNormal: 363,
          image: "🗼",
        },
        {
          id: "chalons",
          nomKey: "forfaits.destinations.chalons",
          distance: 45,
          duree: "40min",
          prix: 90,
          prixNormal: 113,
          image: "🏙️",
        },
        {
          id: "charleville",
          nomKey: "forfaits.destinations.charleville",
          distance: 85,
          duree: "1h",
          prix: 170,
          prixNormal: 213,
          image: "🏙️",
        },
        {
          id: "troyes",
          nomKey: "forfaits.destinations.troyes",
          distance: 125,
          duree: "1h20",
          prix: 250,
          prixNormal: 313,
          image: "🏙️",
        },
        {
          id: "laon",
          nomKey: "forfaits.destinations.laon",
          distance: 55,
          duree: "45min",
          prix: 110,
          prixNormal: 138,
          image: "🏙️",
        },
      ],
    },
  };

  useEffect(() => {
    if (showModal && pickupInputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        pickupInputRef.current,
        { types: ["address"], componentRestrictions: { country: "fr" } }
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
      alert(t("forfaits.alerts.loginRequired"));
      navigate("/login");
      return;
    }
    setSelectedForfait({
      categorie,
      ...destination,
      nom: t(destination.nomKey),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickupAddress.trim()) {
      alert(t("forfaits.alerts.enterAddress"));
      return;
    }
    if (!formData.phone.trim()) {
      alert(t("forfaits.alerts.enterPhone"));
      return;
    }
    if (!formData.acceptCgv) {
      alert(t("legal.cgvRequired"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/createBookingRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          clientName: user.displayName || user.email,
          phone: formData.phone,
          pickup: formData.pickupAddress,
          dropoff: selectedForfait.nom,
          datetime: `${formData.date}T${formData.time}`,
          passengers: parseInt(formData.passengers),
          prix: formData.allerRetour
            ? selectedForfait.prix * 2
            : selectedForfait.prix,
          kilometers: selectedForfait.distance,
          type: "forfait",
          forfaitId: selectedForfait.id,
          forfaitNom: selectedForfait.nom,
          allerRetour: formData.allerRetour,
          commentaire: formData.commentaire,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(t("forfaits.alerts.success"));
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
          acceptCgv: false,
        });
        navigate("/account");
      } else {
        alert(data.error || t("forfaits.alerts.error"));
      }
    } catch (error) {
      console.error("Erreur réservation:", error);
      alert(t("forfaits.alerts.error"));
    }
    setLoading(false);
  };

  const toggleCategory = (key) => {
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t("forfaits.title")}{" "}
            <span className="text-green-500">
              {t("forfaits.titleHighlight")}
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            {t("forfaits.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
            <CheckCircle size={20} />
            <span>{t("forfaits.savings")}</span>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(forfaits).map(([key, categorie]) => {
            const Icon = categorie.icon;
            const isExpanded = expandedCategory === key;
            return (
              <div
                key={key}
                className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
              >
                <button
                  onClick={() => toggleCategory(key)}
                  className={`w-full p-5 flex items-center justify-between bg-gradient-to-r ${categorie.color} hover:opacity-90 transition`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={28} />
                    <span className="text-xl font-semibold">
                      {t(categorie.titreKey)}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {categorie.destinations.length}{" "}
                      {t("forfaits.destinationsLabel")}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </button>

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
                            <h3 className="font-semibold">{t(dest.nomKey)}</h3>
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
                            {t("forfaits.book")}
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

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center">
            <Car className="mx-auto mb-3 text-green-500" size={40} />
            <h3 className="font-semibold mb-2">
              {t("forfaits.features.premiumVehicle")}
            </h3>
            <p className="text-zinc-400 text-sm">
              {t("forfaits.features.premiumVehicleDesc")}
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center">
            <Users className="mx-auto mb-3 text-green-500" size={40} />
            <h3 className="font-semibold mb-2">
              {t("forfaits.features.passengers")}
            </h3>
            <p className="text-zinc-400 text-sm">
              {t("forfaits.features.passengersDesc")}
            </p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center">
            <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
            <h3 className="font-semibold mb-2">
              {t("forfaits.features.freeCancellation")}
            </h3>
            <p className="text-zinc-400 text-sm">
              {t("forfaits.features.freeCancellationDesc")}
            </p>
          </div>
        </div>
      </div>

      {showModal && selectedForfait && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-700 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {t("forfaits.modal.title")}
            </h2>

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
                <span className="text-zinc-500 text-sm ml-2">
                  {t("forfaits.perTrip")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Navigation className="inline mr-2" size={16} />
                  {t("forfaits.modal.pickupAddress")}
                </label>
                <input
                  ref={pickupInputRef}
                  type="text"
                  required
                  value={formData.pickupAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupAddress: e.target.value })
                  }
                  placeholder={t("forfaits.modal.pickupHint")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="inline mr-2" size={16} />
                  {t("forfaits.modal.phone")}
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="inline mr-2" size={16} />
                  {t("forfaits.modal.date")}
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Clock className="inline mr-2" size={16} />
                  {t("forfaits.modal.time")}
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Users className="inline mr-2" size={16} />
                  {t("forfaits.modal.passengers")}
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
                      {n} {t("common.passengers")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                <input
                  type="checkbox"
                  id="allerRetour"
                  checked={formData.allerRetour}
                  onChange={(e) =>
                    setFormData({ ...formData, allerRetour: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-zinc-700 border-zinc-600 text-green-500 focus:ring-green-500 accent-green-500"
                />
                <label htmlFor="allerRetour" className="flex-1 cursor-pointer">
                  <span className="font-medium">
                    {t("forfaits.modal.roundTrip")}
                  </span>
                  <span className="text-green-500 ml-2">
                    (+{selectedForfait.prix}€)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("forfaits.modal.comment")}
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) =>
                    setFormData({ ...formData, commentaire: e.target.value })
                  }
                  placeholder={t("forfaits.modal.commentPlaceholder")}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white h-20 resize-none placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <h4 className="font-medium mb-2 text-sm text-zinc-400">
                  {t("forfaits.modal.tripSummary")}
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-green-500" />
                  <span className="truncate">
                    {formData.pickupAddress || t("forfaits.modal.yourAddress")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Navigation size={16} className="text-red-500" />
                  <span>{selectedForfait.nom}</span>
                </div>
                {formData.allerRetour && (
                  <p className="text-xs text-zinc-500 mt-2">
                    {t("forfaits.modal.returnToAddress")}
                  </p>
                )}
              </div>

              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {t("forfaits.modal.totalPrice")}
                  </span>
                  <span className="text-2xl font-bold text-green-500">
                    {formData.allerRetour
                      ? selectedForfait.prix * 2
                      : selectedForfait.prix}
                    €
                  </span>
                </div>
                {formData.allerRetour && (
                  <p className="text-xs text-green-400 mt-1">
                    {selectedForfait.prix}€ x 2 {t("forfaits.modal.trips")}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <input
                  type="checkbox"
                  id="acceptCgv"
                  checked={formData.acceptCgv}
                  onChange={(e) =>
                    setFormData({ ...formData, acceptCgv: e.target.checked })
                  }
                  className="w-5 h-5 mt-0.5 rounded bg-zinc-700 border-zinc-600 text-green-500 focus:ring-green-500 accent-green-500 cursor-pointer"
                />
                <label
                  htmlFor="acceptCgv"
                  className="text-sm text-zinc-300 cursor-pointer"
                >
                  {t("legal.acceptCgv")}{" "}
                  <Link
                    to="/cgv"
                    target="_blank"
                    className="text-green-500 hover:text-green-400 underline"
                  >
                    {t("legal.cgvLink")}
                  </Link>
                  <span className="text-red-500"> *</span>
                </label>
              </div>

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
                      acceptCgv: false,
                    });
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-3 rounded-lg font-medium transition"
                >
                  {t("forfaits.modal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.acceptCgv}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t("forfaits.modal.sending")}
                    </>
                  ) : (
                    t("forfaits.modal.confirm")
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
