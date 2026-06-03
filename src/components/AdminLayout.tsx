import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LOGO_URL } from "@/lib/constants";
import {
  LayoutDashboard, ShoppingCart, Package,
  Users, BarChart2, ClipboardList, LogOut, ExternalLink,
} from "lucide-react";

const NAV = [
  { to: "/admin",            label: "Overview",   icon: LayoutDashboard, exact: true },
  { to: "/admin/orders",     label: "Orders",     icon: ShoppingCart },
  { to: "/admin/inventory",  label: "Inventory",  icon: Package },
  { to: "/admin/users",      label: "Users",      icon: Users },
  { to: "/admin/analytics",  label: "Analytics",  icon: BarChart2 },
  { to: "/admin/activity",   label: "Activity Log", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, profile } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-40">
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-200">
          <img src={LOGO_URL} alt="Luchiz Farm" className="w-8 h-8 object-contain rounded-lg" />
          <div>
            <p className="font-bold text-sm leading-tight">Luchiz Farm</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-farm-leaf text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-700 truncate">{profile?.full_name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-farm-leaf px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View site
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
