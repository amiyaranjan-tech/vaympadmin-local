import orderApi from "@/api/order.api";

import type {
  OrderApiResponse,
  OrderListResponse,
  OrderQueryParams,
} from "@/types/order";

class OrderService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: OrderApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Orders
   * ==========================================
   */

  async getAll(params?: OrderQueryParams): Promise<OrderListResponse> {
    const response = await orderApi.getAll(params);

    return this.handleResponse(response);
  }
}

export default new OrderService();
