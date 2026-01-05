import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-green-500 font-bold text-2xl">G</span>
              <span className="text-white font-semibold text-xl">
                Green Road Services
              </span>
            </Link>
            <p className="text-zinc-400 text-sm">{t("footer.description")}</p>
            {/* Réseaux sociaux */}
            <div className="flex gap-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-green-500 transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-green-500 transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-green-500 transition"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("footer.navigation")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/booking"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("nav.book")}
                </Link>
              </li>
              <li>
                <Link
                  to="/forfaits"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("nav.packages")}
                </Link>
              </li>
              <li>
                <Link
                  to="/mise-a-disposition"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("nav.availability")}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("nav.services")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/mentions-legales"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("footer.legalNotice")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cgu"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("footer.cgu")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cgv"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("footer.cgv")}
                </Link>
              </li>
              <li>
                <Link
                  to="/politique-confidentialite"
                  className="text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-zinc-400 text-sm">
                <MapPin size={16} className="text-green-500" />
                <span>Tinqueux, France</span>
              </li>
              <li>
                <a
                  href="tel:+33XXXXXXXXX"
                  className="flex items-center gap-2 text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  <Phone size={16} className="text-green-500" />
                  <span>+33 6 18 71 05 34</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@greenroadservices.fr"
                  className="flex items-center gap-2 text-zinc-400 hover:text-green-500 transition text-sm"
                >
                  <Mail size={16} className="text-green-500" />
                  <span>contact.greenroadservices@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
          <p className="text-zinc-500 text-sm">
            © {currentYear} Green Road Services. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
