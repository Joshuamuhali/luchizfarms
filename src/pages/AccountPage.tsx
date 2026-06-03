import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { OrderProgressBar } from "@/components/OrderProgressStepper";
import { useAuth } from "@/contexts/AuthContext";
import { DataService, type Order } from "@/lib/data-service";
import { DataService as DS } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ORDER_STATUS_LABELS,
  getNextCustomerAction,
  statusBadgeClass,
  canCustomerSubmitForPackaging,
} from "@/lib/order-status";
import {
  User, Package, ShoppingCart, TrendingUp,
  ChevronRight, Settings, Clock, CheckCircle,
} from "lucide-react";

type Tab = "dashboard" | "orders" | "settings";

function AccountContent() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    DS.getMyOrders(user.id)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await DataService.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      await refreshProfile();
      toast({ title: "Profile updated" });
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Derived stats
  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + o.total, 0);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-ZM", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Dashboard", icon: TrendingUp },
    { key: "orders", label: "My Orders", icon: Package },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Welcome banner */}
          <div className="bg-farm-leaf rounded-2xl p-6 mb-6 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {profile?.full_name?.[0]?.toUpperCase() || "B"}
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome back</p>
                <h1 className="text-2xl font-bold">{profile?.full_name || user?.email}</h1>
                <p className="text-white/60 text-xs mt-0.5">Member since {memberSince}</p>
              </div>
            </div>
            <Link
              to="/order"
              className="flex items-center gap-2 bg-white text-farm-leaf font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-all text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop Now
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total Orders", value: orders.length, icon: Package, color: "bg-blue-50 text-blue-600" },
              { label: "Active Orders", value: activeOrders.length, icon: Clock, color: "bg-amber-50 text-amber-600" },
              { label: "Total Spent", value: `K${totalSpent.toLocaleString()}`, icon: CheckCircle, color: "bg-green-50 text-green-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? "bg-farm-leaf text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Dashboard tab */}
          {tab === "dashboard" && (
            <div className="space-y-4">
              {/* Active orders */}
              {activeOrders.length > 0 && (
                <div>
                  <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Active Orders
                  </h2>
                  <div className="space-y-3">
                    {activeOrders.map((order) => {
                      const next = getNextCustomerAction(order.status, order.payment_status);
                      const canPackage = canCustomerSubmitForPackaging(order.status);
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-amber-200 p-5"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <span className="font-mono text-xs text-muted-foreground">
                                #{order.id.slice(0, 8)}
                              </span>
                              <p className="font-bold text-lg">K{order.total}</p>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${statusBadgeClass(order.status)}`}>
                              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                            </span>
                          </div>
                          <OrderProgressBar status={order.status} />
                          {next && (
                            <p className="text-sm text-farm-leaf mt-3 font-medium">{next}</p>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            {canPackage && (
                              <Link
                                to={`/account/orders/${order.id}`}
                                className="btn-farm text-sm py-2 px-4 inline-flex items-center gap-1"
                              >
                                <Package className="w-3.5 h-3.5" />
                                Send for packaging
                              </Link>
                            )}
                            <Link
                              to={`/account/orders/${order.id}`}
                              className="text-sm text-farm-leaf hover:underline inline-flex items-center gap-1"
                            >
                              View details <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent order history */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => setTab("orders")}
                    className="text-sm text-farm-leaf hover:underline"
                  >
                    View all
                  </button>
                </div>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-leaf" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-600 mb-1">No orders yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse fresh produce and place your first order.
                    </p>
                    <Link to="/order" className="btn-farm text-sm inline-flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Browse produce
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((order) => (
                      <Link
                        key={order.id}
                        to={`/account/orders/${order.id}`}
                        className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-farm-leaf/40 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-ZM")}
                              {" · "}
                              {order.order_items?.length ?? 0} items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass(order.status)}`}>
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                          </span>
                          <span className="font-bold text-sm">K{order.total}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link
                    to="/order"
                    className="flex items-center gap-3 p-3 rounded-xl bg-farm-leaf/5 border border-farm-leaf/20 hover:bg-farm-leaf/10 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-farm-leaf" />
                    <div>
                      <p className="font-medium text-sm">Place new order</p>
                      <p className="text-xs text-muted-foreground">Browse fresh produce</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setTab("settings")}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
                  >
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Edit profile</p>
                      <p className="text-xs text-muted-foreground">Update your details</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders tab */}
          {tab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">All Orders ({orders.length})</h2>
                <Link to="/order" className="btn-farm text-sm py-2 px-4 inline-flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  New order
                </Link>
              </div>
              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-leaf" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium mb-4">No orders yet</p>
                  <Link to="/order" className="btn-farm text-sm inline-flex">Browse produce</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const next = getNextCustomerAction(order.status, order.payment_status);
                    return (
                      <Link
                        key={order.id}
                        to={`/account/orders/${order.id}`}
                        className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-farm-leaf/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">
                              #{order.id.slice(0, 8)}
                            </span>
                            <p className="font-bold text-lg">K{order.total}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleString("en-ZM")}
                              {" · "}
                              {order.order_items?.length ?? 0} items
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${statusBadgeClass(order.status)}`}>
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                          </span>
                        </div>
                        <OrderProgressBar status={order.status} />
                        {next && (
                          <p className="text-sm text-farm-leaf mt-2 font-medium">{next}</p>
                        )}
                        <p className="text-xs text-farm-leaf mt-2 flex items-center gap-1">
                          View details <ChevronRight className="w-3.5 h-3.5" />
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings tab */}
          {tab === "settings" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Profile Settings</h2>
              <p className="text-sm text-muted-foreground mb-6">{user?.email}</p>
              <form onSubmit={saveProfile} className="space-y-4 max-w-sm">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="btn-farm" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </form>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}

const AccountPage = () => (
  <ProtectedRoute>
    <AccountContent />
  </ProtectedRoute>
);

export default AccountPage;
