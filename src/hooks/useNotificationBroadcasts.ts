import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import notificationService from "@/services/notification.service";

import type { CreateBroadcastPayload, NotificationBroadcast } from "@/types/notification";

/**
 * ==========================================
 * Consumer broadcast history + send flow
 * ==========================================
 * Same fetch/loading/error/cancelled-guard shape as useEngagementAnalytics.
 */
export default function useNotificationBroadcasts() {
  const [items, setItems] = useState<NotificationBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const result = await notificationService.getBroadcasts({ limit: 30 });

      setItems(result.items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch broadcasts";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(
    async (payload: CreateBroadcastPayload) => {
      setSending(true);

      try {
        const broadcast = await notificationService.createBroadcast(payload);

        toast.success(
          broadcast.targetCount > 0
            ? `Sent to ${broadcast.targetCount} recipient${broadcast.targetCount === 1 ? "" : "s"}`
            : "Sent — no matching recipients",
        );

        await refresh();

        return broadcast;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send notification";

        toast.error(message);
        throw error;
      } finally {
        setSending(false);
      }
    },
    [refresh],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await refresh();
    };

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, sending, refresh, send };
}
