import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { DataService } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, ShoppingCart, XCircle, Award, RefreshCw } from "lucide-react";

type Range = "7d" | "30d" | "90d";

interface Analytics {
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  bestSellers: { name: string; qty: number; revenue: number }[];
  rangeRevenue: number;
  rangeOrders: number;
  cancelledInRange: number;
  totalRevenue: number;
  range: Range;
}

function AdminAnalyticsContent() {
  const { toast } = useToast();
  const [data, setData] = useState<Analytics | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);

  const load = (r: Range) => {
    setLoading(true);
    DataService.getAnalytics(r)
      .then((d) => setData(d as Analytics))
      .catch((e) =>
        toast({
          title: "Failed to load analytics",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(range); }, [range]);

  const maxRevenue = data
    ? Math.max(...data.dailyRevenue.map((d) => d.revenue), 1)
    : 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Sales performance and product insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["7d", "30d", "90d"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(range)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-leaf" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: `Revenue (${range})`,
                value: `K${data.rangeRevenue.toLocaleString()}`,
                sub: `K${data.totalRevenue.toLocaleString()} all time`,
                icon: TrendingUp,
                color: "bg-green-50 text-green-600",
              },
              {
                label: `Orders (${range})`,
                value: data.rangeOrders,
                sub: "Total in period",
                icon: ShoppingCart,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Cancelled",
                value: data.cancelledInRange,
                sub: "In this period",
                icon: XCircle,
                color: "bg-red-50 text-red-500",
              },
              {
                label: "Avg order value",
                value: data.rangeOrders > 0
                  ? `K${Math.round(data.rangeRevenue / data.rangeOrders).toLocaleString()}`
                  : "K0",
                sub: "Paid orders",
                icon: Award,
                color: "bg-purple-50 text-purple-600",
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue chart — bar chart built with divs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Daily Revenue (K)</h2>
            {data.dailyRevenue.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No data for this period</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                  {data.dailyRevenue.map((d) => {
                    const pct = Math.round((d.revenue / maxRevenue) * 100);
                    return (
                      <div
                        key={d.date}
                        className="flex flex-col items-center gap-1 min-w-[28px] group"
                      >
                        <div className="relative flex-1 flex items-end w-full">
                          <div
                            className="w-full bg-farm-leaf/80 rounded-t group-hover:bg-farm-leaf transition-colors cursor-default"
                            style={{ height: `${Math.max(pct, 2)}%` }}
                            title={`K${d.revenue} — ${d.orders} orders`}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-right">Hover bars for details</p>
              </div>
            )}
          </div>

          {/* Best sellers */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Best Selling Products</h2>
            {data.bestSellers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {data.bestSellers.map((p, i) => {
                  const maxQty = data.bestSellers[0]?.qty || 1;
                  const pct = Math.round((p.qty / maxQty) * 100);
                  return (
                    <div key={p.name} className="flex items-center gap-4">
                      <span className="w-5 text-xs font-bold text-muted-foreground shrink-0">
                        #{i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</span>
                          <span className="text-muted-foreground text-xs ml-2 shrink-0">
                            {p.qty} sold · K{p.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-farm-leaf rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily orders + revenue table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Daily Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-xs text-muted-foreground font-medium">Date</th>
                    <th className="text-right py-2 text-xs text-muted-foreground font-medium">Orders</th>
                    <th className="text-right py-2 text-xs text-muted-foreground font-medium">Revenue (K)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.dailyRevenue].reverse().map((d) => (
                    <tr key={d.date} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-gray-700">{d.date}</td>
                      <td className="py-2 text-right text-gray-700">{d.orders}</td>
                      <td className="py-2 text-right font-semibold text-gray-900">
                        {d.revenue > 0 ? `K${d.revenue.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const AdminAnalyticsPage = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>
      <AdminAnalyticsContent />
    </AdminLayout>
  </ProtectedRoute>
);

export default AdminAnalyticsPage;
