import React from "react";
import { useTranslation } from "react-i18next";
import { Shield, Database, Lock, Eye, Trash2, Mail } from "lucide-react";

const PolitiqueConfidentialite = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("legal.privacy.title")}</h1>

        <div className="space-y-6">
          {/* Introduction */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">
                {t("legal.privacy.intro.title")}
              </h2>
            </div>
            <p className="text-zinc-300">{t("legal.privacy.intro.content")}</p>
          </section>

          {/* Données collectées */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">
                {t("legal.privacy.data.title")}
              </h2>
            </div>
            <div className="text-zinc-300">
              <p className="mb-3">{t("legal.privacy.data.content")}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t("legal.privacy.data.item1")}</li>
                <li>{t("legal.privacy.data.item2")}</li>
                <li>{t("legal.privacy.data.item3")}</li>
                <li>{t("legal.privacy.data.item4")}</li>
                <li>{t("legal.privacy.data.item5")}</li>
              </ul>
            </div>
          </section>

          {/* Utilisation des données */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">
                {t("legal.privacy.usage.title")}
              </h2>
            </div>
            <div className="text-zinc-300">
              <p className="mb-3">{t("legal.privacy.usage.content")}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t("legal.privacy.usage.item1")}</li>
                <li>{t("legal.privacy.usage.item2")}</li>
                <li>{t("legal.privacy.usage.item3")}</li>
                <li>{t("legal.privacy.usage.item4")}</li>
              </ul>
            </div>
          </section>

          {/* Sécurité */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">
                {t("legal.privacy.security.title")}
              </h2>
            </div>
            <p className="text-zinc-300">
              {t("legal.privacy.security.content")}
            </p>
          </section>

          {/* Droits */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">
                {t("legal.privacy.rights.title")}
              </h2>
            </div>
            <div className="text-zinc-300">
              <p className="mb-3">{t("legal.privacy.rights.content")}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t("legal.privacy.rights.item1")}</li>
                <li>{t("legal.privacy.rights.item2")}</li>
                <li>{t("legal.privacy.rights.item3")}</li>
                <li>{t("legal.privacy.rights.item4")}</li>
                <li>{t("legal.privacy.rights.item5")}</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-3 text-green-500">
              {t("legal.privacy.cookies.title")}
            </h2>
            <p className="text-zinc-300">
              {t("legal.privacy.cookies.content")}
            </p>
          </section>

          {/* Contact */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">
                {t("legal.privacy.contact.title")}
              </h2>
            </div>
            <p className="text-zinc-300">
              {t("legal.privacy.contact.content")}
            </p>
            <a
              href="mailto:contact@greenroadservices.fr"
              className="text-green-400 hover:text-green-300 mt-2 inline-block"
            >
              contact@greenroadservices.fr
            </a>
          </section>
        </div>

        <p className="text-zinc-500 text-sm mt-8 text-center">
          {t("legal.lastUpdate")}: 01/01/2025
        </p>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
