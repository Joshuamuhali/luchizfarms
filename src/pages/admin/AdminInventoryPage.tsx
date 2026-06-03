import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { DataService, type Product } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RefreshCw, Save, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface EditRow {
  price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  is_market_price: boolean;
  market_note: string;
  is_active: boolean;
}

function AdminInventoryContent() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, EditRow>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");

  const load = () => {
    setLoading(true);
    DataService.getAllProducts()
      .then((data) => {
        setProducts(data);
        // Initialise edit state from fetched data
        const initial: Record<string, EditRow> = {};
        data.forEach((p) => {
          initial[p.id] = {
            price: p.price != null ? String(p.price) : "",
            stock_quantity: String(p.stock_quantity),
            low_stock_threshold: String(p.low_stock_threshold),
            is_market_price: p.is_market_price,
            market_note: p.market_note ?? "",
            is_active: p.is_active,
          };
        });
        setEdits(initial);
      })
      .catch((e) =>
        toast({
          title: "Failed to load inventory",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const patch = (id: string, field: keyof EditRow, value: string | boolean) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const save = async (product: Product) => {
    const row = edits[product.id];
    if (!row) return;
    setSaving(product.id);
    try {
      await DataService.updateProduct(product.id, {
        price: row.is_market_price ? null : row.price !== "" ? Number(row.price) : null,
        stock_quantity: parseInt(row.stock_quantity) || 0,
        low_stock_threshold: parseInt(row.low_stock_threshold) || 5,
        is_market_price: row.is_market_price,
        market_note: row.market_note || undefined,
        is_active: row.is_active,
      });
      toast({ title: `${product.name} updated` });
      load();
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const cats = Array.from(new Set(products.map((p) => p.category?.name ?? "Other")));

  const filtered =
    filterCat === "all"
      ? products
      : products.filter((p) => p.category?.name === filterCat);

  const lowStock = products.filter(
    (p) => p.is_active && p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
  );
  const outOfStock = products.filter((p) => p.is_active && p.stock_quantity === 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set prices, update stock, and toggle product visibility.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {outOfStock.length > 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm">Out of stock ({outOfStock.length})</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {outOfStock.map((p) => p.name).join(", ")}
                </p>
              </div>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700 text-sm">Low stock ({lowStock.length})</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {lowStock.map((p) => p.name).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", ...cats].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              filterCat === c
                ? "bg-farm-leaf text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c === "all" ? "All products" : c}
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
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (K)</TableHead>
                <TableHead>Market price?</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Low stock at</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const row = edits[product.id];
                if (!row) return null;
                const isLow =
                  product.stock_quantity > 0 &&
                  product.stock_quantity <= product.low_stock_threshold;
                const isOut = product.stock_quantity === 0;
                return (
                  <TableRow
                    key={product.id}
                    className={`${!row.is_active ? "opacity-50" : ""} hover:bg-gray-50`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.unit}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.category?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={row.price}
                        onChange={(e) => patch(product.id, "price", e.target.value)}
                        disabled={row.is_market_price}
                        className="w-24 h-8 text-sm"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.is_market_price}
                          onChange={(e) => patch(product.id, "is_market_price", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-xs text-muted-foreground">Market</span>
                      </label>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min="0"
                          value={row.stock_quantity}
                          onChange={(e) => patch(product.id, "stock_quantity", e.target.value)}
                          className={`w-20 h-8 text-sm ${
                            isOut
                              ? "border-red-300 focus:border-red-400"
                              : isLow
                              ? "border-amber-300 focus:border-amber-400"
                              : ""
                          }`}
                        />
                        {isOut && (
                          <span className="text-xs font-medium text-red-500">Out</span>
                        )}
                        {isLow && !isOut && (
                          <span className="text-xs font-medium text-amber-500">Low</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={row.low_stock_threshold}
                        onChange={(e) => patch(product.id, "low_stock_threshold", e.target.value)}
                        className="w-20 h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => patch(product.id, "is_active", !row.is_active)}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                          row.is_active
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {row.is_active ? (
                          <><Eye className="w-3.5 h-3.5" /> Visible</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => save(product)}
                        disabled={saving === product.id}
                        className="h-8 text-xs gap-1 bg-farm-leaf hover:bg-farm-forest text-white"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving === product.id ? "…" : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const AdminInventoryPage = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout>
      <AdminInventoryContent />
    </AdminLayout>
  </ProtectedRoute>
);

export default AdminInventoryPage;
