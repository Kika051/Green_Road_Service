import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone } from "lucide-react";
import { useAuth, useFetch, useForm, useGoogleAutocomplete } from "../hooks";
import { Button, Input } from "../components";
import { API_URL } from "../utils/constants";
import reserver from "../assets/images/reserver.jpg";

const Booking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { postData, loading } = useFetch();
  const { values, handleChange, setValue } = useForm({
    pickup: "",
    dropoff: "",
    datetime: "",
    passengers: 1,
    phone: "",
    carSeat: "non",
    carSeatCount: 1,
    acceptCgv: false, // ✅ Ajout CGV
  });

  const [quote, setQuote] = useState(null);

  // Google Autocomplete
  const { inputRef: pickupRef } = useGoogleAutocomplete((addr) =>
    setValue("pickup", addr)
  );
  const { inputRef: dropoffRef } = useGoogleAutocomplete((addr) =>
    setValue("dropoff", addr)
  );

  // Calculer devis
  const handleCalculate = async () => {
    if (!values.pickup || !values.dropoff) {
      alert(t("booking.errors.fillAddresses"));
      return;
    }

    const result = await postData(`${API_URL}/createQuote`, {
      pickup: values.pickup,
      dropoff: values.dropoff,
    });

    if (result.success && result.data.success) {
      setQuote(result.data.quote);
    } else {
      alert(t("booking.errors.priceError"));
    }
  };

  // Envoyer réservation
  const handleReservation = async () => {
    if (!values.phone.trim()) {
      alert(t("booking.errors.enterPhone"));
      return;
    }

    // ✅ Vérification CGV
    if (!values.acceptCgv) {
      alert(t("legal.cgvRequired"));
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const result = await postData(`${API_URL}/createBookingRequest`, {
      email: user.email,
      uid: user.uid,
      clientName: user.displayName || user.email,
      phone: values.phone,
      pickup: values.pickup,
      dropoff: values.dropoff,
      datetime: values.datetime,
      passengers: parseInt(values.passengers),
      carSeat: values.carSeat,
      carSeatCount:
        values.carSeat === "oui" ? parseInt(values.carSeatCount) : 0,
      prix: quote.price,
      kilometers: quote.kilometers,
      cgvAccepted: true, // ✅ Enregistrer l'acceptation
    });

    if (result.success && result.data.success) {
      alert(t("booking.successMessage"));
      navigate("/account");
    } else {
      alert(t("booking.errors.saveError"));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{
        backgroundImage: `url(${reserver})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Filtre noir semi-transparent */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Contenu */}
      <div className="relative z-10 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-white text-center">
          {t("booking.title")}
        </h2>

        <div className="space-y-4">
          <Input
            ref={pickupRef}
            placeholder={t("booking.pickup")}
            value={values.pickup}
            onChange={(e) => setValue("pickup", e.target.value)}
          />

          <Input
            ref={dropoffRef}
            placeholder={t("booking.dropoff")}
            value={values.dropoff}
            onChange={(e) => setValue("dropoff", e.target.value)}
          />

          <Input
            type="datetime-local"
            name="datetime"
            value={values.datetime}
            onChange={handleChange}
          />

          <div>
            <div className="flex items-center gap-2 mb-1 text-sm text-zinc-400">
              <Phone size={14} />
              <span>{t("booking.phoneRequired")}</span>
            </div>
            <Input
              type="tel"
              name="phone"
              placeholder="06 12 34 56 78"
              value={values.phone}
              onChange={handleChange}
            />
          </div>

          <select
            name="passengers"
            value={values.passengers}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {t("booking.passengers")}
              </option>
            ))}
          </select>

          <select
            name="carSeat"
            value={values.carSeat}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
          >
            <option value="non">{t("booking.carSeatNo")}</option>
            <option value="oui">{t("booking.carSeatYes")}</option>
          </select>

          {/* ✅ Checkbox CGV */}
          <div className="flex items-start gap-3 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
            <input
              type="checkbox"
              id="acceptCgv"
              checked={values.acceptCgv}
              onChange={(e) => setValue("acceptCgv", e.target.checked)}
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

          <Button
            onClick={handleCalculate}
            loading={loading}
            className="w-full"
            size="lg"
          >
            {t("booking.calculate")}
          </Button>
        </div>

        {/* Résultat */}
        {quote && (
          <div className="mt-8 bg-white text-black p-6 rounded-xl shadow-lg">
            <p className="text-lg">
              {t("booking.estimatedPrice")}: <strong>{quote.price} €</strong>
            </p>
            <p>
              {t("booking.estimatedDistance")}:{" "}
              <strong>{quote.kilometers} km</strong>
            </p>

            <div className="mt-6 flex gap-4 justify-center">
              <Button
                onClick={handleReservation}
                size="lg"
                disabled={!values.acceptCgv}
                className={
                  !values.acceptCgv ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                {t("booking.yes")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setQuote(null)}
                size="lg"
              >
                {t("booking.no")}
              </Button>
            </div>

            {!values.acceptCgv && (
              <p className="text-red-500 text-sm text-center mt-3">
                {t("legal.cgvRequired")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
