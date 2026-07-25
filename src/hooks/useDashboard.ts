import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import dashboardService from "@/services/dashboard.service";

import type { DashboardStats } from "@/types/dashboard";

export default function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * ==========================================
   * Fetch Stats
   * ==========================================
   */

  const fetchStats = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      const data = await dashboardService.getStats();

      setStats(data);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard stats";

      setError(message);

      toast.error(message);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * ==========================================
   * Initial Load
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await dashboardService.getStats();

        if (cancelled) {
          return;
        }

        setError(null);

        setStats(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats";

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
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
