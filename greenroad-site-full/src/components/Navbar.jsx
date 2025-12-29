import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, canAccessDashboard, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/booking', label: t('nav.book') },
    { to: '/forfaits', label: t('nav.packages') },
    { to: '/miseadisposition', label: t('nav.availability') },
    { to: '/services', label: t('nav.services') },
  ];

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 bg-black text-white relative">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 z-10">
        <span className="text-green-500 text-2xl font-extrabold">G</span>
        <span className="text-xl">GreenRoad<span className="font-bold">Services</span></span>
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 items-center">
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <Link to={to} className="hover:text-green-400 transition">{label}</Link>
          </li>
        ))}

        {canAccessDashboard && (
          <li>
            <Link to="/dashboard" className="text-green-400 font-semibold">{t('nav.dashboard')}</Link>
          </li>
        )}

        {user ? (
          <>
            <li><Link to="/account" className="hover:text-green-400">{t('nav.account')}</Link></li>
            <li><button onClick={logout} className="text-red-400">{t('nav.logout')}</button></li>
          </>
        ) : (
          <li><Link to="/login" className="hover:text-green-400">{t('nav.login')}</Link></li>
        )}

        <li><LanguageSwitcher /></li>
      </ul>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3 z-10">
        <LanguageSwitcher />
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-t border-zinc-800 md:hidden z-50">
          <ul className="p-4 space-y-3">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} onClick={() => setMenuOpen(false)} className="block py-2">{label}</Link>
              </li>
            ))}
            {canAccessDashboard && (
              <li><Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-green-400">{t('nav.dashboard')}</Link></li>
            )}
            <li className="border-t border-zinc-800 pt-3">
              {user ? (
                <>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="block py-2">{t('nav.account')}</Link>
                  <button onClick={logout} className="block py-2 text-red-400">{t('nav.logout')}</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2">{t('nav.login')}</Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
