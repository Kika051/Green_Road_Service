import { Link } from "react-router-dom";
import eqeExterieur from "../Images/eqeexterieur.png";
import eqeInterieur from "../Images/eqeinterieur.png";
import eqeSiegeArriere from "../Images/eqesiegearriere.png";

export default function Services() {
  return (
    <div className="bg-black text-white">
      {/* HERO */}
      <section
        className="h-[80vh] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: "url('/images/eqe-reims-cathedral-night.jpg')",
        }}
      >
        <div className="bg-black/65 p-10 ml-10 max-w-2xl rounded">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chauffeur privé premium à Reims
          </h1>
          <p className="text-gray-200 text-lg mb-6">
            Mercedes EQE Bleu Nuit • Confort • Discrétion • Ponctualité
          </p>
          <div className="flex gap-4">
            <Link
              to="/booking"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-semibold"
            >
              Réserver un transfert
            </Link>
            <a
              href="tel:+33XXXXXXXXX"
              className="border border-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-black transition"
            >
              Mise à disposition
            </a>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Une expérience de transport haut de gamme
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Green Road Services propose un service de chauffeur privé premium,
          destiné à une clientèle exigeante recherchant élégance, confort et
          fiabilité. Chaque prestation est assurée à bord d’une Mercedes EQE
          Bleu Nuit, berline électrique haut de gamme, dans un cadre calme,
          discret et raffiné.
        </p>
      </section>

      {/* VEHICULE */}
      <div className="grid grid-cols-2 gap-6">
        {/* IMAGE 1 - EXTERIEUR */}
        <div>
          <img
            src={eqeExterieur}
            alt="Mercedes EQE extérieur"
            className="rounded w-full h-full object-cover"
          />
        </div>

        {/* COLONNE DROITE */}
        <div className="flex flex-col justify-between">
          {/* IMAGE 2 - INTERIEUR (centrée verticalement) */}
          <div className="flex items-center justify-center h-full">
            <img
              src={eqeInterieur}
              alt="Mercedes EQE intérieur"
              className="rounded w-full object-cover"
            />
          </div>

          {/* IMAGE 3 - SIEGES ARRIERE */}
          <img
            src={eqeSiegeArriere}
            alt="Mercedes EQE sièges arrière"
            className="rounded w-full object-cover mt-6"
          />
        </div>
      </div>
      {/* MISE A DISPOSITION */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h3 className="text-2xl font-semibold mb-6">
          Mise à disposition avec chauffeur
        </h3>
        <p className="text-gray-300 mb-6">
          Un service sur mesure pour les besoins les plus exigeants. Un
          chauffeur dédié et un véhicule réservé exclusivement pour vous, à
          l’heure, à la demi-journée ou à la journée.
        </p>
        <ul className="text-gray-300 space-y-2 mb-8">
          <li>• Déplacements professionnels</li>
          <li>• Événements privés & mariages</li>
          <li>• Soirées & réceptions</li>
          <li>• Circuits touristiques en Champagne</li>
        </ul>

        <a
          href="tel:+33XXXXXXXXX"
          className="inline-block border border-white px-8 py-3 rounded font-semibold hover:bg-white hover:text-black transition"
        >
          Demande personnalisée
        </a>
      </section>
    </div>
  );
}
