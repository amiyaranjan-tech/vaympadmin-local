import api from "./axios";

import type {
  CategoryBanner,
  CategoryBannerApiResponse,
  DeleteCategoryBannerRequest,
  UpsertCategoryBannerRequest,
} from "@/types/categoryBanner";

/**
 * Category Banner API
 */
const categoryBannerApi = {
  /**
   * ==========================================
   * Get All Category Banners
   * ==========================================
   */
  getAll: async (): Promise<CategoryBannerApiResponse<CategoryBanner[]>> => {
    const response =
      await api.get<CategoryBannerApiResponse<CategoryBanner[]>>(
        "/category-banners",
      );

    return response.data;
  },

  /**
   * ==========================================
   * Upsert Category Banner
   * ==========================================
   */
  upsert: async (
    payload: UpsertCategoryBannerRequest,
  ): Promise<CategoryBannerApiResponse<CategoryBanner>> => {
    const response = await api.put<CategoryBannerApiResponse<CategoryBanner>>(
      "/category-banners",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Category Banner
   * ==========================================
   */
  delete: async (
    payload: DeleteCategoryBannerRequest,
  ): Promise<CategoryBannerApiResponse<null>> => {
    const response = await api.delete<CategoryBannerApiResponse<null>>(
      "/category-banners",
      { data: payload },
    );

    return response.data;
  },
};

export default categoryBannerApi;
