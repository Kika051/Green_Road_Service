import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "de", flag: "🇩🇪" },
  { code: "it", flag: "🇮🇹" },
  { code: "zh", flag: "🇨🇳" },
  { code: "ru", flag: "🇷🇺" },
  { code: "es", flag: "🇪🇸" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
      >
        <span className="text-xl">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-xl hover:bg-zinc-700 ${
                i18n.language === lang.code ? "bg-green-600/20" : ""
              }`}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
