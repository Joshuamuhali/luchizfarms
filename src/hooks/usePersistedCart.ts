import { useCallback, useEffect, useRef, useState } from "react";

const GUEST_KEY = "luchiz-cart-guest";

function cartKey(userId?: string) {
  return userId ? `luchiz-cart-${userId}` : GUEST_KEY;
}

export function usePersistedCart(userId?: string) {
  // Track whether we've loaded from storage for the current userId
  const loadedRef = useRef(false);
  const [cart, setCart] = useState<Record<string, number>>({});

  // Load from localStorage whenever userId changes
  useEffect(() => {
    loadedRef.current = false;
    try {
      const raw = localStorage.getItem(cartKey(userId));
      setCart(raw ? JSON.parse(raw) : {});
    } catch {
      setCart({});
    }
    loadedRef.current = true;
  }, [userId]);

  // Persist to localStorage — but only after we've loaded (avoids wiping on mount)
  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem(cartKey(userId), JSON.stringify(cart));
  }, [cart, userId]);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  return { cart, setCart, updateQty, clearCart };
}
