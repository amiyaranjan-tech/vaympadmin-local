import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import bannerService from "@/services/banner.service";

import type {
  Banner,
  BannerQueryParams,
  BannerStatus,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "@/types/banner";

export default function useBanners(initialParams?: BannerQueryParams) {
  const [banners, setBanners] = useState<Banner[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  /**
   * ==========================================
   * Fetch Banners
   * ==========================================
   */

  const fetchBanners = useCallback(
    async (params?: BannerQueryParams, showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const response = await bannerService.getAll({
          ...initialParams,
          ...params,
        });

        setBanners(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch banners";

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
    await fetchBanners(undefined, true);
  }, [fetchBanners]);

  /**
   * ==========================================
   * Get Banner
   * ==========================================
   */

  const getBanner = useCallback(async (id: string) => {
    return bannerService.getById(id);
  }, []);

  /**
   * ==========================================
   * Create Banner
   * ==========================================
   */

  const createBanner = useCallback(async (payload: CreateBannerRequest) => {
    try {
      const banner = await bannerService.create(payload);

      toast.success("Banner created successfully");

      setBanners((prev) => [banner, ...prev]);

      setTotal((prev) => prev + 1);

      return banner;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create banner";

      toast.error(message);

      throw error;
    }
  }, []);

  /**
   * ==========================================
   * Update Banner
   * ==========================================
   */

  const updateBanner = useCallback(
    async (id: string, payload: UpdateBannerRequest) => {
      try {
        const banner = await bannerService.update(id, payload);

        toast.success("Banner updated successfully");

        setBanners((prev) =>
          prev.map((item) => (item._id === banner._id ? banner : item)),
        );

        return banner;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update banner";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Delete Banner
   * ==========================================
   */

  const deleteBanner = useCallback(
    async (id: string) => {
      try {
        await bannerService.delete(id);

        toast.success("Banner deleted successfully");

        await refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete banner";

        toast.error(message);

        throw error;
      }
    },
    [refresh],
  );

  /**
   * ==========================================
   * Update Banner Status
   * ==========================================
   */

  const updateStatus = useCallback(
    async (id: string, status: BannerStatus) => {
      try {
        const banner = await bannerService.updateStatus(id, status);

        toast.success("Banner status updated");

        setBanners((prev) =>
          prev.map((item) => (item._id === banner._id ? banner : item)),
        );

        return banner;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update banner status";

        toast.error(message);

        throw error;
      }
    },
    [],
  );

  /**
   * ==========================================
   * Duplicate Banner
   * ==========================================
   */

  const duplicateBanner = useCallback(
    async (id: string) => {
      try {
        const banner = await bannerService.duplicate(id);

        toast.success("Banner duplicated successfully");

        setBanners((prev) => [banner, ...prev]);

        setTotal((prev) => prev + 1);

        return banner;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to duplicate banner";

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
        const response = await bannerService.getAll(initialParams);

        if (cancelled) {
          return;
        }

        setError(null);

        setBanners(response.items);

        setTotal(response.pagination.total);

        setPage(response.pagination.page);

        setLimit(response.pagination.limit);

        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch banners";

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
    banners,

    loading,
    error,

    total,
    page,
    limit,
    totalPages,

    refresh,
    fetchBanners,

    getBanner,

    createBanner,
    updateBanner,
    deleteBanner,

    updateStatus,
    duplicateBanner,
  };
}
