import api from "./axios";

import type {
  NotificationApiResponse,
  NotificationListResult,
  NotificationBroadcast,
  BroadcastListResult,
  BroadcastStats,
  CreateBroadcastPayload,
} from "@/types/notification";

/**
 * Admin Notification API
 */
const notificationApi = {
  /**
   * ==========================================
   * Own operational inbox (ADMIN_NEW_ORDER, ...)
   * ==========================================
   */
  getInbox: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<NotificationApiResponse<NotificationListResult>> => {
    const response = await api.get<NotificationApiResponse<NotificationListResult>>(
      "/admin/notifications/inbox",
      { params },
    );

    return response.data;
  },

  getInboxUnreadCount: async (): Promise<NotificationApiResponse<{ count: number }>> => {
    const response = await api.get<NotificationApiResponse<{ count: number }>>(
      "/admin/notifications/inbox/unread-count",
    );

    return response.data;
  },

  markInboxRead: async (id: string): Promise<NotificationApiResponse<unknown>> => {
    const response = await api.patch<NotificationApiResponse<unknown>>(
      `/admin/notifications/inbox/${id}/read`,
    );

    return response.data;
  },

  markAllInboxRead: async (): Promise<NotificationApiResponse<unknown>> => {
    const response = await api.patch<NotificationApiResponse<unknown>>(
      "/admin/notifications/inbox/read-all",
    );

    return response.data;
  },

  /**
   * ==========================================
   * Consumer broadcasts
   * ==========================================
   */
  getBroadcasts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<NotificationApiResponse<BroadcastListResult>> => {
    const response = await api.get<NotificationApiResponse<BroadcastListResult>>(
      "/admin/notifications",
      { params },
    );

    return response.data;
  },

  createBroadcast: async (
    payload: CreateBroadcastPayload,
  ): Promise<NotificationApiResponse<NotificationBroadcast>> => {
    const response = await api.post<NotificationApiResponse<NotificationBroadcast>>(
      "/admin/notifications",
      payload,
    );

    return response.data;
  },

  getBroadcastStats: async (): Promise<NotificationApiResponse<BroadcastStats>> => {
    const response = await api.get<NotificationApiResponse<BroadcastStats>>(
      "/admin/notifications/stats",
    );

    return response.data;
  },
};

export default notificationApi;
