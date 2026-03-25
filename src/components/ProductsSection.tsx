import { MessageCircle } from "lucide-react";
import pigsImage from "@/assets/product-pigs.jpg";
import sheepImage from "@/assets/product-sheep.jpg";
import chickensImage from "@/assets/product-chickens.jpg";
import vegetablesImage from "@/assets/product-vegetables.jpg";

const WHATSAPP_LINK = "https://wa.me/260979654602";

const products = [
  {
    name: "Pigs",
    emoji: "🐖",
    image: pigsImage,
    description: "Healthy, responsibly raised pigs. Perfect for individuals, restaurants, and retailers looking for quality pork.",
  },
  {
    name: "Sheep",
    emoji: "🐑",
    image: sheepImage,
    description: "Free-range sheep raised on lush Chisamba pastures. Ideal for fresh, quality meat.",
  },
  {
    name: "Broiler Chickens",
    emoji: "🐓",
    image: chickensImage,
    description: "Farm-fresh broiler chickens, raised with care. Ready for your kitchen or business.",
  },
  {
    name: "Village Chickens",
    emoji: "🐔",
    image: chickensImage,
    description: "Traditional village-raised chickens with authentic flavor and texture. K120 per whole chicken.",
  },
  {
    name: "Pork Chops",
    emoji: "🥩",
    image: pigsImage,
    description: "Premium quality pork chops, K110 per kg. Perfect for grilling and frying.",
  },
  {
    name: "Mixed Cut Beef",
    emoji: "🥩",
    image: sheepImage,
    description: "Quality mixed cut beef, K120 per kg. Ideal for various cooking methods.",
  },
  {
    name: "Steak & Steak on Bone",
    emoji: "🥩",
    image: sheepImage,
    description: "Premium steak options, K130 per kg. Including bone-in varieties.",
  },
  {
    name: "Lamb",
    emoji: "🍖",
    image: sheepImage,
    description: "Tender lamb meat, K100 per kg. Raised on our green pastures.",
  },
  {
    name: "Goat Meat",
    emoji: "🐐",
    image: sheepImage,
    description: "Quality goat meat, K100 per kg. A local favorite.",
  },
  {
    name: "Beef Offals",
    emoji: "🥩",
    image: sheepImage,
    description: "Fresh beef offals, K80 per kg. Various cuts available.",
  },
  {
    name: "Goat Offals",
    emoji: "🐐",
    image: sheepImage,
    description: "Quality goat offals, K70 per kg. Clean and fresh.",
  },
  {
    name: "Pork Trotters",
    emoji: "🐷",
    image: pigsImage,
    description: "Fresh pork trotters, K70 per kg. Perfect for traditional soups.",
  },
  {
    name: "Cow Trotters",
    emoji: "🐄",
    image: sheepImage,
    description: "Fresh cow trotters, price varies by size. Contact for pricing.",
  },
  {
    name: "Assorted Vegetables",
    emoji: "🥦",
    image: vegetablesImage,
    description: "Seasonal fresh vegetables grown organically. From tomatoes to broccoli, straight from the field.",
  },
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <span className="text-secondary font-semibold uppercase tracking-widest text-sm">What We Offer</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Our <span className="text-primary">Products</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Quality farm produce, raised and grown with care in Chisamba, Zambia.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={product.image}
                  alt={`${product.name} from Luchiz Farm`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <span>{product.emoji}</span> {product.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
                <a
                  href={`${WHATSAPP_LINK}?text=Hi%20Luchiz%20Farm!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-all w-full justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  Order via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
