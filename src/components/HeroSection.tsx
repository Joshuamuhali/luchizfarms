import { useState, useEffect } from "react";
import { Phone, MessageCircle, Wheat, ArrowRight, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const WHATSAPP_LINK = "https://wa.me/260979654602";
const PHONE_NUMBER = "+260 979 654 602";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: heroImage,
      title: "Fresh from Chisamba",
      subtitle: "Quality Livestock",
      description: "Premium cattle, pigs, and poultry raised with care on our Zambian farms"
    },
    {
      image: heroImage,
      title: "Organic Vegetables",
      subtitle: "Farm-to-Table Fresh",
      description: "Seasonal produce grown naturally without harmful chemicals"
    },
    {
      image: heroImage,
      title: "Zambian Pride",
      subtitle: "Supporting Local Farmers",
      description: "Proudly contributing to Zambia's agricultural heritage and food security"
    },
    {
      image: heroImage,
      title: "Direct Delivery",
      subtitle: "From Farm to You",
      description: "Fresh products delivered straight from our fields to your doorstep"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Image Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </div>
        ))}
      </div>

      {/* Slider Controls */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-8 text-white">
                        
            {/* Dynamic Content */}
            <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-white">{slides[currentSlide].title}</span>
                <br />
                <span className="text-farm-sunshine">{slides[currentSlide].subtitle}</span>
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Tagline */}
            <div className="opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <Wheat className="w-5 h-5 text-farm-sunshine" />
                <span className="text-lg font-medium text-white italic">
                  "If you ate today, thank a farmer"
                </span>
                <Wheat className="w-5 h-5 text-farm-sunshine" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-farm-leaf hover:bg-farm-forest text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 text-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Order via WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#products"
                className="bg-farm-sunshine hover:bg-farm-wheat text-farm-soil font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 text-lg"
              >
                <Leaf className="w-5 h-5" />
                View Products
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="flex items-center justify-center gap-6 text-white/80 text-sm opacity-0 animate-fade-up" style={{ animationDelay: "800ms" }}>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Phone className="w-4 h-4 text-farm-sunshine" />
                <span className="font-medium">{PHONE_NUMBER}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Leaf className="w-4 h-4 text-farm-sunshine" />
                <span className="font-medium">Chisamba, Zambia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
