import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import orderService from "@/services/order.service";

import type { Order, OrderQueryParams } from "@/types/order";

export default function useOrders(initialParams?: OrderQueryParams) {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  /**
   * ==========================================
   * Fetch Orders
   * ==========================================
   */

  const fetchOrders = useCallback(
    async (params?: OrderQueryParams, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response = await orderService.getAll({
          ...initialParams,
          ...params,
        });

        setOrders(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch orders";

        setError(message);

        toast.error(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [initialParams],
  );

  /**
   * ==========================================
   * Refresh
   * ==========================================
   */

  const refresh = useCallback(async () => {
    await fetchOrders(undefined, true);
  }, [fetchOrders]);

  /**
   * ==========================================
   * Initial Load
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await orderService.getAll(initialParams);

        if (cancelled) {
          return;
        }

        setError(null);

        setOrders(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch orders";

        setError(message);

        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [initialParams]);

  return {
    orders,

    loading,
    error,

    total,
    page,
    limit,
    totalPages,

    refresh,
    fetchOrders,
  };
}
