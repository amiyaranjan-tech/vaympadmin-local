import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import dashboardService from "@/services/dashboard.service";

import type { EngagementAnalytics } from "@/types/dashboard";

/**
 * ==========================================
 * Engagement Analytics
 * ==========================================
 * Same fetch/loading/error/cancelled-guard shape as useDashboard,
 * parametrized by an optional date range so Analytics.tsx's date-range
 * filter can refetch without a page reload.
 */
export default function useEngagementAnalytics(range?: { from?: string; to?: string }) {
  const [data, setData] = useState<EngagementAnalytics | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const fetchEngagement = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const result = await dashboardService.getEngagement(range);

      setData(result);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch engagement analytics";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.from, range?.to]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        setError(null);

        const result = await dashboardService.getEngagement(range);

        if (cancelled) {
          return;
        }

        setData(result);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch engagement analytics";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.from, range?.to]);

  return {
    data,
    loading,
    error,
    refresh: fetchEngagement,
  };
}
