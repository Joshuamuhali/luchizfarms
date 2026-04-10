import { useState, useCallback, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number | null;
  unit: string;
  emoji: string;
  quantity: number;
  note?: string;
}

export interface CartState {
  items: Record<string, number>;
  total: number;
  hasMarketPrice: boolean;
  itemCount: number;
}

export const useCart = () => {
  const [items, setItems] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('luchiz-cart');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('luchiz-cart', JSON.stringify(items));
  }, [items]);

  const updateQuantity = useCallback((name: string, delta: number) => {
    setItems(prev => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      
      if (next === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [name]: next };
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems({});
  }, []);

  const getCartState = useCallback((allItems: CartItem[]): CartState => {
    const entries = Object.entries(items).filter(([, qty]) => qty > 0);
    const itemCount = entries.length;
    
    const total = entries.reduce((sum, [name, qty]) => {
      const item = allItems.find(i => i.name === name);
      return item?.price ? sum + item.price * qty : sum;
    }, 0);

    const hasMarketPrice = entries.some(([name]) => {
      const item = allItems.find(i => i.name === name);
      return !item?.price;
    });

    return {
      items,
      total,
      hasMarketPrice,
      itemCount
    };
  }, [items]);

  const getCartEntries = useCallback((allItems: CartItem[]) => {
    return Object.entries(items)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => {
        const item = allItems.find(i => i.name === name)!;
        return {
          name,
          quantity: qty,
          ...item
        };
      });
  }, [items]);

  return {
    items,
    updateQuantity,
    clearCart,
    getCartState,
    getCartEntries
  };
};
