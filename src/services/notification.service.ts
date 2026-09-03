import notificationApi from "@/api/notification.api";

import type {
  NotificationApiResponse,
  NotificationListResult,
  NotificationBroadcast,
  BroadcastListResult,
  BroadcastStats,
  CreateBroadcastPayload,
} from "@/types/notification";

class NotificationService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: NotificationApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  async getInbox(params?: { page?: number; limit?: number }): Promise<NotificationListResult> {
    const response = await notificationApi.getInbox(params);

    return this.handleResponse(response);
  }

  async getInboxUnreadCount(): Promise<number> {
    const response = await notificationApi.getInboxUnreadCount();

    return this.handleResponse(response).count;
  }

  async markInboxRead(id: string): Promise<void> {
    const response = await notificationApi.markInboxRead(id);

    this.handleResponse(response);
  }

  async markAllInboxRead(): Promise<void> {
    const response = await notificationApi.markAllInboxRead();

    this.handleResponse(response);
  }

  async getBroadcasts(params?: { page?: number; limit?: number }): Promise<BroadcastListResult> {
    const response = await notificationApi.getBroadcasts(params);

    return this.handleResponse(response);
  }

  async createBroadcast(payload: CreateBroadcastPayload): Promise<NotificationBroadcast> {
    const response = await notificationApi.createBroadcast(payload);

    return this.handleResponse(response);
  }

  async getBroadcastStats(): Promise<BroadcastStats> {
    const response = await notificationApi.getBroadcastStats();

    return this.handleResponse(response);
  }
}

export default new NotificationService();
