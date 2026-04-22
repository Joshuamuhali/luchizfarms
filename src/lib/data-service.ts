import { supabase } from '@/lib/supabase'

// Supabase client for database operations

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
  status: string;
  payment_status: string;
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

export class DataService {
  // Products
  static async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories ( id, name, slug )
      `)
      .order('sort_order', { ascending: true });

    // Products fetched successfully

    if (error) throw error;
    
    // Convert signed URLs to public URLs if needed
    const productsWithPublicUrls = data?.map(product => ({
      ...product,
      image_url: product.image_url?.replace('/sign/', '/object/public/')?.split('?')[0] || product.image_url
    })) || [];
    
    return productsWithPublicUrls as Product[];
  }

  // Categories
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as Category[];
  }

  // Orders
  static async createOrder(orderData: {
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
  }) {
    // Create order first with payment_status = 'pending'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        delivery_address: orderData.delivery_address,
        delivery_notes: orderData.delivery_notes,
        total: orderData.total,
        has_market_items: orderData.has_market_items,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderData.order_items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          unit_price: item.unit_price,
          unit: item.unit,
          subtotal: item.subtotal
        }))
      );

    if (itemsError) throw itemsError;

    return order;
  }

  static async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  }

  static async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Admin: Update product image URL
  static async updateProductImage(productId: string, imageUrl: string) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
