import dashboardApi from "@/api/dashboard.api";

import type {
  DashboardApiResponse,
  DashboardStats,
  EngagementAnalytics,
  UserActivityEntry,
} from "@/types/dashboard";

class DashboardService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: DashboardApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get Dashboard Stats
   * ==========================================
   */

  async getStats(): Promise<DashboardStats> {
    const response = await dashboardApi.getStats();

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Get Engagement Analytics
   * ==========================================
   */

  async getEngagement(params?: {
    from?: string;
    to?: string;
  }): Promise<EngagementAnalytics> {
    const response = await dashboardApi.getEngagement(params);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Get Per-User Activity For A Day
   * ==========================================
   */

  async getUserActivity(params?: { date?: string }): Promise<UserActivityEntry[]> {
    const response = await dashboardApi.getUserActivity(params);

    return this.handleResponse(response);
  }
}

export default new DashboardService();
