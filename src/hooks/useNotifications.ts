import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import notificationService from "@/services/notification.service";

import type { AdminNotification } from "@/types/notification";

/**
 * ==========================================
 * Admin's own operational inbox (ADMIN_NEW_ORDER, ADMIN_LOW_STOCK, ...)
 * ==========================================
 * Same fetch/loading/error/cancelled-guard shape as useEngagementAnalytics.
 * Polls the unread count every 60s — no websocket infra exists in this app,
 * a light poll is enough to keep the Topbar bell reasonably fresh.
 */
const UNREAD_POLL_MS = 60000;

export default function useNotifications() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notificationService.getInbox({ limit: 20 }),
        notificationService.getInboxUnreadCount(),
      ]);

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
      void notificationService
        .getInboxUnreadCount()
        .then((count) => {
          if (!cancelled) setUnreadCount(count);
        })
        .catch(() => {});
    }, UNREAD_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, unreadCount, loading, refresh, markRead, markAllRead };
}
