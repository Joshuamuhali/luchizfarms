const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground/70 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-primary-foreground text-lg">🌾 Luchiz Farm</h3>
            <p className="text-sm leading-relaxed">
              Proudly Zambian. Fresh produce from Chisamba delivered to Kabwe and beyond.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-display font-bold text-primary-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:text-farm-golden transition-colors">Home</a>
              <a href="#about" className="hover:text-farm-golden transition-colors">About</a>
              <a href="#products" className="hover:text-farm-golden transition-colors">Products</a>
              <a href="#contact" className="hover:text-farm-golden transition-colors">Contact</a>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-display font-bold text-primary-foreground">Contact</h4>
            <div className="text-sm space-y-1">
              <p>📞 +260 979 654 602</p>
              <p>📍 Farm: Chisamba, Central Province</p>
              <p>🏠 Base: Kabwe</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center text-xs">
          <p>All products are farm-fresh and responsibly raised.</p>
          <p className="mt-1 text-farm-golden font-display italic">
            "If you ate today, thank a farmer." 🌾
          </p>
          <p className="mt-3">© {new Date().getFullYear()} Luchiz Farm. All rights reserved.</p>
          <p className="mt-2 text-primary-foreground/40">Designed by Joshua Muhali</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
