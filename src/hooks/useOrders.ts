import { useState, useCallback } from 'react';

export interface Order {
  id: string;
  items: {
    name: string;
    quantity: number;
    price: number | null;
    unit: string;
    emoji: string;
  }[];
  total: number;
  hasMarketPrice: boolean;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface OrderHistory {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('luchiz-orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt)
      }));
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback((
    items: Order['items'],
    total: number,
    hasMarketPrice: boolean,
    customerName: string,
    customerPhone: string
  ) => {
    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items,
      total,
      hasMarketPrice,
      status: 'pending',
      createdAt: new Date(),
      customerName,
      customerPhone
    };

    setOrders(prev => [newOrder, ...prev]);
    localStorage.setItem('luchiz-orders', JSON.stringify([...orders, newOrder]));
    
    return newOrder;
  }, [orders]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    localStorage.setItem('luchiz-orders', JSON.stringify(updatedOrders));
  }, [orders]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId) || null;
  }, [orders]);

  const getOrdersByStatus = useCallback((status: Order['status']) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getRecentOrders = useCallback((limit: number = 5) => {
    return orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }, [orders]);

  const cancelOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
  }, [updateOrderStatus]);

  const clearOrderHistory = useCallback(() => {
    setOrders([]);
    localStorage.removeItem('luchiz-orders');
  }, []);

  // Simulate order status updates (in real app, this would come from WebSocket/server)
  const simulateStatusUpdate = useCallback((orderId: string) => {
    const order = getOrderById(orderId);
    if (!order) return;

    const statusFlow: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = statusFlow.indexOf(order.status);
    
    if (currentIndex < statusFlow.length - 1) {
      setTimeout(() => {
        updateOrderStatus(orderId, statusFlow[currentIndex + 1]);
      }, 5000); // Update every 5 seconds for demo
    }
  }, [getOrderById, updateOrderStatus]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByStatus,
    getRecentOrders,
    cancelOrder,
    clearOrderHistory,
    simulateStatusUpdate
  };
};
