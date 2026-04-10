import { Wheat, Phone, MapPin, Home, Mail, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-farm-soil text-white py-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-farm-sunshine rounded-xl flex items-center justify-center">
                <Wheat className="w-7 h-7 text-farm-soil" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Luchiz Farm</h3>
                <p className="text-farm-sunshine/80 text-sm">Fresh from Zambia</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              Proudly Zambian-owned farm bringing quality livestock and fresh vegetables 
              from our fields in Chisamba to your table across the nation.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-farm-sunshine/20 transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-farm-sunshine/20 transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/260979654602" className="w-10 h-10 bg-farm-sunshine rounded-xl flex items-center justify-center hover:bg-farm-wheat transition-all duration-300 hover:scale-110">
                <Phone className="w-5 h-5 text-farm-soil" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-farm-sunshine">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-white/80 hover:text-farm-sunshine transition-all duration-300 hover:translate-x-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-farm-sunshine rounded-full"></span>
                Home
              </a>
              <a href="#about" className="text-white/80 hover:text-farm-sunshine transition-all duration-300 hover:translate-x-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-farm-sunshine rounded-full"></span>
                About Us
              </a>
              <a href="#products" className="text-white/80 hover:text-farm-sunshine transition-all duration-300 hover:translate-x-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-farm-sunshine rounded-full"></span>
                Our Products
              </a>
              <a href="#order" className="text-white/80 hover:text-farm-sunshine transition-all duration-300 hover:translate-x-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-farm-sunshine rounded-full"></span>
                Order Now
              </a>
              <a href="#contact" className="text-white/80 hover:text-farm-sunshine transition-all duration-300 hover:translate-x-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-farm-sunshine rounded-full"></span>
                Contact
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-farm-sunshine">Our Products</h4>
            <div className="flex flex-col gap-3">
              <div className="text-white/80 hover:text-farm-sunshine transition-all duration-300 cursor-pointer">Fresh Vegetables</div>
              <div className="text-white/80 hover:text-farm-sunshine transition-all duration-300 cursor-pointer">Quality Livestock</div>
              <div className="text-white/80 hover:text-farm-sunshine transition-all duration-300 cursor-pointer">Farm Fresh Eggs</div>
              <div className="text-white/80 hover:text-farm-sunshine transition-all duration-300 cursor-pointer">Organic Produce</div>
              <div className="text-white/80 hover:text-farm-sunshine transition-all duration-300 cursor-pointer">Seasonal Items</div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-farm-sunshine">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-farm-sunshine/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-farm-sunshine" />
                </div>
                <div>
                  <p className="font-medium">Call/WhatsApp</p>
                  <p className="text-white/80">+260 979 654 602</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-farm-sunshine/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-farm-sunshine" />
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-white/80">Chisamba, Central Province</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-farm-sunshine/20 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-farm-sunshine" />
                </div>
                <div>
                  <p className="font-medium">Base Office</p>
                  <p className="text-white/80">Kabwe, Zambia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-white/60 mb-2">All products are farm-fresh and responsibly raised with love</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Wheat className="w-5 h-5 text-farm-sunshine" />
                <span className="text-farm-sunshine font-medium italic">"If you ate today, thank a farmer"</span>
                <Wheat className="w-5 h-5 text-farm-sunshine" />
              </div>
            </div>
            <div className="text-center md:text-right text-white/60 text-sm">
              <p>© {new Date().getFullYear()} Luchiz Farm. All rights reserved.</p>
              <p className="mt-1">Designed with <span className="text-farm-sunshine">Zambian Pride</span> by Joshua Muhali</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
