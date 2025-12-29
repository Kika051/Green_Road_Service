import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components";
import eqeinterieur from "../assets/images/eqeinterieur.png";
import eqeexterieur from "../assets/images/eqeexterieur.png";
import eqesiegearriere from "../assets/images/eqesiegearriere.png";
import services from "../assets/images/services.jpg";

const Services = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero avec image de fond */}
      <section
        className="h-[60vh] flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${services})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Filtre noir */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Contenu */}
        <div className="text-center px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("services.hero.title")}
          </h1>
          <p className="text-gray-300 text-lg mb-6 max-w-xl">
            {t("services.hero.subtitle")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/booking">
              <Button size="lg">{t("services.hero.bookTransfer")}</Button>
            </Link>
            <Link to="/miseadisposition">
              <Button variant="outline" size="lg">
                {t("services.hero.availability")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          {t("services.intro.title")}
        </h2>
        <p className="text-gray-300 leading-relaxed">
          {t("services.intro.description")}
        </p>
      </section>

      {/* Galerie photos */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-800">
        <h3 className="text-2xl font-semibold mb-8 text-center">
          {t("services.vehicle.title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden">
            <img
              src={eqeexterieur}
              alt="Mercedes EQE Extérieur"
              className="w-full h-64 object-cover hover:scale-105 transition duration-300"
            />
            <p className="text-center text-zinc-400 mt-2">
              {t("services.vehicle.exterior")}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden">
            <img
              src={eqeinterieur}
              alt="Mercedes EQE Intérieur"
              className="w-full h-64 object-cover hover:scale-105 transition duration-300"
            />
            <p className="text-center text-zinc-400 mt-2">
              {t("services.vehicle.interior")}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden">
            <img
              src={eqesiegearriere}
              alt="Mercedes EQE Sièges arrière"
              className="w-full h-64 object-cover hover:scale-105 transition duration-300"
            />
            <p className="text-center text-zinc-400 mt-2">
              {t("services.vehicle.backseats")}
            </p>
          </div>
        </div>
      </section>

      {/* Forfaits */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-zinc-800">
        <h3 className="text-2xl font-semibold mb-6">
          {t("services.packages.title")}
        </h3>
        <p className="text-gray-300 mb-6">
          {t("services.packages.description")}
        </p>
        <ul className="text-gray-300 space-y-2 mb-8">
          <li>✈️ {t("services.packages.airports")}</li>
          <li>🚄 {t("services.packages.stations")}</li>
          <li>🍾 {t("services.packages.champagne")}</li>
        </ul>
        <Link to="/forfaits">
          <Button>{t("services.packages.viewAll")}</Button>
        </Link>
      </section>

      {/* Mise à disposition */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-zinc-800">
        <h3 className="text-2xl font-semibold mb-6">
          {t("services.availability.title")}
        </h3>
        <p className="text-gray-300 mb-6">
          {t("services.availability.description")}
        </p>
        <ul className="text-gray-300 space-y-2 mb-8">
          <li>• {t("services.availability.services.business")}</li>
          <li>• {t("services.availability.services.events")}</li>
          <li>• {t("services.availability.services.evenings")}</li>
          <li>• {t("services.availability.services.tours")}</li>
        </ul>
        <Link to="/miseadisposition">
          <Button variant="outline">
            {t("services.availability.customRequest")}
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Services;
