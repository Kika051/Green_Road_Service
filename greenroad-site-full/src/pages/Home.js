import React from "react";
import { Link } from "react-router-dom";
import background from "../Images/Background.png";

const HeroText = () => (
  <>
    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
      Votre chauffeur premium à Reims et en Champagne
    </h1>
    <p className="max-w-xl text-gray-300 mb-6">
      Aéroports, gares, mariages, événements – réservez votre chauffeur
      électrique en toute sérénité.
    </p>
  </>
);

const HeroButtons = () => (
  <div className="flex gap-4 flex-wrap justify-center">
    <Link to="/booking">
      <button className="bg-primary px-6 py-2 rounded text-black font-semibold">
        Réserver maintenant
      </button>
    </Link>
  </div>
);

const HeroFeatures = () => (
  <div className="flex gap-8 mt-10 text-sm text-gray-400 flex-wrap justify-center">
    <div>🚗 Véhicule électrique haut de gamme</div>
    <div>📍 Chauffeur local basé à Reims</div>
    <div>⏰ Ponctualité & confort assurés</div>
  </div>
);

function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="bg-black bg-opacity-60 min-h-screen flex flex-col justify-center items-center text-center px-4">
        <HeroText />
        <HeroButtons />
        <HeroFeatures />
      </div>
    </div>
  );
}

export default Home;
