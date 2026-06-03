import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { DataService } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Package,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  buyers: number;
  admins: number;
  newThisMonth: number;
  totalOrders: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getAdminStats()
      .then(setStats)
      .catch((e) =>
        toast({
          title: "Failed to load stats",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const statusRows = [
    { key: "placed", label: "New orders", icon: Clock, color: "text-blue-600 bg-blue-50" },
    { key: "packaging", label: "Packaging", icon: Package, color: "text-amber-600 bg-amber-50" },
    { key: "ready_for_payment", label: "Awaiting payment", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { key: "paid", label: "Paid", icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { key: "delivered", label: "Delivered", icon: CheckCircle, color: "text-farm-leaf bg-green-50" },
    { key: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-muted-foreground mt-1">Luchiz Farm at a glance</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-leaf" />
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Top KPIs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              sub={`+${stats.newThisMonth} this month`}
              icon={Users}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              label="Buyers"
              value={stats.buyers}
              sub="Registered customers"
              icon={UserCheck}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              label="Total Orders"
              value={stats.totalOrders}
              sub="All time"
              icon={ShoppingCart}
              color="bg-amber-50 text-amber-600"
            />
            <StatCard
              label="Revenue Collected"
              value={`K${stats.totalRevenue.toLocaleString()}`}
              sub="Paid orders only"
              icon={TrendingUp}
              color="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Order pipeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Order Pipeline</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {statusRows.map(({ key, label, icon: Icon, color }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {stats.statusCounts[key] ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-5">User Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: "Customers / Buyers", value: stats.buyers, color: "bg-farm-leaf" },
                { label: "Admin Staff", value: stats.admins, color: "bg-blue-500" },
                { label: "New this month", value: stats.newThisMonth, color: "bg-amber-400" },
              ].map(({ label, value, color }) => {
                const pct = stats.totalUsers > 0 ? Math.round((value / stats.totalUsers) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const AdminDashboardPage = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  </ProtectedRoute>
);

export default AdminDashboardPage;
