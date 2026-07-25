import api from "./axios";

import type { DashboardApiResponse, DashboardStats } from "@/types/dashboard";

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
};

export default dashboardApi;
