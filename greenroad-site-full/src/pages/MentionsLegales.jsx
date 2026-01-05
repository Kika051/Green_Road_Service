import React from "react";
import { useTranslation } from "react-i18next";
import { Building, Mail, Phone, Globe, Server } from "lucide-react";

const MentionsLegales = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("legal.mentions.title")}</h1>

        {/* Éditeur du site */}
        <section className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Building className="text-green-500" size={24} />
            <h2 className="text-2xl font-semibold">
              {t("legal.mentions.editor.title")}
            </h2>
          </div>
          <div className="space-y-2 text-zinc-300">
            <p>
              <strong>{t("legal.mentions.editor.name")}:</strong> Green Road
              Services
            </p>
            <p>
              <strong>{t("legal.mentions.editor.status")}:</strong> SARL
            </p>
            <p>
              <strong>{t("legal.mentions.editor.siret")}:</strong> 932770688
            </p>
            <p>
              <strong>{t("legal.mentions.editor.address")}:</strong> 35 rue
              auguste humbert, 51430 Tinqueux
            </p>
            <p>
              <strong>{t("legal.mentions.editor.phone")}:</strong> +33 618710534
            </p>
            <p>
              <strong>{t("legal.mentions.editor.email")}:</strong>{" "}
              contact.greenroadservices@gmail.com
            </p>
            <p>
              <strong>{t("legal.mentions.editor.director")}:</strong> GERON
              Florian
            </p>
          </div>
        </section>

        {/* Hébergeur */}
        <section className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-green-500" size={24} />
            <h2 className="text-2xl font-semibold">
              {t("legal.mentions.host.title")}
            </h2>
          </div>
          <div className="space-y-2 text-zinc-300">
            <p>
              <strong>{t("legal.mentions.host.name")}:</strong> Firebase (Google
              Cloud)
            </p>
            <p>
              <strong>{t("legal.mentions.host.address")}:</strong> Google LLC,
              1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
            </p>
            <p>
              <strong>{t("legal.mentions.host.website")}:</strong>{" "}
              https://firebase.google.com
            </p>
          </div>
        </section>

        {/* Activité */}
        <section className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-green-500" size={24} />
            <h2 className="text-2xl font-semibold">
              {t("legal.mentions.activity.title")}
            </h2>
          </div>
          <div className="space-y-2 text-zinc-300">
            <p>{t("legal.mentions.activity.description")}</p>
            <p>
              <strong>{t("legal.mentions.activity.license")}:</strong>{" "}
              EVTC051240079
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <h2 className="text-2xl font-semibold mb-4">
            {t("legal.mentions.intellectual.title")}
          </h2>
          <p className="text-zinc-300">
            {t("legal.mentions.intellectual.description")}
          </p>
        </section>

        {/* Contact */}
        <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-2xl font-semibold mb-4">
            {t("legal.mentions.contact.title")}
          </h2>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:contact@greenroadservices.fr"
              className="flex items-center gap-2 text-green-400 hover:text-green-300"
            >
              <Mail size={20} />
              contact.greenroadservices@gmail.com
            </a>
            <a
              href="tel:+33XXXXXXXXX"
              className="flex items-center gap-2 text-green-400 hover:text-green-300"
            >
              <Phone size={20} />
              +33 618710534
            </a>
          </div>
        </section>

        <p className="text-zinc-500 text-sm mt-8 text-center">
          {t("legal.lastUpdate")}: 01/01/2025
        </p>
      </div>
    </div>
  );
};

export default MentionsLegales;
