import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderProgressStepper from "@/components/OrderProgressStepper";
import { Button } from "@/components/ui/button";
import { DataService, type Order } from "@/lib/data-service";
import {
  ORDER_STATUS_LABELS,
  canCustomerPay,
  canCustomerSubmitForPackaging,
  getNextCustomerAction,
  isOrderComplete,
  statusBadgeClass,
} from "@/lib/order-status";
import {
  PAYMENT_PHONE_DISPLAY,
  paymentTelLink,
  paymentWhatsAppLink,
} from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, CreditCard, Package, Phone } from "lucide-react";

function OrderDetailContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const showPackagingPrompt = searchParams.get("step") === "packaging";

  const load = async () => {
    if (!orderId) return;
    try {
      const data = await DataService.getOrderById(orderId);
      setOrder(data);
    } catch {
      toast({ title: "Order not found", variant: "destructive" });
      navigate("/account/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const submitForPackaging = async () => {
    if (!order) return;
    setActing(true);
    try {
      const updated = await DataService.submitForPackaging(order.id);
      setOrder({ ...order, ...updated, order_items: order.order_items });
      toast({
        title: "Sent for packaging",
        description: "We will prepare your order and notify you when ready to pay.",
      });
    } catch (e) {
      toast({
        title: "Could not update order",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setActing(false);
    }
  };

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    toast({ title: "Order ID copied", description: "Use this as your payment reference." });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-leaf" />
      </div>
    );
  }

  if (!order) return null;

  const showPackaging = canCustomerSubmitForPackaging(order.status);
  const showPay = canCustomerPay(order.status, order.payment_status);
  const nextAction = getNextCustomerAction(order.status, order.payment_status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-farm-leaf mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to orders
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${statusBadgeClass(order.status)}`}
            >
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ||
                order.status}
            </span>
          </div>

          <button
            type="button"
            onClick={copyOrderId}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-farm-leaf mb-6"
          >
            <Copy className="w-4 h-4" />
            Copy full order ID for payment reference
          </button>

          {showPackagingPrompt && showPackaging && (
            <div className="mb-6 p-4 bg-farm-leaf/10 border border-farm-leaf/30 rounded-2xl">
              <p className="font-semibold text-farm-forest">Order placed successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Next step: send your order for packaging so we can start preparing it.
              </p>
            </div>
          )}

          {nextAction && !isOrderComplete(order.status) && (
            <p className="text-sm font-medium text-farm-leaf mb-6">{nextAction}</p>
          )}

          <div className="bg-farm-card rounded-2xl border-farm p-6 mb-6">
            <h2 className="font-bold mb-4">Your progress</h2>
            <OrderProgressStepper status={order.status} paymentStatus={order.payment_status} />
          </div>

          <div className="bg-farm-card rounded-2xl border-farm p-6 space-y-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Placed</p>
              <p>{new Date(order.created_at).toLocaleString("en-ZM")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery</p>
              <p>{order.delivery_address || "Pickup / to confirm"}</p>
              {order.delivery_notes && (
                <p className="text-sm mt-1">{order.delivery_notes}</p>
              )}
            </div>

            <ul className="divide-y divide-gray-200">
              {order.order_items?.map((item) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <span>
                    {item.qty}× {item.product_name || item.products?.name}
                  </span>
                  <span className="font-medium">
                    {item.unit_price != null ? `K${item.subtotal}` : "Market price"}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-farm-sunshine">K{order.total}</span>
            </div>
            {order.has_market_items && (
              <p className="text-sm text-muted-foreground">
                Includes market-price items — final amount may be confirmed by the farm.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {showPackaging && (
              <Button
                onClick={submitForPackaging}
                disabled={acting}
                className="w-full btn-farm gap-2 h-12"
              >
                <Package className="w-5 h-5" />
                Send order for packaging
              </Button>
            )}

            {showPay && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pay now
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pay <strong>K{order.total}</strong> to{" "}
                  <strong>{PAYMENT_PHONE_DISPLAY}</strong> via Mobile Money. Use order ID{" "}
                  <strong className="font-mono">{order.id.slice(0, 8)}</strong> as reference.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <a
                    href={paymentTelLink()}
                    className="btn-farm flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call to pay
                  </a>
                  <a
                    href={paymentWhatsAppLink(order.id, order.total)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-sunshine flex items-center justify-center gap-2"
                  >
                    Pay via WhatsApp
                  </a>
                </div>
              </div>
            )}

            {order.status === "paid" && (
              <p className="text-center text-green-700 font-medium py-2">
                Payment received — we will deliver your order soon.
              </p>
            )}

            {order.status === "delivered" && (
              <p className="text-center text-farm-leaf font-medium py-2">
                Order delivered. Thank you for choosing Luchiz Farm!
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const OrderDetailPage = () => (
  <ProtectedRoute>
    <OrderDetailContent />
  </ProtectedRoute>
);

export default OrderDetailPage;
