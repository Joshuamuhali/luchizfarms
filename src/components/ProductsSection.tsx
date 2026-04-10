import { MessageCircle, Circle, Bird, Drumstick, Beef, UtensilsCrossed, Heart, Square, Carrot, Leaf, Wheat, ShoppingCart } from "lucide-react";
import pigsImage from "@/assets/product-pigs.jpg";
import sheepImage from "@/assets/product-sheep.jpg";
import chickensImage from "@/assets/product-chickens.jpg";
import vegetablesImage from "@/assets/product-vegetables.jpg";

const WHATSAPP_LINK = "https://wa.me/260979654602";

const products = [
  {
    name: "Pigs",
    icon: Circle,
    image: pigsImage,
    description: "Healthy, responsibly raised pigs. Perfect for individuals, restaurants, and retailers looking for quality pork.",
  },
  {
    name: "Sheep",
    icon: Heart,
    image: sheepImage,
    description: "Free-range sheep raised on lush Chisamba pastures. Ideal for fresh, quality meat.",
  },
  {
    name: "Broiler Chickens",
    icon: Bird,
    image: chickensImage,
    description: "Farm-fresh broiler chickens, raised with care. Ready for your kitchen or business.",
  },
  {
    name: "Village Chickens",
    icon: Drumstick,
    image: chickensImage,
    description: "Traditional village-raised chickens with authentic flavor and texture. K150 per whole chicken.",
  },
  {
    name: "Pork Chops",
    icon: Beef,
    image: pigsImage,
    description: "Premium quality pork chops, K110 per kg. Perfect for grilling and frying.",
  },
  {
    name: "Mixed Cut Beef",
    icon: Beef,
    image: sheepImage,
    description: "Quality mixed cut beef, K120 per kg. Ideal for various cooking methods.",
  },
  {
    name: "Steak & Steak on Bone",
    icon: Beef,
    image: sheepImage,
    description: "Premium steak options, K130 per kg. Including bone-in varieties.",
  },
  {
    name: "Lamb",
    icon: UtensilsCrossed,
    image: sheepImage,
    description: "Tender lamb meat, K100 per kg. Raised on our green pastures.",
  },
  {
    name: "Goat Meat",
    icon: Heart,
    image: sheepImage,
    description: "Quality goat meat, K100 per kg. A local favorite.",
  },
  {
    name: "Beef Offals",
    icon: Beef,
    image: sheepImage,
    description: "Fresh beef offals, K80 per kg. Various cuts available.",
  },
  {
    name: "Goat Offals",
    icon: Heart,
    image: sheepImage,
    description: "Quality goat offals, K70 per kg. Clean and fresh.",
  },
  {
    name: "Pork Trotters",
    icon: Circle,
    image: pigsImage,
    description: "Fresh pork trotters, K70 per kg. Perfect for traditional soups.",
  },
  {
    name: "Cow Trotters",
    icon: Square,
    image: sheepImage,
    description: "Fresh cow trotters, price varies by size. Contact for pricing.",
  },
  {
    name: "Assorted Vegetables",
    icon: Carrot,
    image: vegetablesImage,
    description: "Seasonal fresh vegetables grown organically. From tomatoes to broccoli, straight from the field.",
  },
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Compact Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-farm-leaf">Farm Products</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quality livestock and fresh vegetables from Chisamba, Zambia
          </p>
        </div>

        {/* Compact Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {products.map((product) => (
            <div
              key={product.name}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-farm-leaf transition-all duration-200 overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={product.image}
                  alt={`${product.name} from Luchiz Farm`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                    <product.icon className="w-4 h-4 text-farm-leaf" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-foreground text-sm truncate">{product.name}</h3>
                
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                {/* CTA Button */}
                <a
                  href={`${WHATSAPP_LINK}?text=Hi%20Luchiz%20Farm!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-farm-leaf text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-farm-forest transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3 h-3" />
                  Order
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-farm-leaf text-white px-6 py-3 rounded-full">
            <Wheat className="w-4 h-4" />
            <span className="text-sm font-medium">Ready to order?</span>
            <Wheat className="w-4 h-4" />
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            Contact us today for fresh farm products!
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
