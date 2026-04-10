import { useState } from "react";
import { Menu, X, Wheat, Phone, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
const logoImage = new URL("/src/assets/logo.png", import.meta.url).href;

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Order", href: "/order" },
  { label: "Gallery", href: "/gallery" },
  { label: "How It Works", href: "/how-to-order" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImage}
            alt="Luchiz Farm Logo"
            className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">Luchiz Farm</h1>
            <p className="text-xs text-muted-foreground">Fresh from Zambia</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-foreground hover:text-farm-leaf font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:+260979654602"
            className="flex items-center gap-2 bg-farm-card rounded-full px-4 py-2 border-farm hover:bg-farm-sunshine/10 transition-all duration-300 group"
          >
            <Phone className="w-4 h-4 text-farm-leaf group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground">Call</span>
          </a>
          <a
            href="https://wa.me/260979654602"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-farm flex items-center gap-2 text-sm group"
          >
            <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Order Now
          </a>
        </div>

        {/* Mobile toggle */}
        <button 
          onClick={() => setOpen(!open)} 
          className="lg:hidden flex items-center justify-center w-12 h-12 bg-farm-card rounded-xl border-farm hover:bg-farm-sunshine/10 transition-all duration-300"
        >
          {open ? <X className="w-6 h-6 text-farm-leaf" /> : <Menu className="w-6 h-6 text-farm-leaf" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-farm-cloud/98 backdrop-blur-xl border-t border-farm-soil/10 px-4 pb-6">
          <div className="pt-6 space-y-4">
            {navLinks.map((l) => (
              <Link 
                key={l.label} 
                to={l.href} 
                onClick={() => setOpen(false)} 
                className="block text-foreground/80 hover:text-farm-leaf transition-colors py-3 font-medium text-lg border-b border-farm-soil/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <a
                href="tel:+260979654602"
                className="flex items-center justify-center gap-2 bg-farm-card rounded-xl px-4 py-3 border-farm hover:bg-farm-sunshine/10 transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-farm-leaf" />
                <span className="font-medium">Call Us</span>
              </a>
              <a
                href="https://wa.me/260979654602"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-farm flex items-center justify-center gap-2 w-full"
              >
                <ShoppingCart className="w-5 h-5" />
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
