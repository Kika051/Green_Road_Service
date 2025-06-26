import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-black bg-opacity-90 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center text-white">
        {/* Logo & nom */}
        <div className="flex items-center space-x-2">
          <span className="text-green-500 text-4xl font-extrabold leading-none">
            G
          </span>
          <span className="text-base md:text-lg font-light">
            GreenRoad<span className="font-semibold">Services</span>
          </span>
        </div>

        {/* Menu */}
        <div className="space-x-6 text-sm md:text-base">
          <Link to="/" className="hover:text-primary transition">
            Accueil
          </Link>
          <Link to="/booking" className="hover:text-primary transition">
            Réserver
          </Link>
          <Link to="/services" className="hover:text-primary transition">
            Services
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
