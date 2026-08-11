import api from "./axios";

import type {
  DashboardApiResponse,
  DashboardStats,
  EngagementAnalytics,
} from "@/types/dashboard";

/**
 * Dashboard API
 */
const dashboardApi = {
  /**
   * ==========================================
   * Get Dashboard Stats
   * ==========================================
   */
  getStats: async (): Promise<DashboardApiResponse<DashboardStats>> => {
    const response =
      await api.get<DashboardApiResponse<DashboardStats>>(
        "/dashboard/stats",
      );

    return response.data;
  },

  /**
   * ==========================================
   * Get Engagement Analytics
   * ==========================================
   */
  getEngagement: async (params?: {
    from?: string;
    to?: string;
  }): Promise<DashboardApiResponse<EngagementAnalytics>> => {
    const response = await api.get<DashboardApiResponse<EngagementAnalytics>>(
      "/dashboard/engagement",
      { params },
    );

    return response.data;
  },
};

export default dashboardApi;
