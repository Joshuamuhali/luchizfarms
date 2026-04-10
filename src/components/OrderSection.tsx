import { useState } from "react";
import { ShoppingCart, MessageCircle, Plus, Minus, Trash2, FileDown, Leaf, Beef, UtensilsCrossed, Heart, Circle, Square, Drumstick, Bird } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateOrderPdf } from "@/lib/generateOrderPdf";

const WHATSAPP_NUMBER = "260979654602";

interface OrderItem {
  name: string;
  price: number | null;
  unit: string;
  icon: any;
  note?: string;
}

const produceItems: OrderItem[] = [
  { name: "Rape", price: 5, unit: "bundle", icon: Leaf },
  { name: "Chibwabwa", price: 5, unit: "bundle", icon: Leaf },
  { name: "Chinese Cabbage", price: 5, unit: "head", icon: Leaf },
  { name: "Lumanda", price: 5, unit: "bundle", icon: Leaf },
  { name: "Impwa", price: 5, unit: "bundle", icon: Leaf },
  { name: "Okra", price: 5, unit: "bundle", icon: Leaf },
  { name: "Onion", price: null, unit: "kg", icon: Leaf, note: "Market price" },
  { name: "Tomatoes", price: null, unit: "kg", icon: Leaf, note: "Market price" },
  { name: "Carrots", price: 10, unit: "bundle", icon: Leaf },
  { name: "Green Pepper", price: 5, unit: "piece", icon: Leaf },
  { name: "Red & Yellow Pepper", price: 20, unit: "piece", icon: Leaf },
];

const meatItems: OrderItem[] = [
  { name: "Pork Chops", price: 110, unit: "kg", icon: Beef },
  { name: "Mixed Cut Beef", price: 120, unit: "kg", icon: Beef },
  { name: "Steak / Steak on Bone", price: 130, unit: "kg", icon: Beef },
  { name: "Lamb", price: 100, unit: "kg", icon: UtensilsCrossed },
  { name: "Goat Meat", price: 100, unit: "kg", icon: Heart },
  { name: "Beef Offals", price: 80, unit: "kg", icon: Beef },
  { name: "Goat Offals", price: 70, unit: "kg", icon: Heart },
  { name: "Pork Trotters", price: 70, unit: "kg", icon: Circle },
  { name: "Cow Trotters", price: null, unit: "piece", icon: Square, note: "Price varies by size" },
  { name: "Village Chicken", price: 150, unit: "whole", icon: Drumstick },
  { name: "Broiler Chicken", price: 150, unit: "whole", icon: Bird },
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

  const allItems = [...produceItems, ...meatItems];
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
    <div className="grid gap-4">
      {items.map((item) => {
        const qty = cart[item.name] || 0;
        return (
          <div
            key={item.name}
            className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${
              qty > 0
                ? "border-farm-leaf/50 bg-farm-leaf/5 shadow-farm scale-[1.02]"
                : "border-farm-soil/20 bg-farm-cloud hover:bg-farm-sky/30"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  qty > 0 ? "bg-farm-leaf" : "bg-farm-sunshine"
                }`}>
                  <item.icon className={`w-5 h-5 ${qty > 0 ? "text-white" : "text-farm-soil"}`} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">{item.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    {item.price ? (
                      <span className="font-bold text-farm-leaf">K{item.price}<span className="text-muted-foreground font-normal ml-1">/{item.unit}</span></span>
                    ) : (
                      <span className="text-sm text-farm-sunshine font-semibold italic">{item.note || "Market price"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => updateQty(item.name, -1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  qty === 0 
                    ? "bg-farm-cloud border-farm text-muted-foreground cursor-not-allowed opacity-50" 
                    : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200 hover:scale-110"
                }`}
                disabled={qty === 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className={`w-12 text-center font-bold text-lg tabular-nums ${
                qty > 0 ? "text-farm-leaf" : "text-muted-foreground"
              }`}>
                {qty}
              </div>
              <button
                onClick={() => updateQty(item.name, 1)}
                className="w-10 h-10 bg-farm-leaf text-white rounded-xl flex items-center justify-center hover:bg-farm-forest transition-all duration-300 hover:scale-110 shadow-farm"
              >
                <Plus className="w-4 h-4" />
              </button>
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
            <span className="text-farm-sunshine">Fresh Prices</span>
            <br />
            <span className="text-foreground">Direct from Farm</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose your fresh produce and quality livestock, set your quantities, 
            and send your order directly via WhatsApp. Simple, transparent pricing.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="produce" className="w-full">
            {/* Modern Tab Navigation */}
            <TabsList className="w-full grid grid-cols-2 mb-8 h-14 bg-farm-card rounded-2xl border-farm shadow-farm p-2">
              <TabsTrigger value="produce" className="text-base font-semibold gap-3 rounded-xl data-[state=active]:bg-farm-leaf data-[state=active]:text-white transition-all duration-300">
                <Leaf className="w-5 h-5" />
                <span>Vegetables & Produce</span>
              </TabsTrigger>
              <TabsTrigger value="meat" className="text-base font-semibold gap-3 rounded-xl data-[state=active]:bg-farm-leaf data-[state=active]:text-white transition-all duration-300">
                <Beef className="w-5 h-5" />
                <span>Meat & Poultry</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="produce" className="space-y-4">
              <div className="bg-farm-card rounded-3xl p-8 border-farm shadow-farm">
                <h3 className="text-2xl font-bold text-farm-leaf mb-6">Fresh Vegetables</h3>
                {renderItems(produceItems)}
              </div>
            </TabsContent>
            <TabsContent value="meat" className="space-y-4">
              <div className="bg-farm-card rounded-3xl p-8 border-farm shadow-farm">
                <h3 className="text-2xl font-bold text-farm-sunshine mb-6">Quality Meat & Poultry</h3>
                {renderItems(meatItems)}
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
