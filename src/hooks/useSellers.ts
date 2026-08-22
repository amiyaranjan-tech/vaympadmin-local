import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import sellerService from "@/services/seller.service";

import type {
  CreateSellerRequest,
  Seller,
  SellerQueryParams,
  UpdateSellerRequest,
} from "@/types/seller";

function isDuplicateShopNameError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("shopname") ||
    normalized.includes("shop name") ||
    (normalized.includes("shop") && normalized.includes("already"))
  );
}

export default function useSellers(initialParams?: SellerQueryParams) {
  const [sellers, setSellers] = useState<Seller[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  /**
   * ==========================================
   * Fetch Sellers
   * ==========================================
   */

  const fetchSellers = useCallback(
    async (params?: SellerQueryParams, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response = await sellerService.getAll({
          ...initialParams,
          ...params,
        });

        setSellers(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch sellers";

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
    await fetchSellers(undefined, true);
  }, [fetchSellers]);

  /**
   * ==========================================
   * Get Seller
   * ==========================================
   */

  const getSeller = useCallback(async (id: string) => {
    return sellerService.getById(id);
  }, []);

  /**
   * ==========================================
   * Create Seller
   * ==========================================
   */

  const createSeller = useCallback(async (payload: CreateSellerRequest) => {
    try {
      const seller = await sellerService.create(payload);

      toast.success("Seller created successfully");

      setSellers((prev) => [seller, ...prev]);

      setTotal((prev) => prev + 1);

      return seller;
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Failed to create seller";

      const message = isDuplicateShopNameError(rawMessage)
        ? "Choose a different name, this shop name already exists"
        : rawMessage;

      toast.error(message);

      throw new Error(message, { cause: error });
    }
  }, []);

  /**
   * ==========================================
   * Update Seller
   * ==========================================
   */

  const updateSeller = useCallback(
    async (id: string, payload: UpdateSellerRequest) => {
      try {
        const seller = await sellerService.update(id, payload);

        toast.success("Seller updated successfully");

        setSellers((prev) =>
          prev.map((item) => (item._id === seller._id ? seller : item)),
        );

        return seller;
      } catch (error) {
        const rawMessage =
          error instanceof Error ? error.message : "Failed to update seller";

        const message = isDuplicateShopNameError(rawMessage)
          ? "Choose a different name, this shop name already exists"
          : rawMessage;

        toast.error(message);

        throw new Error(message, { cause: error });
      }
    },
    [],
  );

  /**
   * ==========================================
   * Delete Seller
   * ==========================================
   */

  const deleteSeller = useCallback(
    async (id: string) => {
      try {
        await sellerService.delete(id);

        toast.success("Seller deleted successfully");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete seller";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Verify Seller
   * (pending -> active, atomically, on the backend)
   * ==========================================
   */

  const verifySeller = useCallback(
    async (id: string) => {
      try {
        const seller = await sellerService.verify(id);

        toast.success("Seller verified and activated");

        setSellers((prev) =>
          prev.map((item) => (item._id === seller._id ? seller : item)),
        );

        return seller;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to verify seller";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Unverify Seller
   * (strips the verified badge only, status untouched)
   * ==========================================
   */

  const unverifySeller = useCallback(
    async (id: string) => {
      try {
        const seller = await sellerService.unverify(id);

        toast.success("Seller verification removed");

        setSellers((prev) =>
          prev.map((item) => (item._id === seller._id ? seller : item)),
        );

        return seller;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to unverify seller";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Suspend Seller
   * (active -> suspended)
   * ==========================================
   */

  const suspendSeller = useCallback(
    async (id: string) => {
      try {
        await sellerService.suspend(id);

        toast.success("Seller suspended");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to suspend seller";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Deactivate Seller
   * (active -> inactive)
   * ==========================================
   */

  const deactivateSeller = useCallback(
    async (id: string) => {
      try {
        await sellerService.deactivate(id);

        toast.success("Seller deactivated");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to deactivate seller";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Reactivate Seller
   * (suspended | inactive -> active)
   * ==========================================
   */

  const reactivateSeller = useCallback(
    async (id: string) => {
      try {
        await sellerService.reactivate(id);

        toast.success("Seller reactivated");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to reactivate seller";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );
  /**
   * ==========================================
   * Open Shop
   * ==========================================
   */

  const openShop = useCallback(
    async (id: string) => {
      try {
        await sellerService.openShop(id);

        toast.success("Shop opened");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to open shop";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Close Shop
   * ==========================================
   */

  const closeShop = useCallback(
    async (id: string) => {
      try {
        await sellerService.closeShop(id);

        toast.success("Shop closed");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to close shop";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Set Shop Status To Automatic
   * ==========================================
   */

  const setAutoShopStatus = useCallback(
    async (id: string) => {
      try {
        await sellerService.setAutoShopStatus(id);

        toast.success("Shop status set to automatic");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to set automatic shop status";

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
      const response = await sellerService.getAll(initialParams);

      if (cancelled) {
        return;
      }

      setError(null);

      setSellers(response.items);

      setTotal(response.pagination.total);

      setPage(response.pagination.page);

      setLimit(response.pagination.limit);

      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      if (cancelled) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to fetch sellers";

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
    sellers,

    loading,
    error,

    total,
    page,
    limit,
    totalPages,

    refresh,
    fetchSellers,

    getSeller,

    createSeller,
    updateSeller,
    deleteSeller,

    verifySeller,
    unverifySeller,
    suspendSeller,
    deactivateSeller,
    reactivateSeller,

    openShop,
    closeShop,
    setAutoShopStatus,
  };
}