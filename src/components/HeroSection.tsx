import { Phone, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";
import logoImage from "@/assets/luchiz-farm-logo.jpg";

const WHATSAPP_LINK = "https://wa.me/260979654602";
const PHONE_NUMBER = "+260 979 654 602";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Luchiz Farm fields in Chisamba, Zambia" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0ms" }}>
            <img src={logoImage} alt="Luchiz Farm logo" className="w-20 h-20 rounded-full border-2 border-farm-golden object-cover shadow-lg" />
            <span className="text-farm-golden font-display text-xl font-semibold tracking-wide">Luchiz Farm</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight opacity-0 animate-fade-up" style={{ animationDelay: "150ms" }}>
            Fresh from Chisamba,{" "}
            <span className="text-farm-golden">Delivered to Kabwe</span>{" "}
            & Beyond
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 font-body italic opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
            🌾 "If you ate today, thank a farmer."
          </p>

          <p className="text-primary-foreground/70 font-body max-w-lg opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
            Luchiz Farm is a proud Zambian-owned farm bringing quality livestock and fresh vegetables straight from our fields to your table.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 opacity-0 animate-fade-up" style={{ animationDelay: "500ms" }}>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Order Now
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8 py-4 rounded-lg text-lg transition-all"
            >
              Learn More
            </a>
          </div>

          <div className="flex items-center gap-2 text-primary-foreground/60 text-sm pt-2 opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
            <Phone className="w-4 h-4" />
            <span>{PHONE_NUMBER}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
