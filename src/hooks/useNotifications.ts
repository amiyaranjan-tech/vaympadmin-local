import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import notificationService from "@/services/notification.service";
import { playNotificationSound } from "@/utils/notificationSound";

import type { AdminNotification, NotificationPriority } from "@/types/notification";

/**
 * ==========================================
 * Admin's own operational inbox (ADMIN_NEW_ORDER, ADMIN_LOW_STOCK, ...)
 * ==========================================
 * Same fetch/loading/error/cancelled-guard shape as useEngagementAnalytics.
 * Polls the full inbox every 60s — no websocket infra exists in this app,
 * a light poll is enough to keep the Topbar bell (and the toast/sound
 * below) reasonably fresh.
 */
const POLL_MS = 60000;

const TOAST_VARIANT: Record<NotificationPriority, "error" | "warning" | "info"> = {
  CRITICAL: "error",
  HIGH: "warning",
  NORMAL: "info",
  LOW: "info",
};

export default function useNotifications() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Which notification ids this tab has already surfaced — null until the
  // very first fetch resolves. That first fetch just seeds the set (a
  // freshly opened tab shouldn't toast/chime for a backlog); only ids that
  // show up in a LATER fetch and weren't seen before are "new arrivals".
  const seenIdsRef = useRef<Set<string> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notificationService.getInbox({ limit: 20 }),
        notificationService.getInboxUnreadCount(),
      ]);

      if (seenIdsRef.current === null) {
        seenIdsRef.current = new Set(list.items.map((item) => item._id));
      } else {
        const newItems = list.items.filter((item) => !seenIdsRef.current!.has(item._id));

        for (const item of newItems) {
          toast[TOAST_VARIANT[item.priority]](item.title, { description: item.body });
          seenIdsRef.current.add(item._id);
        }

        if (newItems.length > 0) {
          playNotificationSound();
        }

        list.items.forEach((item) => seenIdsRef.current!.add(item._id));
      }

      setItems(list.items);
      setUnreadCount(count);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch notifications";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(
    async (id: string) => {
      await notificationService.markInboxRead(id);
      await refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    await notificationService.markAllInboxRead();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await refresh();
    };

    void load();

    const interval = setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, unreadCount, loading, refresh, markRead, markAllRead };
}
