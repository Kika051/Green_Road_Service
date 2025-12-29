import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components";
import Background from "../assets/images/Background.png";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Filtre noir semi-transparent */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Contenu au-dessus du filtre */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white text-center">
          {t("home.title")}
        </h1>
        <p className="max-w-xl text-gray-300 mb-8 text-center mx-auto">
          {t("home.subtitle")}
        </p>

        <Link to="/booking" className="inline-block">
          <Button size="lg">{t("home.cta")}</Button>
        </Link>

        <div className="flex gap-6 mt-12 text-sm text-gray-400 flex-wrap justify-center">
          <span>🚗 {t("home.features.vehicle")}</span>
          <span>📍 {t("home.features.local")}</span>
          <span>⏰ {t("home.features.punctuality")}</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
