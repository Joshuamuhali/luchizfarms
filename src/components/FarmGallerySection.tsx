import { useState, useEffect } from "react";
import { Camera, Sprout, Sun, Wind, Droplets, Wheat, Heart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const PLACEHOLDER_IMAGE = "https://drive.google.com/uc?export=view&id=REPLACE_ME";

interface GalleryImage {
  id: string;
  url: string;
  productName: string;
  productId: string;
}

const FarmGallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const { products, loading, error } = useProducts();

  useEffect(() => {
    // Show 6 images: 4 user-provided + 2 additional
    const galleryImages: GalleryImage[] = [
      {
        id: 'lamb',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/IMG_3853.JPG',
        productName: 'Lamb',
        productId: 'lamb'
      },
      {
        id: 'beef-offals',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/IMG_3856.JPG',
        productName: 'Beef Offals',
        productId: 'beef-offals'
      },
      {
        id: 'village-chicken',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/IMG_3868.PNG',
        productName: 'Village Chicken (Dressed)',
        productId: 'village-chicken'
      },
      {
        id: 'impwa',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/impwa.jpg',
        productName: 'Impwa',
        productId: 'impwa'
      },
      {
        id: 'okra',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/IMG_3856.JPG',
        productName: 'Okra',
        productId: 'okra'
      },
      {
        id: 'chibwabwa',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/IMG_3869.JPG',
        productName: 'Chibwabwa',
        productId: 'chibwabwa'
      },
      {
        id: 'tomatoes',
        url: 'https://xmaawnzzlnpbtfxzsduj.supabase.co/storage/v1/object/public/products/IMG_3858.JPG',
        productName: 'Tomatoes',
        productId: 'tomatoes'
      }
    ];
    
    setGalleryImages(galleryImages);
  }, []);

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'Leaf': Sprout, 'Beef': Heart, 'UtensilsCrossed': Heart,
      'Heart': Heart, 'Circle': Heart, 'Square': Heart, 'Bird': Heart, 'Drumstick': Heart
    };
    return icons[iconName] || Sprout;
  };

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
          {loading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`loading-${index}`} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="text-red-500 text-2xl">!</span>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : galleryImages.length > 0 ? (
            galleryImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square">
                  <img
                    src={image.url || PLACEHOLDER_IMAGE}
                    alt={image.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <Sprout className="w-4 h-4 text-farm-leaf" />
                    <span className="text-xs font-medium text-foreground">Luchiz Farm</span>
                  </div>
                </div>

                {/* Hover Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-medium text-sm">{image.productName}</p>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No gallery images available yet.</p>
            </div>
          )}
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
              src={selectedImage.url || PLACEHOLDER_IMAGE}
              alt={selectedImage.productName}
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
