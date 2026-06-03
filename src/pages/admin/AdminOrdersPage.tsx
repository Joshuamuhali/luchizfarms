import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { DataService, type Order } from "@/lib/data-service";
import {
  ORDER_STATUS_LABELS,
  statusBadgeClass,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

const ADMIN_STATUSES: OrderStatus[] = [
  "placed", "packaging", "ready_for_payment",
  "paid", "delivered", "cancelled",
];

function AdminOrdersContent() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = () => {
    setLoading(true);
    Promise.all([DataService.getOrders(), DataService.getAdminOrderStats()])
      .then(([ordersData, statsData]) => {
        setOrders(ordersData);
        setStats(statsData);
      })
      .catch((e) =>
        toast({
          title: "Failed to load orders",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await DataService.updateOrderStatus(orderId, status);
      if (status === "paid") await DataService.updatePaymentStatus(orderId, "paid");
      toast({ title: "Order updated" });
      load();
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    }
  };

  const updatePayment = async (orderId: string, payment_status: PaymentStatus) => {
    try {
      await DataService.updatePaymentStatus(orderId, payment_status);
      toast({ title: "Payment status updated" });
      load();
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const PIPELINE = [
    ["placed", "New"],
    ["packaging", "Packaging"],
    ["ready_for_payment", "Awaiting pay"],
    ["paid", "Paid"],
    ["delivered", "Delivered"],
    ["total", "All"],
  ] as const;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set <strong>Ready to pay</strong> once total is confirmed, then <strong>Mark paid</strong> after mobile money.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Pipeline stat cards */}
      {stats && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {PIPELINE.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key === "total" ? "all" : key)}
              className={`rounded-xl p-4 text-left border transition-all hover:shadow-sm ${
                filter === key || (key === "total" && filter === "all")
                  ? "border-farm-leaf bg-farm-leaf/5 shadow-sm"
                  : "border-gray-200 bg-white hover:border-farm-leaf/40"
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{stats[key] ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["all", ...ADMIN_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? "bg-farm-leaf text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All orders" : ORDER_STATUS_LABELS[s as OrderStatus] || s}
            {s !== "all" && (
              <span className="ml-1 opacity-70">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-leaf" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    No orders in this filter
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>
                      <p className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-ZM")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-bold text-sm">K{order.total}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass(order.status)}`}>
                        {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs capitalize font-medium ${
                        order.payment_status === "paid" ? "text-green-600" : "text-amber-600"
                      }`}>
                        {order.payment_status}
                      </span>
                    </TableCell>
                    <TableCell className="space-y-2 min-w-[180px]">
                      <Select
                        value={order.status}
                        onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADMIN_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {ORDER_STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {order.payment_status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={() => updatePayment(order.id, "paid")}
                        >
                          Mark paid
                        </Button>
                      )}
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="text-xs text-farm-leaf hover:underline block"
                      >
                        View details →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const AdminOrdersPage = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>
      <AdminOrdersContent />
    </AdminLayout>
  </ProtectedRoute>
);

export default AdminOrdersPage;
