import api from "./axios";

import type {
  CreateSellerRequest,
  Seller,
  SellerApiResponse,
  SellerListResponse,
  SellerQueryParams,
  SellerStatusRequest,
  ShopStatusRequest,
  UpdateSellerRequest,
  VerifySellerRequest,
} from "@/types/seller";

/**
 * Seller API
 */
const sellerApi = {
  /**
   * ==========================================
   * Get Sellers
   * ==========================================
   */
  getAll: async (
    params?: SellerQueryParams,
  ): Promise<SellerApiResponse<SellerListResponse>> => {
    const response = await api.get<SellerApiResponse<SellerListResponse>>(
      "/sellers",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get Seller By ID
   * ==========================================
   */
  getById: async (id: string): Promise<SellerApiResponse<Seller>> => {
    const response = await api.get<SellerApiResponse<Seller>>(`/sellers/${id}`);

    return response.data;
  },

  /**
   * ==========================================
   * Create Seller
   * ==========================================
   */
  create: async (
    payload: CreateSellerRequest,
  ): Promise<SellerApiResponse<Seller>> => {
    const response = await api.post<SellerApiResponse<Seller>>(
      "/sellers",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Seller
   * ==========================================
   */
  update: async (
    id: string,
    payload: UpdateSellerRequest,
  ): Promise<SellerApiResponse<Seller>> => {
    const response = await api.put<SellerApiResponse<Seller>>(
      `/sellers/${id}`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Seller
   * ==========================================
   */
  delete: async (id: string): Promise<SellerApiResponse<null>> => {
    const response = await api.delete<SellerApiResponse<null>>(
      `/sellers/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Seller Status
   * ==========================================
   */
  updateStatus: async (
    id: string,
    payload: SellerStatusRequest,
  ): Promise<SellerApiResponse<Seller>> => {
    const response = await api.patch<SellerApiResponse<Seller>>(
      `/sellers/${id}/status`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Shop Status
   * ==========================================
   */
  updateShopStatus: async (
    id: string,
    payload: ShopStatusRequest,
  ): Promise<SellerApiResponse<Seller>> => {
    const response = await api.patch<SellerApiResponse<Seller>>(
      `/sellers/${id}/shop-status`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Seller Verification
   * PATCH /sellers/:id/verify
   * ==========================================
   */
  updateVerification: async (
    id: string,
    payload: VerifySellerRequest,
  ): Promise<SellerApiResponse<Seller>> => {
    const response = await api.patch<SellerApiResponse<Seller>>(
      `/sellers/${id}/verify`,
      payload,
    );

    return response.data;
  },
};

export default sellerApi;
