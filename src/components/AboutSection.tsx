import logoImage from "@/assets/luchiz-farm-logo.jpg";
import { MapPin, Home, Flag } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-farm-cream">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={logoImage}
              alt="Luchiz Farm - Proudly Zambian owned"
              className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
            />
          </div>
          <div className="space-y-6">
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Meet the <span className="text-primary">Farmer</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Based in Chisamba with operations extending to Kabwe and beyond, Luchiz Farm is dedicated to producing high-quality, healthy, organic fresh vegetables and responsibly raised livestock.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe in feeding Zambia with love and care. Our mission is to support local agriculture, practice ethical farming, and deliver the freshest produce straight from our fields to your table.
            </p>
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <p className="text-foreground font-display text-lg italic">
                "To produce high-quality, healthy, organic fresh vegetables and meat."
              </p>
              <span className="text-muted-foreground text-sm mt-2 block">— Mission Statement</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <div>
                <MapPin className="w-6 h-6 text-primary font-display mb-1" />
                Farm: Chisamba
              </div>
              <div>
                <Home className="w-6 h-6 text-primary font-display mb-1" />
                Based in: Kabwe
              </div>
              <div>
                <Flag className="w-6 h-6 text-primary font-display mb-1" />
                Proudly Zambian
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
