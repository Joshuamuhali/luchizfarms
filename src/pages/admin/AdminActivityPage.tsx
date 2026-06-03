import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { DataService } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Activity } from "lucide-react";

interface LogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  meta: Record<string, unknown>;
  created_at: string;
  admin: { full_name: string | null } | null;
}

const ACTION_COLORS: Record<string, string> = {
  update_stock: "bg-blue-50 text-blue-700",
  update_price: "bg-purple-50 text-purple-700",
  cancel_order: "bg-red-50 text-red-700",
  issue_refund: "bg-orange-50 text-orange-700",
  suspend_user: "bg-red-50 text-red-700",
  unsuspend_user: "bg-green-50 text-green-700",
  add_order_note: "bg-amber-50 text-amber-700",
  add_user_note: "bg-amber-50 text-amber-700",
  set_user_tag: "bg-indigo-50 text-indigo-700",
  update_order_status: "bg-teal-50 text-teal-700",
};

function actionLabel(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function metaSummary(meta: Record<string, unknown>): string {
  if (!meta || typeof meta !== "object") return "";
  const entries = Object.entries(meta);
  if (entries.length === 0) return "";
  return entries
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join(" · ");
}

function AdminActivityContent() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    DataService.getActivityLog(100)
      .then((d) => setLogs(d as LogEntry[]))
      .catch((e) =>
        toast({
          title: "Failed to load activity log",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Full audit trail of all admin actions
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 bg-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-farm-leaf" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50">
              {/* Action badge */}
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5 ${
                  ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {actionLabel(log.action)}
              </span>

              {/* Detail */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-gray-800">
                    {log.admin?.full_name ?? "Admin"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    on {log.entity} <span className="font-mono">{log.entity_id?.slice(0, 8)}</span>
                  </span>
                </div>
                {log.meta && Object.keys(log.meta).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {metaSummary(log.meta)}
                  </p>
                )}
              </div>

              {/* Time */}
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {new Date(log.created_at).toLocaleString("en-ZM", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const AdminActivityPage = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>
      <AdminActivityContent />
    </AdminLayout>
  </ProtectedRoute>
);

export default AdminActivityPage;
