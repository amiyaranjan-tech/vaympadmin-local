import api from "./axios";

import type {
  Banner,
  BannerApiResponse,
  BannerListResponse,
  BannerQueryParams,
  BannerStatusRequest,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "@/types/banner";

/**
 * Banner API
 */
const bannerApi = {
  /**
   * ==========================================
   * Get Banners
   * ==========================================
   */
  getAll: async (
    params?: BannerQueryParams,
  ): Promise<BannerApiResponse<BannerListResponse>> => {
    const response = await api.get<BannerApiResponse<BannerListResponse>>(
      "/banners",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get Banner By ID
   * ==========================================
   */
  getById: async (id: string): Promise<BannerApiResponse<Banner>> => {
    const response = await api.get<BannerApiResponse<Banner>>(
      `/banners/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Create Banner
   * ==========================================
   */
  create: async (
    payload: CreateBannerRequest,
  ): Promise<BannerApiResponse<Banner>> => {
    const response = await api.post<BannerApiResponse<Banner>>(
      "/banners",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Banner
   * ==========================================
   */
  update: async (
    id: string,
    payload: UpdateBannerRequest,
  ): Promise<BannerApiResponse<Banner>> => {
    const response = await api.put<BannerApiResponse<Banner>>(
      `/banners/${id}`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Banner
   * ==========================================
   */
  delete: async (id: string): Promise<BannerApiResponse<null>> => {
    const response = await api.delete<BannerApiResponse<null>>(
      `/banners/${id}`,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Update Banner Status
   * ==========================================
   */
  updateStatus: async (
    id: string,
    payload: BannerStatusRequest,
  ): Promise<BannerApiResponse<Banner>> => {
    const response = await api.patch<BannerApiResponse<Banner>>(
      `/banners/${id}/status`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Duplicate Banner
   * ==========================================
   */
  duplicate: async (id: string): Promise<BannerApiResponse<Banner>> => {
    const response = await api.post<BannerApiResponse<Banner>>(
      `/banners/${id}/duplicate`,
    );

    return response.data;
  },
};

export default bannerApi;
