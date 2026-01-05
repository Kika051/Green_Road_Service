import React from "react";
import { useTranslation } from "react-i18next";

const CGU = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("legal.cgu.title")}</h1>

        <div className="space-y-6">
          {/* Article 1 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 1 - {t("legal.cgu.article1.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article1.content")}</p>
          </section>

          {/* Article 2 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 2 - {t("legal.cgu.article2.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article2.content")}</p>
          </section>

          {/* Article 3 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 3 - {t("legal.cgu.article3.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article3.content")}</p>
          </section>

          {/* Article 4 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 4 - {t("legal.cgu.article4.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article4.content")}</p>
          </section>

          {/* Article 5 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 5 - {t("legal.cgu.article5.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article5.content")}</p>
          </section>

          {/* Article 6 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 6 - {t("legal.cgu.article6.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article6.content")}</p>
          </section>

          {/* Article 7 */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              Article 7 - {t("legal.cgu.article7.title")}
            </h2>
            <p className="text-zinc-300">{t("legal.cgu.article7.content")}</p>
          </section>
        </div>

        <p className="text-zinc-500 text-sm mt-8 text-center">
          {t("legal.lastUpdate")}: 01/01/2025
        </p>
      </div>
    </div>
  );
};

export default CGU;
