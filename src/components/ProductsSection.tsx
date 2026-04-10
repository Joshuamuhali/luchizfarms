import { MessageCircle, Carrot, Beef } from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/260979654602";

const vegetables = [
  { name: "Rape", price: 5, unit: "bundle" },
  { name: "Chibwabwa", price: 5, unit: "bundle" },
  { name: "Chinese Cabbage", price: 5, unit: "head" },
  { name: "Lumanda", price: 5, unit: "bundle" },
  { name: "Impwa", price: 5, unit: "bundle" },
  { name: "Okra", price: 5, unit: "bundle" },
  { name: "Onions", price: null, unit: "kg", note: "Market Price" },
  { name: "Tomatoes", price: null, unit: "kg", note: "Market Price" },
  { name: "Carrots", price: 10, unit: "bundle" },
  { name: "Green Pepper", price: 5, unit: "piece" },
  { name: "Red & Yellow Pepper", price: 20, unit: "piece" },
];

const meat = [
  { name: "Pork Chops", price: 110, unit: "kg" },
  { name: "Mixed Cut Beef (Stew Cuts)", price: 120, unit: "kg" },
  { name: "Steak & Steak on Bone", price: 130, unit: "kg" },
  { name: "Lamb", price: 100, unit: "kg" },
  { name: "Goat Meat", price: 100, unit: "kg" },
  { name: "Beef Offals", price: 80, unit: "kg" },
  { name: "Goat Offals", price: 70, unit: "kg" },
  { name: "Pork Trotters", price: 70, unit: "kg" },
  { name: "Cow Trotters", price: null, unit: "piece", note: "Contact for pricing" },
  { name: "Broiler Chicken (Dressed)", price: 150, unit: "whole" },
  { name: "Village Chicken (Dressed)", price: 150, unit: "whole" },
];

const ProductsSection = () => {
  const generateWhatsAppMessage = (items: Array<{name: string, quantity?: number}>) => {
    const orderList = items.map(item => {
      const qty = item.quantity || 1;
      return `${qty} ${item.name}`;
    }).join('\n');
    
    return `Name:\nLocation:\nOrder:\n\n${orderList}`;
  };

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Clean Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fresh Meat and Vegetables
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Ready for Your Kitchen or Business
          </p>
          <p className="text-muted-foreground">
            Select your items, choose quantities, and send your order via WhatsApp.
            Clear pricing. Direct supply.
          </p>
        </div>

        {/* Section A: Fresh Vegetables */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Carrot className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Fresh Vegetables</h3>
              <p className="text-sm text-muted-foreground">Fast-moving items with market pricing</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vegetables.map((veg) => (
              <div
                key={veg.name}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">{veg.name}</h4>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                    {veg.unit}
                  </span>
                </div>
                <div className="text-lg font-bold text-farm-leaf mb-3">
                  {veg.price ? `K${veg.price}` : veg.note || 'Market Price'}
                </div>
                <a
                  href={`${WHATSAPP_LINK}?text=${encodeURIComponent(generateWhatsAppMessage([{name: veg.name}]))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-farm-leaf text-white text-sm font-medium py-2 rounded hover:bg-farm-forest transition-colors text-center"
                >
                  Order via WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Meat & Poultry */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Beef className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Meat & Poultry</h3>
              <p className="text-sm text-muted-foreground">Higher value items with fixed pricing</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {meat.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                    {item.unit}
                  </span>
                </div>
                <div className="text-lg font-bold text-farm-leaf mb-3">
                  {item.price ? `K${item.price}` : item.note || 'Contact for pricing'}
                </div>
                <a
                  href={`${WHATSAPP_LINK}?text=${encodeURIComponent(generateWhatsAppMessage([{name: item.name}]))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-farm-leaf text-white text-sm font-medium py-2 rounded hover:bg-farm-forest transition-colors text-center"
                >
                  Order via WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Clean Call to Action */}
        <div className="text-center bg-gray-50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Ready to Order?
          </h3>
          <p className="text-muted-foreground mb-6">
            Select your items above and send your order via WhatsApp for direct supply from our farm.
          </p>
          <div className="inline-flex items-center gap-2 bg-farm-leaf text-white px-6 py-3 rounded-full">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Order via WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
