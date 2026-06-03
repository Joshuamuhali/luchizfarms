import { supabase } from "./supabase";
import type { OrderStatus, PaymentStatus } from "./order-status";
import { normalizeSupabaseStorageUrl } from "./storage-url";

export interface Product {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  price: number | null;
  unit: string;
  image_url?: string;
  image_urls?: string[];
  stock_quantity: number;
  low_stock_threshold: number;
  is_market_price: boolean;
  market_note?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus | string;
  payment_status: PaymentStatus | string;
  delivery_address?: string;
  delivery_notes?: string;
  total: number;
  has_market_items: boolean;
  whatsapp_sent: boolean;
  whatsapp_sent_at?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  qty: number;
  unit_price: number | null;
  unit: string;
  subtotal: number;
  created_at?: string;
  products?: Product;
}

const orderSelect = `
  *,
  order_items(
    *,
    products(*)
  )
`;

export class DataService {
  static async getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories ( id, name, slug )
      `
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const productsWithPublicUrls =
      data?.map((product) => ({
        ...product,
        image_url: normalizeSupabaseStorageUrl(product.image_url) ?? product.image_url,
        image_urls: Array.isArray(product.image_urls)
          ? product.image_urls.map((u: string) => normalizeSupabaseStorageUrl(u) ?? u)
          : product.image_urls,
      })) || [];

    return productsWithPublicUrls as Product[];
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data as Category[];
  }

  static async createOrder(
    orderData: {
      user_id?: string;
      customer_name: string;
      customer_phone: string;
      delivery_address?: string;
      delivery_notes?: string;
      total: number;
      has_market_items: boolean;
      order_items: Array<{
        product_id: string;
        product_name?: string;
        qty: number;
        unit_price: number | null;
        unit: string;
        subtotal: number;
      }>;
    }
  ) {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id ?? null,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        delivery_address: orderData.delivery_address,
        delivery_notes: orderData.delivery_notes,
        total: orderData.total,
        has_market_items: orderData.has_market_items,
        status: "placed",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      orderData.order_items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        qty: item.qty,
        unit_price: item.unit_price,
        unit: item.unit,
        subtotal: item.subtotal,
      }))
    );

    if (itemsError) throw itemsError;

    return order as Order;
  }

  static async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(orderSelect)
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async getMyOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(orderSelect)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Order[];
  }

  static async getOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(orderSelect)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Order[];
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async updatePaymentStatus(orderId: string, payment_status: PaymentStatus) {
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async submitForPackaging(orderId: string) {
    const { data, error } = await supabase.rpc("customer_submit_for_packaging", {
      p_order_id: orderId,
    });
    if (error) throw error;
    return data as Order;
  }

  static async updateProfile(
    userId: string,
    updates: { full_name?: string; phone?: string }
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static validateCartStock(
    cartEntries: [string, number][],
    getProduct: (id: string) => Product | null
  ): string | null {
    for (const [productId, qty] of cartEntries) {
      const product = getProduct(productId);
      if (!product) return "A product in your cart is no longer available.";
      if (product.stock_quantity <= 0) return `${product.name} is out of stock.`;
      if (qty > product.stock_quantity) {
        return `Only ${product.stock_quantity} ${product.unit} of ${product.name} available.`;
      }
    }
    return null;
  }

  static async getAdminOrderStats() {
    const { data, error } = await supabase.from("orders").select("status, payment_status");
    if (error) throw error;
    const counts = {
      placed: 0,
      packaging: 0,
      ready_for_payment: 0,
      paid: 0,
      delivered: 0,
      cancelled: 0,
      total: data?.length ?? 0,
    };
    data?.forEach((o) => {
      const s = o.status as keyof typeof counts;
      if (s in counts && s !== "total") counts[s]++;
    });
    return counts;
  }

  static async getAdminStats() {
    const [ordersRes, profilesRes, revenueRes] = await Promise.all([
      supabase.from("orders").select("status, payment_status, total, created_at"),
      supabase.from("profiles").select("id, role, created_at"),
      supabase.from("orders").select("total").eq("payment_status", "paid"),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (profilesRes.error) throw profilesRes.error;

    const orders = ordersRes.data ?? [];
    const profiles = profilesRes.data ?? [];
    const revenue = (revenueRes.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0);

    const statusCounts: Record<string, number> = {
      placed: 0, packaging: 0, ready_for_payment: 0,
      paid: 0, delivered: 0, cancelled: 0,
    };
    orders.forEach((o) => {
      if (o.status in statusCounts) statusCounts[o.status]++;
    });

    // buyers = profiles who have placed at least 1 order (approximated by total profiles - admin count)
    const admins = profiles.filter((p) => p.role === "admin").length;
    const totalUsers = profiles.length;
    const buyers = totalUsers - admins;

    // new users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newThisMonth = profiles.filter(
      (p) => new Date(p.created_at) >= thisMonth
    ).length;

    return {
      totalUsers,
      buyers,
      admins,
      newThisMonth,
      totalOrders: orders.length,
      totalRevenue: revenue,
      statusCounts,
    };
  }

  static async getAdminUsers() {
    // Join profiles with order counts via two queries (anon key can't do cross-table RPC easily)
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, created_at")
      .order("created_at", { ascending: false });
    if (pErr) throw pErr;

    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select("user_id, total, status");
    if (oErr) throw oErr;

    return (profiles ?? []).map((p) => {
      const userOrders = (orders ?? []).filter((o) => o.user_id === p.id);
      const spent = userOrders
        .filter((o) => o.status === "paid" || o.status === "delivered")
        .reduce((s, o) => s + (o.total ?? 0), 0);
      return { ...p, orderCount: userOrders.length, totalSpent: spent };
    });
  }

  static async updateProduct(
    productId: string,
    updates: {
      name?: string;
      price?: number | null;
      unit?: string;
      stock_quantity?: number;
      low_stock_threshold?: number;
      is_market_price?: boolean;
      market_note?: string;
      is_active?: boolean;
      description?: string;
    }
  ) {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getAllProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Product[];
  }

  static async updateProductImage(productId: string, imageUrl: string) {
    const { data, error } = await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STOCK MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  static async adjustStock(
    productId: string,
    newQty: number,
    previousQty: number,
    reason: string,
    adminId: string
  ) {
    // Update product stock
    const { error: updateErr } = await supabase
      .from("products")
      .update({ stock_quantity: newQty })
      .eq("id", productId);
    if (updateErr) throw updateErr;

    // Record adjustment history
    const { error: histErr } = await supabase.from("stock_adjustments").insert({
      product_id: productId,
      admin_id: adminId,
      previous_qty: previousQty,
      new_qty: newQty,
      reason,
    });
    if (histErr) throw histErr;

    // Activity log
    await DataService.logActivity(adminId, "update_stock", "product", productId, {
      previous_qty: previousQty,
      new_qty: newQty,
      reason,
    });
  }

  static async getStockHistory(productId: string) {
    const { data, error } = await supabase
      .from("stock_adjustments")
      .select("*, admin:profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  static async updatePrice(
    productId: string,
    newPrice: number | null,
    previousPrice: number | null,
    adminId: string
  ) {
    const { error: updateErr } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", productId);
    if (updateErr) throw updateErr;

    const { error: histErr } = await supabase.from("price_history").insert({
      product_id: productId,
      admin_id: adminId,
      previous_price: previousPrice,
      new_price: newPrice,
    });
    if (histErr) throw histErr;

    await DataService.logActivity(adminId, "update_price", "product", productId, {
      previous_price: previousPrice,
      new_price: newPrice,
    });
  }

  static async getPriceHistory(productId: string) {
    const { data, error } = await supabase
      .from("price_history")
      .select("*, admin:profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    return data ?? [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT CRUD
  // ─────────────────────────────────────────────────────────────────────────

  static async createProduct(payload: {
    name: string;
    category_id: string;
    price: number | null;
    unit: string;
    stock_quantity: number;
    low_stock_threshold: number;
    is_market_price: boolean;
    market_note?: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
  }) {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, is_active: true })
      .select("*, category:categories(id, name, slug)")
      .single();
    if (error) throw error;
    return data as Product;
  }

  static async deleteProduct(productId: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (error) throw error;
  }

  static async getAllCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  }

  static async createCategory(payload: { name: string; slug: string; icon?: string; sort_order?: number }) {
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...payload, is_active: true })
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  }

  static async updateCategory(id: string, updates: Partial<Pick<Category, "name" | "slug" | "icon" | "sort_order" | "is_active">>) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ORDER NOTES
  // ─────────────────────────────────────────────────────────────────────────

  static async getOrderNotes(orderId: string) {
    const { data, error } = await supabase
      .from("order_notes")
      .select("*, admin:profiles(full_name)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  static async addOrderNote(orderId: string, adminId: string, note: string) {
    const { data, error } = await supabase
      .from("order_notes")
      .insert({ order_id: orderId, admin_id: adminId, note })
      .select()
      .single();
    if (error) throw error;
    await DataService.logActivity(adminId, "add_order_note", "order", orderId, { note });
    return data;
  }

  static async cancelOrder(orderId: string, adminId: string, reason: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled", cancelled_reason: reason })
      .eq("id", orderId);
    if (error) throw error;
    await DataService.logActivity(adminId, "cancel_order", "order", orderId, { reason });
  }

  static async issueRefund(orderId: string, adminId: string) {
    const { error } = await supabase
      .from("orders")
      .update({ refund_status: "processed", payment_status: "refunded" })
      .eq("id", orderId);
    if (error) throw error;
    await DataService.logActivity(adminId, "issue_refund", "order", orderId, {});
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  static async suspendUser(userId: string, adminId: string, reason: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: true, suspension_reason: reason })
      .eq("id", userId);
    if (error) throw error;
    await DataService.logActivity(adminId, "suspend_user", "user", userId, { reason });
  }

  static async unsuspendUser(userId: string, adminId: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: false, suspension_reason: null })
      .eq("id", userId);
    if (error) throw error;
    await DataService.logActivity(adminId, "unsuspend_user", "user", userId, {});
  }

  static async setUserTag(
    userId: string,
    adminId: string,
    tag: "retail" | "wholesale" | "vip" | "inactive"
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({ customer_tag: tag })
      .eq("id", userId);
    if (error) throw error;
    await DataService.logActivity(adminId, "set_user_tag", "user", userId, { tag });
  }

  static async getUserNotes(userId: string) {
    const { data, error } = await supabase
      .from("user_notes")
      .select("*, admin:profiles(full_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  static async addUserNote(userId: string, adminId: string, note: string) {
    const { data, error } = await supabase
      .from("user_notes")
      .insert({ user_id: userId, admin_id: adminId, note })
      .select()
      .single();
    if (error) throw error;
    await DataService.logActivity(adminId, "add_user_note", "user", userId, { note });
    return data;
  }

  static async getUserOrderHistory(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items(*, products(*))`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────

