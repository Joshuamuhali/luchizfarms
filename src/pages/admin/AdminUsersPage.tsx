import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { DataService } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

function AdminUsersContent() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "customer" | "admin">("all");

  const load = () => {
    setLoading(true);
    DataService.getAdminUsers()
      .then((data) => setUsers(data as UserRow[]))
      .catch((e) =>
        toast({
          title: "Failed to load users",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q);
    return matchRole && matchSearch;
  });

  const totalBuyers = users.filter((u) => u.role === "customer").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = users.filter((u) => new Date(u.created_at) >= thisMonth).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All registered accounts and their order history.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total users", value: users.length, color: "bg-blue-50 text-blue-600" },
          { label: "Buyers", value: totalBuyers, color: "bg-green-50 text-green-600" },
          { label: "New this month", value: newThisMonth, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["all", "customer", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                filterRole === r
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "all" ? `All (${users.length})` : r === "customer" ? `Buyers (${totalBuyers})` : `Admins (${totalAdmins})`}
            </button>
          ))}
        </div>
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
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-farm-leaf/10 flex items-center justify-center text-farm-leaf text-sm font-bold shrink-0">
                          {(u.full_name?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {u.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          u.role === "admin"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {u.role === "admin" ? "Admin" : "Buyer"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("en-ZM", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{u.orderCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold text-sm ${u.totalSpent > 0 ? "text-farm-leaf" : "text-muted-foreground"}`}>
                        {u.totalSpent > 0 ? `K${u.totalSpent.toLocaleString()}` : "—"}
                      </span>
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

const AdminUsersPage = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>
      <AdminUsersContent />
    </AdminLayout>
  </ProtectedRoute>
);

export default AdminUsersPage;
