import { useState } from "react";
import { ShoppingCart, MessageCircle, Plus, Minus, Trash2, FileDown, Leaf, Beef, UtensilsCrossed, Heart, Circle, Square, Drumstick, Bird } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateOrderPdf } from "@/lib/generateOrderPdf";

// Use direct image paths to avoid import issues with spaces in filenames
const getImagePath = (filename: string) => new URL(`/src/assets/farm-photos/${filename}`, import.meta.url).href;

// Image paths for products
const chibwabwaImage = getImagePath("Chibwabwa.JPG");
const chineseCabbageImage = getImagePath("ChineseCabbage.JPG");
const cabbageImage = getImagePath("cabbage.JPG");
const lumandaImage = getImagePath("Lumanda.JPG");
const okraImage = getImagePath("Okra.JPG");
const onionsImage = getImagePath("Onions.JPG");
const tomatoesImage = getImagePath("Tomatoes.JPG");
const goatMeatImage = getImagePath("Goat Meat.JPG");
const porkChopsImage = getImagePath("Pork Chops.JPG");
const img3844 = getImagePath("IMG_3844.JPG");
const img3845 = getImagePath("IMG_3845.JPG");
const img3849 = getImagePath("IMG_3849.JPG");
const img3852 = getImagePath("IMG_3852.JPG");
const img3853 = getImagePath("IMG_3853.JPG");
const img3856 = getImagePath("IMG_3856.JPG");
const pepperImage = getImagePath("pepper.JPG");

const WHATSAPP_NUMBER = "260979654602";

interface OrderItem {
  name: string;
  price: number | null;
  unit: string;
  icon: any;
  note?: string;
  image?: string;
}

const vegetables: OrderItem[] = [
  { name: "Rape", price: 5, unit: "bundle", icon: Leaf, image: img3845 }, // Generic leafy green
  { name: "Chibwabwa", price: 5, unit: "bundle", icon: Leaf, image: chibwabwaImage }, // ✅ Direct match
  { name: "Chinese Cabbage", price: 5, unit: "head", icon: Leaf, image: chineseCabbageImage }, // ✅ Direct match
  { name: "Lumanda", price: 5, unit: "bundle", icon: Leaf, image: lumandaImage }, // ✅ Direct match
  { name: "Impwa", price: 5, unit: "bundle", icon: Leaf }, // No image
  { name: "Okra", price: 5, unit: "bundle", icon: Leaf, image: okraImage }, // ✅ Direct match
  { name: "Onions", price: null, unit: "kg", icon: Leaf, note: "Market Price", image: onionsImage }, // ✅ Direct match
  { name: "Tomatoes", price: null, unit: "kg", icon: Leaf, note: "Market Price", image: tomatoesImage }, // ✅ Direct match
  { name: "Carrots", price: 10, unit: "bundle", icon: Leaf }, // No image
  { name: "Green Pepper", price: 5, unit: "piece", icon: Leaf, image: pepperImage }, // ✅ Pepper image
  { name: "Red & Yellow Pepper", price: 20, unit: "piece", icon: Leaf, image: pepperImage }, // ✅ Same pepper image
];

const meat: OrderItem[] = [
  { name: "Pork Chops", price: 110, unit: "kg", icon: Beef, image: porkChopsImage }, // ✅ Direct match
  { name: "Mixed Cut Beef (Stew Cuts)", price: 120, unit: "kg", icon: Beef }, // No image
  { name: "Steak & Steak on Bone", price: 130, unit: "kg", icon: Beef }, // No image
  { name: "Lamb", price: 100, unit: "kg", icon: UtensilsCrossed }, // No image
  { name: "Goat Meat", price: 100, unit: "kg", icon: Heart, image: goatMeatImage }, // ✅ Direct match
  { name: "Beef Offals", price: 80, unit: "kg", icon: Beef }, // No image
  { name: "Goat Offals", price: 70, unit: "kg", icon: Heart }, // No image
  { name: "Pork Trotters", price: 70, unit: "kg", icon: Circle }, // No image
  { name: "Cow Trotters", price: null, unit: "piece", icon: Square, note: "Contact for pricing" }, // No image
  { name: "Broiler Chicken (Dressed)", price: 150, unit: "whole", icon: Bird }, // No image
  { name: "Village Chicken (Dressed)", price: 150, unit: "whole", icon: Drumstick }, // No image
];

