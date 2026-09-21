import categorySidebarBannerApi from "@/api/categorySidebarBanner.api";

import type {
  CategorySidebarBanner,
  CategorySidebarBannerApiResponse,
  DeleteCategorySidebarBannerRequest,
  UpsertCategorySidebarBannerRequest,
} from "@/types/categorySidebarBanner";

class CategorySidebarBannerService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: CategorySidebarBannerApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Category Sidebar Banners
   * ==========================================
   */

  async getAll(): Promise<CategorySidebarBanner[]> {
    const response = await categorySidebarBannerApi.getAll();

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Upsert Category Sidebar Banner
   * ==========================================
   */

  async upsert(payload: UpsertCategorySidebarBannerRequest): Promise<CategorySidebarBanner> {
    const response = await categorySidebarBannerApi.upsert(payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Delete Category Sidebar Banner
   * ==========================================
   */

  async delete(payload: DeleteCategorySidebarBannerRequest): Promise<void> {
    const response = await categorySidebarBannerApi.delete(payload);

    this.handleResponse(response);
  }
}

export default new CategorySidebarBannerService();
