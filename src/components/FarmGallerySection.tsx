import { useState } from "react";
import { Camera, Heart, Sprout, TreePine, Sun, Wind, Droplets, Wheat } from "lucide-react";

const FarmGallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Helper function to get image paths
  const getImagePath = (filename: string) => new URL(`/src/assets/farm-photos/${filename}`, import.meta.url).href;

  // Use ALL the farm photos from 3u Export Photos
  const galleryImages = [
    {
      id: 1,
      src: getImagePath("Chibwabwa.JPG"),
      alt: "Fresh Chibwabwa vegetables from our farm",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 2,
      src: getImagePath("ChineseCabbage.JPG"),
      alt: "Chinese Cabbage grown in our fertile soil",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 3,
      src: getImagePath("cabbage.JPG"),
      alt: "Fresh cabbage harvested from our fields",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 4,
      src: getImagePath("Lumanda.JPG"),
      alt: "Lumanda leaves ready for harvest",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 5,
      src: getImagePath("Okra.JPG"),
      alt: "Fresh Okra pods from our garden",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 6,
      src: getImagePath("Onions.JPG"),
      alt: "Onions cultivated at Luchiz Farm",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 7,
      src: getImagePath("Tomatoes.JPG"),
      alt: "Ripe tomatoes from our farm",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 8,
      src: getImagePath("pepper.JPG"),
      alt: "Colorful peppers grown on our farm",
      category: "Vegetables",
      icon: Sprout
    },
    {
      id: 9,
      src: getImagePath("Pork Chops.JPG"),
      alt: "Quality pork products from our livestock",
      category: "Meat",
      icon: Heart
    },
    {
      id: 10,
      src: getImagePath("Goat Meat.JPG"),
      alt: "Fresh goat meat from our farm",
      category: "Meat",
      icon: Heart
    },
    {
      id: 11,
      src: getImagePath("IMG_3844.JPG"),
      alt: "Farm operations at Luchiz Farm",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 12,
      src: getImagePath("IMG_3849.JPG"),
      alt: "Daily activities on our farm",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 13,
      src: getImagePath("IMG_3852.JPG"),
      alt: "Scenes from Luchiz Farm",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 14,
      src: getImagePath("IMG_3853.JPG"),
      alt: "Our farming environment",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 15,
      src: getImagePath("IMG_3856.JPG"),
      alt: "Life at Luchiz Farm",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 16,
      src: getImagePath("IMG_3867.PNG"),
      alt: "Beautiful farm landscape at Luchiz Farm",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 17,
      src: getImagePath("IMG_3868.PNG"),
      alt: "Scenic views from our farm in Chisamba",
      category: "Farm Life",
      icon: TreePine
    },
    {
      id: 18,
      src: getImagePath("IMG_3869.JPG"),
      alt: "Agricultural operations at Luchiz Farm",
      category: "Farm Life",
      icon: TreePine
    }
  ];

  const farmFeatures = [
    { icon: Sun, text: "Sunny Location", description: "Perfect growing conditions" },
    { icon: Droplets, text: "Fresh Water", description: "Natural irrigation systems" },
    { icon: Wind, text: "Clean Air", description: "Pristine farming environment" },
    { icon: Wheat, text: "Quality Harvest", description: "Premium farm products" }
  ];

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-background to-farm-sky/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-farm-card rounded-full px-6 py-2 border-farm shadow-farm">
            <Camera className="w-5 h-5 text-farm-leaf" />
            <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Window Into Our Farm</span>
            <Camera className="w-5 h-5 text-farm-leaf" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-farm-sunshine">Our Farm</span>
            <br />
            <span className="text-foreground">Where Your Food Comes From</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This is Luchiz Farm in Chisamba. Here's what we grow and how we do it. 
            See the vegetables, meat, and daily work that brings food to your table.
          </p>
        </div>

        {/* Farm Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {farmFeatures.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-farm-leaf rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-farm-forest transition-colors duration-300 group-hover:scale-110">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-1">{feature.text}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => setSelectedImage(image.id)}
            >
              <div className="aspect-square">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                  <image.icon className="w-4 h-4 text-farm-leaf" />
                  <span className="text-xs font-medium text-foreground">{image.category}</span>
                </div>
              </div>

              {/* Hover Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-medium text-sm">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-farm-card rounded-3xl p-8 border-farm shadow-farm">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Good Food from Our Farm
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            This is what we grow every day. Fresh vegetables and quality meat, 
            straight from our fields in Chisamba to your kitchen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#order"
              className="inline-flex items-center gap-2 bg-farm-leaf text-white px-8 py-3 rounded-xl font-medium hover:bg-farm-forest transition-colors duration-300"
            >
              <Wheat className="w-5 h-5" />
              Order Products
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-farm-sunshine text-white px-8 py-3 rounded-xl font-medium hover:bg-yellow-500 transition-colors duration-300"
            >
              <Camera className="w-5 h-5" />
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={galleryImages.find(img => img.id === selectedImage)?.src}
              alt={galleryImages.find(img => img.id === selectedImage)?.alt}
              className="w-full h-full object-contain rounded-2xl"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FarmGallerySection;