const OrderSection = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<Record<string, number>>({});

  const updateQty = (name: string, delta: number) => {
    setCart((prev) => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: next };
    });
  };

  const allItems = [...vegetables, ...meat];
  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);

  const getItem = (name: string) => allItems.find((i) => i.name === name);

  const totalFixed = cartEntries.reduce((sum, [name, qty]) => {
    const item = getItem(name);
    return item?.price ? sum + item.price * qty : sum;
  }, 0);

  const hasMarketPrice = cartEntries.some(([name]) => !getItem(name)?.price);

  const buildCartItems = () =>
    cartEntries.map(([name, qty]) => {
      const item = getItem(name)!;
      return { name, icon: item.icon, price: item.price, unit: item.unit, qty, note: item.note };
    });

  const downloadPdf = () => {
    if (cartEntries.length === 0) {
      toast({ title: "Cart is empty", description: "Please add items to your order first." });
      return;
    }
    generateOrderPdf(buildCartItems(), totalFixed, hasMarketPrice);
    toast({ title: "PDF downloaded!", description: "You can now attach it in your WhatsApp chat." });
  };

  const sendToWhatsApp = () => {
    if (cartEntries.length === 0) {
      toast({ title: "Cart is empty", description: "Please add items to your order first." });
      return;
    }

    const lines = cartEntries.map(([name, qty]) => {
      const item = getItem(name);
      const priceStr = item?.price ? `K${item.price}/${item.unit}` : "Market price";
      const subtotal = item?.price ? ` = K${item.price * qty}` : "";
      return `• ${qty}x ${name} (${priceStr})${subtotal}`;
    });

    const text = [
      "Hi Luchiz Farm! I'd like to place an order:",
      "",
      ...lines,
      "",
      `Subtotal: K${totalFixed}${hasMarketPrice ? " + market price items" : ""}`,
      "",
      "Please confirm availability and total. Thank you!",
    ].join("\n");

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    toast({ title: "Order sent!", description: "Redirecting to WhatsApp..." });
  };

  const clearCart = () => setCart({});

  const renderItems = (items: OrderItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const qty = cart[item.name] || 0;
        return (
          <div
            key={item.name}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Instagram-style Image */}
            <div className="relative aspect-square">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Product Badge */}
              <div className="absolute top-3 right-3">
                <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <item.icon className="w-5 h-5 text-farm-leaf" />
                </div>
              </div>

              {/* Quick Add Button (appears on hover) */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => updateQty(item.name, 1)}
                  className="w-full bg-farm-leaf text-white py-2 px-4 rounded-xl font-medium hover:bg-farm-forest transition-colors duration-200 shadow-lg"
                >
                  Quick Add
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-bold text-lg text-foreground mb-1">{item.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.unit}
                  </span>
                  {item.price ? (
                    <span className="font-bold text-farm-leaf text-lg">K{item.price}</span>
                  ) : (
                    <span className="text-sm text-farm-sunshine font-semibold">{item.note || "Market Price"}</span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => updateQty(item.name, -1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    qty === 0 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                  disabled={qty === 0}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className={`flex-1 text-center font-bold text-lg ${
                  qty > 0 ? "text-farm-leaf" : "text-gray-400"
                }`}>
                  {qty || 0}
                </div>
                <button
                  onClick={() => updateQty(item.name, 1)}
                  className="w-8 h-8 bg-farm-leaf text-white rounded-lg flex items-center justify-center hover:bg-farm-forest transition-all duration-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section id="order" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 bg-farm-card rounded-full px-6 py-2 border-farm shadow-farm">
            <ShoppingCart className="w-5 h-5 text-farm-leaf" />
            <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Order Now</span>
            <ShoppingCart className="w-5 h-5 text-farm-leaf" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-farm-sunshine">Order Your Products</span>
            <br />
            <span className="text-foreground">Direct from Farm</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose your fresh vegetables and meat, set your quantities, 
            and send your order directly via WhatsApp. Clear pricing. Direct supply.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="vegetables" className="w-full">
            {/* Modern Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-farm-card rounded-2xl p-2 border-farm shadow-farm">
              <TabsTrigger value="vegetables" className="text-base font-semibold gap-3 rounded-xl data-[state=active]:bg-farm-leaf data-[state=active]:text-white transition-all duration-300">
                <Leaf className="w-5 h-5" />
                <span>Fresh Vegetables</span>
              </TabsTrigger>
              <TabsTrigger value="meat" className="text-base font-semibold gap-3 rounded-xl data-[state=active]:bg-farm-leaf data-[state=active]:text-white transition-all duration-300">
                <Beef className="w-5 h-5" />
                <span>Meat & Poultry</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="vegetables" className="space-y-4">
              <div className="bg-farm-card rounded-3xl p-8 border-farm shadow-farm">
                <h3 className="text-2xl font-bold text-farm-leaf mb-6">Fresh Vegetables</h3>
                {renderItems(vegetables)}
              </div>
            </TabsContent>
            <TabsContent value="meat" className="space-y-4">
              <div className="bg-farm-card rounded-3xl p-8 border-farm shadow-farm">
                <h3 className="text-2xl font-bold text-farm-sunshine mb-6">Meat & Poultry</h3>
                {renderItems(meat)}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modern Cart Summary */}
          {cartEntries.length > 0 && (
            <div className="mt-12 bg-farm-card rounded-3xl p-8 border-farm shadow-farm-lg space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-farm-leaf rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Your Order</h3>
                    <p className="text-muted-foreground">{cartEntries.length} item{cartEntries.length > 1 ? "s" : ""} selected</p>
                  </div>
                </div>
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Clear All</span>
                </button>
              </div>

              <div className="space-y-4">
                {cartEntries.map(([name, qty]) => {
                  const item = getItem(name);
                  return (
                    <div key={name} className="flex items-center justify-between p-4 bg-farm-cloud rounded-2xl border-farm">
                      <div className="flex items-center gap-3">
                        {item?.icon && <item.icon className="w-5 h-5 text-farm-leaf" />}
                        <div>
                          <span className="font-medium text-foreground">{name}</span>
                          <span className="text-muted-foreground ml-2">× {qty}</span>
                        </div>
                      </div>
                      <span className="font-bold text-lg text-foreground">
                        {item?.price ? `K${item.price * qty}` : "TBD"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-farm-soil/20 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-foreground">Total Amount</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-farm-sunshine">K{totalFixed}</span>
                    {hasMarketPrice && (
                      <p className="text-sm text-muted-foreground mt-1">+ market price items (to be confirmed)</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={downloadPdf}
                    className="btn-sunshine group flex items-center justify-center gap-3 text-lg"
                  >
                    <FileDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Download PDF
                  </button>
                  <button
                    onClick={sendToWhatsApp}
                    className="btn-farm group flex items-center justify-center gap-3 text-lg"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Send via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
