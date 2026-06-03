import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { OrderProgressBar } from "@/components/OrderProgressStepper";
import { useAuth } from "@/contexts/AuthContext";
import { DataService, type Order } from "@/lib/data-service";
import {
  ORDER_STATUS_LABELS,
  getNextCustomerAction,
  statusBadgeClass,
} from "@/lib/order-status";
import { Package, ChevronRight } from "lucide-react";

function MyOrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    DataService.getMyOrders(user.id)
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My orders</h1>
              <p className="text-muted-foreground">Track packaging, payment, and delivery.</p>
            </div>
            <Link to="/order" className="btn-farm text-sm">
              New order
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-leaf" />
            </div>
          )}

          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-16 bg-farm-card rounded-2xl border-farm">
              <Package className="w-12 h-12 text-farm-leaf mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No orders yet</p>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Browse our produce, place an order, then send it for packaging when you are ready.
              </p>
              <Link to="/order" className="btn-farm inline-flex">
                Browse produce
              </Link>
            </div>
          )}

          <ul className="space-y-4">
            {orders.map((order) => {
              const next = getNextCustomerAction(order.status, order.payment_status);
              return (
                <li key={order.id}>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono text-sm text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                        <p className="font-bold text-lg">K{order.total}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${statusBadgeClass(order.status)}`}
                      >
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ||
                          order.status}
                      </span>
                    </div>
                    <OrderProgressBar status={order.status} />
                    {next && (
                      <p className="text-sm text-farm-leaf mt-3 font-medium">{next}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                      <span>
                        {new Date(order.created_at).toLocaleString("en-ZM")}
                        {" · "}
                        {order.order_items?.length ?? 0} items
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const MyOrdersPage = () => (
  <ProtectedRoute>
    <MyOrdersContent />
  </ProtectedRoute>
);

export default MyOrdersPage;
