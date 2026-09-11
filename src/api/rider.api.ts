import api from "./axios";

import type {
  CreateRiderRequest,
  Rider,
  RiderApiResponse,
  RiderListResponse,
  RiderQueryParams,
  RiderStatusRequest,
  RejectRiderRequest,
  VerifyRiderRequest,
} from "@/types/rider";

/**
 * Rider API
 */
const riderApi = {
  /**
   * ==========================================
   * Get Riders
   * ==========================================
   */
  getAll: async (
    params?: RiderQueryParams,
  ): Promise<RiderApiResponse<RiderListResponse>> => {
    const response = await api.get<RiderApiResponse<RiderListResponse>>(
      "/riders",
      { params },
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get Rider By ID
   * ==========================================
   */
  getById: async (id: string): Promise<RiderApiResponse<Rider>> => {
    const response = await api.get<RiderApiResponse<Rider>>(`/riders/${id}`);

    return response.data;
  },

  /**
   * ==========================================
   * Create Rider
   * ==========================================
   */
  create: async (
    payload: CreateRiderRequest,
  ): Promise<RiderApiResponse<Rider>> => {
    const response = await api.post<RiderApiResponse<Rider>>(
      "/riders",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Rider
   * ==========================================
   */
  delete: async (id: string): Promise<RiderApiResponse<null>> => {
    const response = await api.delete<RiderApiResponse<null>>(
      `/riders/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Rider Status
   * ==========================================
   */
  updateStatus: async (
    id: string,
    payload: RiderStatusRequest,
  ): Promise<RiderApiResponse<Rider>> => {
    const response = await api.patch<RiderApiResponse<Rider>>(
      `/riders/${id}/status`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Verify Rider
   * PATCH /riders/:id/verify
   * ==========================================
   */
  verify: async (
    id: string,
    payload: VerifyRiderRequest,
  ): Promise<RiderApiResponse<Rider>> => {
    const response = await api.patch<RiderApiResponse<Rider>>(
      `/riders/${id}/verify`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Reject Rider
   * PATCH /riders/:id/reject
   * ==========================================
   */
  reject: async (
    id: string,
    payload: RejectRiderRequest,
  ): Promise<RiderApiResponse<Rider>> => {
    const response = await api.patch<RiderApiResponse<Rider>>(
      `/riders/${id}/reject`,
      payload,
    );

    return response.data;
  },
};

export default riderApi;
