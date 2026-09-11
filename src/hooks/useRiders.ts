import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import riderService from "@/services/rider.service";

import type { CreateRiderRequest, Rider, RiderQueryParams } from "@/types/rider";

function isDuplicateRiderError(message: string): boolean {
  const normalized = message.toLowerCase();

  return normalized.includes("already exists");
}

export default function useRiders(initialParams?: RiderQueryParams) {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  /**
   * ==========================================
   * Fetch Riders
   * ==========================================
   */

  const fetchRiders = useCallback(
    async (params?: RiderQueryParams, showLoader = true) => {
      try {
        if (showLoader) setLoading(true);

        setError(null);

        const response = await riderService.getAll({
          ...initialParams,
          ...params,
        });

        setRiders(response.items);
        setTotal(response.pagination.total);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch riders";

        setError(message);
        toast.error(message);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [initialParams],
  );

  const refresh = useCallback(async () => {
    await fetchRiders(undefined, true);
  }, [fetchRiders]);

  const getRider = useCallback(async (id: string) => {
    return riderService.getById(id);
  }, []);

  /**
   * ==========================================
   * Create Rider
   * ==========================================
   */

  const createRider = useCallback(async (payload: CreateRiderRequest) => {
    try {
      const rider = await riderService.create(payload);

      toast.success("Rider created successfully");

      setRiders((prev) => [rider, ...prev]);
      setTotal((prev) => prev + 1);

      return rider;
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Failed to create rider";

      const message = isDuplicateRiderError(rawMessage)
        ? "A rider already exists with this email or phone number"
        : rawMessage;

      toast.error(message);

      throw new Error(message, { cause: error });
    }
  }, []);

  /**
   * ==========================================
   * Delete Rider
   * ==========================================
   */

  const deleteRider = useCallback(
    async (id: string) => {
      try {
        await riderService.delete(id);

        toast.success("Rider deleted successfully");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete rider";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Verify Rider
   * (pending -> active, atomically, on the backend)
   * ==========================================
   */

  const verifyRider = useCallback(async (id: string) => {
    try {
      const rider = await riderService.verify(id);

      toast.success("Rider verified and activated");

      setRiders((prev) => prev.map((item) => (item._id === rider._id ? rider : item)));

      return rider;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify rider";

      toast.error(message);

      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Reject Rider
   * (pending -> rejected, records a reason)
   * ==========================================
   */

  const rejectRider = useCallback(async (id: string, reason: string) => {
    try {
      const rider = await riderService.reject(id, reason);

      toast.success("Rider rejected");

      setRiders((prev) => prev.map((item) => (item._id === rider._id ? rider : item)));

      return rider;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reject rider";

      toast.error(message);

      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Block (Suspend) Rider
   * ==========================================
   */

  const blockRider = useCallback(
    async (id: string) => {
      try {
        await riderService.block(id);

        toast.success("Rider blocked");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to block rider";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Unblock (Reactivate) Rider
   * ==========================================
   */

  const unblockRider = useCallback(
    async (id: string) => {
      try {
        await riderService.unblock(id);

        toast.success("Rider unblocked");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to unblock rider";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Initial Load
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await riderService.getAll(initialParams);

        if (cancelled) return;

        setError(null);
        setRiders(response.items);
        setTotal(response.pagination.total);
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : "Failed to fetch riders";

        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [initialParams]);

  return {
    riders,
    loading,
    error,
    total,

    refresh,
    fetchRiders,

    getRider,
    createRider,
    deleteRider,

    verifyRider,
    rejectRider,
    blockRider,
    unblockRider,
  };
}
