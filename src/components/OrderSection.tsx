import { useState } from "react";
import { ShoppingCart, MessageCircle, Plus, Minus, Trash2, FileDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateOrderPdf } from "@/lib/generateOrderPdf";

const WHATSAPP_NUMBER = "260979654602";

interface OrderItem {
  name: string;
  price: number | null;
  unit: string;
  emoji: string;
  note?: string;
}

const produceItems: OrderItem[] = [
  { name: "Rape", price: 5, unit: "bundle", emoji: "🥬" },
  { name: "Chibwabwa", price: 5, unit: "bundle", emoji: "🍃" },
  { name: "Chinese Cabbage", price: 5, unit: "head", emoji: "🥬" },
  { name: "Lumanda", price: 5, unit: "bundle", emoji: "🌿" },
  { name: "Impwa", price: 5, unit: "bundle", emoji: "🍆" },
  { name: "Okra", price: 5, unit: "bundle", emoji: "🫛" },
  { name: "Onion", price: null, unit: "kg", emoji: "🧅", note: "Market price" },
  { name: "Tomatoes", price: null, unit: "kg", emoji: "🍅", note: "Market price" },
  { name: "Carrots", price: 10, unit: "bundle", emoji: "🥕" },
  { name: "Green Pepper", price: 5, unit: "piece", emoji: "🫑" },
  { name: "Red & Yellow Pepper", price: 20, unit: "piece", emoji: "🌶️" },
];

const meatItems: OrderItem[] = [
  { name: "Pork Chops", price: 110, unit: "kg", emoji: "🥩" },
  { name: "Mixed Cut Beef", price: 120, unit: "kg", emoji: "🥩" },
  { name: "Steak / Steak on Bone", price: 130, unit: "kg", emoji: "🥩" },
  { name: "Lamb", price: 100, unit: "kg", emoji: "🍖" },
  { name: "Goat Meat", price: 100, unit: "kg", emoji: "🐐" },
  { name: "Beef Offals", price: 80, unit: "kg", emoji: "🥩" },
  { name: "Goat Offals", price: 70, unit: "kg", emoji: "🐐" },
  { name: "Pork Trotters", price: 70, unit: "kg", emoji: "🐷" },
  { name: "Cow Trotters", price: null, unit: "piece", emoji: "🐄", note: "Price varies by size" },
  { name: "Village Chicken", price: 120, unit: "whole", emoji: "🐔" },
  { name: "Broiler Chicken", price: 150, unit: "whole", emoji: "🐓" },
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
      return { name, emoji: item.emoji, price: item.price, unit: item.unit, qty, note: item.note };
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
    <div className="grid gap-3">
      {items.map((item) => {
        const qty = cart[item.name] || 0;
        return (
          <div
            key={item.name}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              qty > 0
                ? "border-primary/40 bg-primary/5 shadow-sm"
                : "border-border bg-card"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.emoji}</span>
                <span className="font-display font-bold text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {item.price ? (
                  <span className="text-sm font-semibold text-primary">K{item.price}<span className="text-muted-foreground font-normal">/{item.unit}</span></span>
                ) : (
                  <span className="text-sm text-secondary font-medium italic">{item.note || "Market price"}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQty(item.name, -1)}
                className="w-8 h-8 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-30"
                disabled={qty === 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-foreground tabular-nums">{qty}</span>
              <button
                onClick={() => updateQty(item.name, 1)}
                className="w-8 h-8 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
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
    <section id="order" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Farm Fresh Prices</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Order <span className="text-primary">Now</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select your items, choose quantities, and send your order straight to WhatsApp.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="produce" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6 h-12">
              <TabsTrigger value="produce" className="text-sm font-semibold gap-1">🥬 Vegetables & Produce</TabsTrigger>
              <TabsTrigger value="meat" className="text-sm font-semibold gap-1">🥩 Meat & Poultry</TabsTrigger>
            </TabsList>
            <TabsContent value="produce">{renderItems(produceItems)}</TabsContent>
            <TabsContent value="meat">{renderItems(meatItems)}</TabsContent>
          </Tabs>

          {/* Cart Summary */}
          {cartEntries.length > 0 && (
            <div className="mt-8 p-6 rounded-2xl bg-card border border-border shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Your Order ({cartEntries.length} item{cartEntries.length > 1 ? "s" : ""})
                </h3>
                <button
                  onClick={clearCart}
                  className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              <div className="divide-y divide-border">
                {cartEntries.map(([name, qty]) => {
                  const item = getItem(name);
                  return (
                    <div key={name} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-foreground">
                        {item?.emoji} {name} × {qty}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {item?.price ? `K${item.price * qty}` : "TBD"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-display font-bold text-foreground text-lg">Total</span>
                <div className="text-right">
                  <span className="font-display font-bold text-primary text-xl">K{totalFixed}</span>
                  {hasMarketPrice && (
                    <p className="text-xs text-muted-foreground">+ market price items (to be confirmed)</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadPdf}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold px-6 py-3.5 rounded-xl hover:bg-secondary/90 transition-all text-base"
                >
                  <FileDown className="w-5 h-5" />
                  Download PDF Order
                </button>
                <button
                  onClick={sendToWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
