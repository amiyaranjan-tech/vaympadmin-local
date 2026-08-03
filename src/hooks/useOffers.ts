import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import offerService from "@/services/offer.service";

import type {
  BulkUpsertTieredRequest,
  CreateBogoOfferRequest,
  CreateTierOfferRequest,
  Offer,
  OfferQueryParams,
  UpdateBogoOfferRequest,
  UpdateTierOfferRequest,
} from "@/types/offer";

export default function useOffers(initialParams?: OfferQueryParams) {
  const [offers, setOffers] = useState<Offer[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  /**
   * ==========================================
   * Fetch Offers
   * ==========================================
   */

  const fetchOffers = useCallback(
    async (params?: OfferQueryParams, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response = await offerService.getAll({
          ...initialParams,
          ...params,
        });

        setOffers(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch offers";

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

  const refresh = useCallback(async () => {
    await fetchOffers(undefined, true);
  }, [fetchOffers]);

  const getOffer = useCallback(async (id: string) => {
    return offerService.getById(id);
  }, []);

  /**
   * ==========================================
   * Create / Update — BOGO
   * ==========================================
   */

  const createBogo = useCallback(async (payload: CreateBogoOfferRequest) => {
    try {
      const offer = await offerService.createBogo(payload);

      toast.success("Offer created successfully");

      setOffers((prev) => [offer, ...prev]);
      setTotal((prev) => prev + 1);

      return offer;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create offer";

      toast.error(message);
      throw error;
    }
  }, []);

  const updateBogo = useCallback(async (id: string, payload: UpdateBogoOfferRequest) => {
    try {
      const offer = await offerService.updateBogo(id, payload);

      toast.success("Offer updated successfully");

      setOffers((prev) => prev.map((item) => (item._id === offer._id ? offer : item)));

      return offer;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update offer";

      toast.error(message);
      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Create / Update — Tier
   * ==========================================
   */

  const createTier = useCallback(async (payload: CreateTierOfferRequest) => {
    try {
      const offer = await offerService.createTier(payload);

      toast.success("Offer created successfully");

      setOffers((prev) => [offer, ...prev]);
      setTotal((prev) => prev + 1);

      return offer;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create offer";

      toast.error(message);
      throw error;
    }
  }, []);

  const updateTier = useCallback(async (id: string, payload: UpdateTierOfferRequest) => {
    try {
      const offer = await offerService.updateTier(id, payload);

      toast.success("Offer updated successfully");

      setOffers((prev) => prev.map((item) => (item._id === offer._id ? offer : item)));

      return offer;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update offer";

      toast.error(message);
      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Delete / Status
   * ==========================================
   */

  const deleteOffer = useCallback(
    async (id: string) => {
      try {
        await offerService.delete(id);

        toast.success("Offer deleted successfully");

        await refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete offer";

        toast.error(message);
        throw error;
      }
    },
    [refresh],
  );

  const updateStatus = useCallback(async (id: string, isEnabled: boolean) => {
    try {
      const offer = await offerService.updateStatus(id, isEnabled);

      toast.success(isEnabled ? "Offer enabled" : "Offer disabled");

      setOffers((prev) => prev.map((item) => (item._id === offer._id ? offer : item)));

      return offer;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update offer status";

      toast.error(message);
      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Tiered Deals (per seller)
   * ==========================================
   */

  const getTieredBySeller = useCallback(async (sellerId: string) => {
    return offerService.getTieredBySeller(sellerId);
  }, []);

  const bulkUpsertTiered = useCallback(
    async (sellerId: string, payload: BulkUpsertTieredRequest) => {
      try {
        const tiers = await offerService.bulkUpsertTiered(sellerId, payload);

        toast.success("Tiered deals saved successfully");

        return tiers;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save tiered deals";

        toast.error(message);
        throw error;
      }
    },
    [],
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
        const response = await offerService.getAll(initialParams);

        if (cancelled) return;

        setError(null);
        setOffers(response.items);
        setTotal(response.pagination.total);
        setPage(response.pagination.page);
        setLimit(response.pagination.limit);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : "Failed to fetch offers";

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
    offers,

    loading,
    error,

    total,
    page,
    limit,
    totalPages,

    refresh,
    fetchOffers,

    getOffer,

    createBogo,
    updateBogo,
    createTier,
    updateTier,

    deleteOffer,
    updateStatus,

    getTieredBySeller,
    bulkUpsertTiered,
  };
}