  static async getAnalytics(range: "7d" | "30d" | "90d" = "30d") {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();

    const [ordersRes, itemsRes, allOrdersRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, total, status, payment_status, created_at")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true }),
      supabase
        .from("order_items")
        .select("product_id, product_name, qty, unit_price, subtotal, created_at")
        .gte("created_at", sinceIso),
      supabase
        .from("orders")
        .select("total, status, payment_status, created_at")
        .order("created_at", { ascending: true }),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (itemsRes.error) throw itemsRes.error;

    const orders = ordersRes.data ?? [];
    const items = itemsRes.data ?? [];
    const allOrders = allOrdersRes.data ?? [];

    // Daily revenue (paid only)
    const dailyMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const date = o.created_at.slice(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { date, revenue: 0, orders: 0 };
      dailyMap[date].orders++;
      if (o.payment_status === "paid") dailyMap[date].revenue += o.total ?? 0;
    });
    const dailyRevenue = Object.values(dailyMap);

    // Best selling products
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    items.forEach((i) => {
      const key = i.product_id;
      if (!productSales[key]) productSales[key] = { name: i.product_name ?? key, qty: 0, revenue: 0 };
      productSales[key].qty += i.qty ?? 0;
      productSales[key].revenue += i.subtotal ?? 0;
    });
    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // Summary stats for range
    const rangeRevenue = orders
      .filter((o) => o.payment_status === "paid")
      .reduce((s, o) => s + (o.total ?? 0), 0);
    const rangeOrders = orders.length;
    const cancelledInRange = orders.filter((o) => o.status === "cancelled").length;

    // All-time revenue
    const totalRevenue = allOrders
      .filter((o) => o.payment_status === "paid")
      .reduce((s, o) => s + (o.total ?? 0), 0);

    return {
      dailyRevenue,
      bestSellers,
      rangeRevenue,
      rangeOrders,
      cancelledInRange,
      totalRevenue,
      range,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVITY LOG
  // ─────────────────────────────────────────────────────────────────────────

  static async logActivity(
    adminId: string,
    action: string,
    entity: string,
    entityId: string,
    meta: Record<string, unknown>
  ) {
    // Fire and forget — don't block on logging errors
    supabase.from("activity_logs").insert({
      admin_id: adminId,
      action,
      entity,
      entity_id: entityId,
      meta,
    }).then(() => {});
  }

  static async getActivityLog(limit = 50) {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*, admin:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }
}
