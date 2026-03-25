import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Order", href: "#order" },
  { label: "How It Works", href: "#how-to-order" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-foreground/80 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <a href="#" className="font-display font-bold text-xl text-primary-foreground">
          🌾 Luchiz Farm
        </a>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-primary-foreground/70 hover:text-farm-golden transition-colors text-sm font-medium">
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/260979654602"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg text-sm hover:bg-primary/90 transition-all"
          >
            Order Now
          </a>
        </div>
        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-foreground/95 backdrop-blur-md border-t border-primary-foreground/10 px-4 pb-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-primary-foreground/70 hover:text-farm-golden py-2 text-sm">
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/260979654602"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm text-center"
          >
            Order Now
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
