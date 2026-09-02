import { useEffect, useState } from "react";
import { toast } from "sonner";

import dashboardService from "@/services/dashboard.service";

import type { UserActivityEntry } from "@/types/dashboard";

/**
 * ==========================================
 * Per-User Activity (one calendar day)
 * ==========================================
 * Same fetch/loading/error/cancelled-guard shape as useEngagementAnalytics,
 * parametrized by an optional date (defaults server-side to today).
 */
export default function useUserActivity(date?: string) {
  const [data, setData] = useState<UserActivityEntry[] | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        setError(null);

        const result = await dashboardService.getUserActivity({ date });

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
            : "Failed to fetch user activity";

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
  }, [date]);

  return { data, loading, error };
}
