import api from "./axios";

import type {
  OrderApiResponse,
  OrderListResponse,
  OrderQueryParams,
} from "@/types/order";

/**
 * Order API
 */
const orderApi = {
  /**
   * ==========================================
   * Get Orders
   * GET /admin/orders
   * ==========================================
   */
  getAll: async (
    params?: OrderQueryParams,
  ): Promise<OrderApiResponse<OrderListResponse>> => {
    const response = await api.get<OrderApiResponse<OrderListResponse>>(
      "/admin/orders",
      {
        params,
      },
    );

    return response.data;
  },
};

export default orderApi;
