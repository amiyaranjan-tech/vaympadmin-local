import api from "./axios";

import type {
  CategorySidebarBanner,
  CategorySidebarBannerApiResponse,
  DeleteCategorySidebarBannerRequest,
  UpsertCategorySidebarBannerRequest,
} from "@/types/categorySidebarBanner";

/**
 * Category Sidebar Banner API
 */
const categorySidebarBannerApi = {
  /**
   * ==========================================
   * Get All Category Sidebar Banners
   * ==========================================
   */
  getAll: async (): Promise<CategorySidebarBannerApiResponse<CategorySidebarBanner[]>> => {
    const response =
      await api.get<CategorySidebarBannerApiResponse<CategorySidebarBanner[]>>(
        "/category-sidebar-banners",
      );

    return response.data;
  },

  /**
   * ==========================================
   * Upsert Category Sidebar Banner
   * ==========================================
   */
  upsert: async (
    payload: UpsertCategorySidebarBannerRequest,
  ): Promise<CategorySidebarBannerApiResponse<CategorySidebarBanner>> => {
    const response = await api.put<CategorySidebarBannerApiResponse<CategorySidebarBanner>>(
      "/category-sidebar-banners",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Category Sidebar Banner
   * ==========================================
   */
  delete: async (
    payload: DeleteCategorySidebarBannerRequest,
  ): Promise<CategorySidebarBannerApiResponse<null>> => {
    const response = await api.delete<CategorySidebarBannerApiResponse<null>>(
      "/category-sidebar-banners",
      { data: payload },
    );

    return response.data;
  },
};

export default categorySidebarBannerApi;
