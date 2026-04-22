import { useState } from "react";
import React from "react";
import { ShoppingCart, MessageCircle, Plus, Minus, Trash2, FileDown, Leaf, Beef, UtensilsCrossed, Heart, Circle, Square, Drumstick, Bird } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateOrderPdf } from "@/lib/generateOrderPdf";
import { useProducts } from "@/hooks/useProducts";
import { Product, DataService } from "@/lib/data-service";

const WHATSAPP_NUMBER = "260979654602";

const OrderSection = () => {
  const { toast } = useToast();
  const { vegetables, meat, allItems, loading, error, getProductById } = useProducts();
  const [cart, setCart] = useState<Record<string, number>>({});

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'Leaf': Leaf, 'Beef': Beef, 'UtensilsCrossed': UtensilsCrossed,
      'Heart': Heart, 'Circle': Circle, 'Square': Square, 'Bird': Bird, 'Drumstick': Drumstick
    };
    return icons[iconName] || Leaf;
  };

  // Get primary image for product
  const getPrimaryImage = (product: Product) => {
    return product.image_url || "/placeholder.svg";
  };

  // Get icon from product's category
  const getCategoryIcon = (product: any) => {
    return 'Leaf';
  };

  // Cart functions - use product IDs instead of names
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);

  const totalFixed = cartEntries.reduce((sum, [productId, qty]) => {
    const product = getProductById(productId);
    return product?.price ? sum + product.price * qty : sum;
  }, 0);

  const hasMarketPrice = cartEntries.some(([productId]) => !getProductById(productId)?.price);

  // Customer info state for order
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Check if product is out of stock
  const isOutOfStock = (product: Product) => product.stock_quantity <= 0;

  // Check if product is low stock
  const isLowStock = (product: Product) => product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  // Create order in Supabase
  const createOrder = async () => {
    try {
      const orderData = {
        customer_name: customerName || 'Guest',
        customer_phone: customerPhone || 'N/A',
        delivery_address: deliveryAddress || undefined,
        delivery_notes: deliveryNotes || undefined,
        total: totalFixed,
        has_market_items: hasMarketPrice,
        order_items: cartEntries.map(([productId, qty]) => {
          const product = getProductById(productId)!;
          return {
            product_id: productId,
            product_name: product.name,
            qty: qty,
            unit_price: product.price,
            unit: product.unit,
            subtotal: product.price ? product.price * qty : 0
          };
        })
      };

      const order = await DataService.createOrder(orderData);
      return order;
    } catch (error) {
      toast({
        title: "Error creating order",
        description: "Please try again",
        variant: "destructive"
      });
      throw error;
    }
  };

  // WhatsApp integration
  const sendToWhatsApp = async () => {
    if (cartEntries.length === 0) {
      toast({ title: "Cart is empty", description: "Please add items to your order first." });
      return;
    }

    try {
      // Create order first
      const order = await createOrder();

      // Build WhatsApp message
      const lines = cartEntries.map(([productId, qty]) => {
        const product = getProductById(productId);
        const priceStr = product?.price ? `K${product.price}/${product.unit}` : "Market price";
        const subtotal = product?.price ? ` = K${product.price * qty}` : "";
        return `· ${qty}x ${product?.name} (${priceStr})${subtotal}`;
      });

      const text = [
        "Hi Luchiz Farm! I'd like to place an order:",
        "",
        `Order ID: ${order.id}`,
        ...lines,
        "",
        `Subtotal: K${totalFixed}${hasMarketPrice ? " + market price items" : ""}`,
        "",
        "Please confirm availability and total. Thank you!",
      ].join("\n");

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
      toast({ title: "Order created!", description: "Redirecting to WhatsApp..." });
    } catch (error) {
      console.error('WhatsApp error:', error);
    }
  };

  const downloadPdf = () => {
    if (cartEntries.length === 0) {
      toast({ title: "Cart is empty", description: "Please add items to your order first." });
      return;
    }
    
    const cartItems = cartEntries.map(([productId, qty]) => {
      const product = getProductById(productId)!;
      return {
        name: product.name,
        icon: getIcon(getCategoryIcon(product)),
        price: product.price,
        unit: product.unit,
        qty,
        note: product.market_note
      };
    });
    
    generateOrderPdf(cartItems, totalFixed, hasMarketPrice);
    toast({ title: "PDF downloaded!", description: "You can now attach it in your WhatsApp chat." });
  };

  const clearCart = () => setCart({});

  // Render product item
  const renderProductItem = (product: Product) => {
    const qty = cart[product.id] || 0;
    const primaryImage = getPrimaryImage(product);
    const outOfStock = isOutOfStock(product);
    const lowStock = isLowStock(product);

    return (
      <div
        key={product.id}
        className={`group bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
          outOfStock ? 'border-gray-300 opacity-60' : 'border-gray-200 hover:shadow-xl'
        }`}
      >
        {/* Product Image */}
        <div className="relative aspect-square">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
            loading="lazy"
            decoding="async"
          />

          {/* Stock Badge */}
          {outOfStock ? (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          ) : lowStock ? (
            <div className="absolute top-3 left-3">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Low Stock</span>
            </div>
          ) : null}

          {/* Product Badge */}
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              {React.createElement(getIcon(getCategoryIcon(product)), { className: "w-5 h-5 text-farm-leaf" })}
            </div>
          </div>

          {/* Quick Add Button - disabled if out of stock */}
          {!outOfStock && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => updateQty(product.id, 1)}
                className="w-full bg-farm-leaf text-white py-2 px-4 rounded-xl font-medium hover:bg-farm-forest transition-colors duration-200 shadow-lg"
              >
                Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-bold text-lg text-foreground mb-1">{product.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.unit}
              </span>
              {product.price ? (
                <span className="font-bold text-farm-leaf text-lg">K{product.price}</span>
              ) : (
                <span className="text-sm text-farm-sunshine font-semibold">{product.market_note || "Market Price"}</span>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => updateQty(product.id, -1)}
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
              onClick={() => updateQty(product.id, 1)}
              disabled={outOfStock}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                outOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-farm-leaf text-white hover:bg-farm-forest"
              }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-leaf mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">Failed to load products: {error}</p>
        </div>
      </section>
    );
  }

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vegetables.map(renderProductItem)}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="meat" className="space-y-4">
              <div className="bg-farm-card rounded-3xl p-8 border-farm shadow-farm">
                <h3 className="text-2xl font-bold text-farm-sunshine mb-6">Meat & Poultry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {meat.map(renderProductItem)}
                </div>
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
                {cartEntries.map(([productId, qty]) => {
                  const product = getProductById(productId);
                  return (
                    <div key={productId} className="flex items-center justify-between p-4 bg-farm-cloud rounded-2xl border-farm">
                      <div className="flex items-center gap-3">
                        {React.createElement(getIcon(product ? getCategoryIcon(product) : 'Leaf'), { className: "w-5 h-5 text-farm-leaf" })}
                        <div>
                          <span className="font-medium text-foreground">{product?.name}</span>
                          <span className="text-muted-foreground ml-2">× {qty}</span>
                        </div>
                      </div>
                      <span className="font-bold text-lg text-foreground">
                        {product?.price ? `K${product.price * qty}` : "TBD"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Customer Info */}
              <div className="bg-farm-cloud rounded-2xl p-6 border-farm space-y-4">
                <h4 className="font-bold text-foreground">Your Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-farm-leaf focus:ring-1 focus:ring-farm-leaf outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-farm-leaf focus:ring-1 focus:ring-farm-leaf outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Where should we deliver? (optional)"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-farm-leaf focus:ring-1 focus:ring-farm-leaf outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Delivery Notes</label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special instructions? (optional)"
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-farm-leaf focus:ring-1 focus:ring-farm-leaf outline-none transition-colors resize-none"
                  />
                </div>
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
