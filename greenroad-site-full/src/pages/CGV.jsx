import React from "react";
import { useTranslation } from "react-i18next";

const CGV = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("legal.cgv.title")}</h1>

        <div className="space-y-6">
          {/* Article 1 - Objet */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 1 - {t("legal.cgv.article1.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article1.content")}</p>
          </section>

          {/* Article 2 - Services */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 2 - {t("legal.cgv.article2.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article2.content")}</p>
          </section>

          {/* Article 3 - Réservation */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 3 - {t("legal.cgv.article3.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article3.content")}</p>
          </section>

          {/* Article 4 - Tarifs */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 4 - {t("legal.cgv.article4.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article4.content")}</p>
          </section>

          {/* Article 5 - Paiement */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 5 - {t("legal.cgv.article5.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article5.content")}</p>
          </section>

          {/* Article 6 - Annulation */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 6 - {t("legal.cgv.article6.title")}
            </h2>
            <div className="text-zinc-300 space-y-2">
              <p>{t("legal.cgv.article6.content")}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t("legal.cgv.article6.rule1")}</li>
                <li>{t("legal.cgv.article6.rule2")}</li>
                <li>{t("legal.cgv.article6.rule3")}</li>
              </ul>
            </div>
          </section>

          {/* Article 7 - Responsabilité */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 7 - {t("legal.cgv.article7.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article7.content")}</p>
          </section>

          {/* Article 8 - Bagages */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 8 - {t("legal.cgv.article8.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article8.content")}</p>
          </section>

          {/* Article 9 - Réclamations */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 9 - {t("legal.cgv.article9.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article9.content")}</p>
          </section>

          {/* Article 10 - Droit applicable */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 10 - {t("legal.cgv.article10.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgv.article10.content")}</p>
          </section>
        </div>

        <p className="text-zinc-500 text-sm mt-8 text-center">
          {t("legal.lastUpdate")}: 01/01/2025
        </p>
      </div>
    </div>
  );
};

export default CGV;
