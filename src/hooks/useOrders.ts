/**
 * useOrders — fetches orders from Supabase for the current user.
 * Replaces the old localStorage-only version which was disconnected from the DB.
 */
import { useState, useEffect, useCallback } from "react";
import { DataService, type Order } from "@/lib/data-service";

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await DataService.getMyOrders(userId);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { orders, loading, error, reload: load };
}
