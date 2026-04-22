import { MessageCircle, Carrot, Beef } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const WHATSAPP_LINK = "https://wa.me/260979654602";

const ProductsSection = () => {
  const { vegetables, meat, loading, error } = useProducts();
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
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : vegetables.length > 0 ? (
              vegetables.map((veg) => (
                <div
                  key={veg.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{veg.name}</h4>
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                      {veg.unit}
                    </span>
                  </div>
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                    <img
                      src={veg.image_url || "/placeholder.svg"}
                      alt={veg.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-lg font-bold text-farm-leaf mb-3">
                    {veg.price ? `K${veg.price}` : veg.market_note || 'Market Price'}
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
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">No vegetables available</p>
              </div>
            )}
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
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : meat.length > 0 ? (
              meat.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                      {item.unit}
                    </span>
                  </div>
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-lg font-bold text-farm-leaf mb-3">
                    {item.price ? `K${item.price}` : item.market_note || 'Contact for pricing'}
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
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">No meat products available</p>
              </div>
            )}
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
