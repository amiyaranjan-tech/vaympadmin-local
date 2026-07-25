import dashboardApi from "@/api/dashboard.api";

import type { DashboardApiResponse, DashboardStats } from "@/types/dashboard";

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
}

export default new DashboardService();
