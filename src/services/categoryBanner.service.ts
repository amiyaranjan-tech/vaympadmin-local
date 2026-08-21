import categoryBannerApi from "@/api/categoryBanner.api";

import type {
  CategoryBanner,
  CategoryBannerApiResponse,
  DeleteCategoryBannerRequest,
  UpsertCategoryBannerRequest,
} from "@/types/categoryBanner";

class CategoryBannerService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: CategoryBannerApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Category Banners
   * ==========================================
   */

  async getAll(): Promise<CategoryBanner[]> {
    const response = await categoryBannerApi.getAll();

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Upsert Category Banner
   * ==========================================
   */

  async upsert(payload: UpsertCategoryBannerRequest): Promise<CategoryBanner> {
    const response = await categoryBannerApi.upsert(payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Delete Category Banner
   * ==========================================
   */

  async delete(payload: DeleteCategoryBannerRequest): Promise<void> {
    const response = await categoryBannerApi.delete(payload);

    this.handleResponse(response);
  }
}

export default new CategoryBannerService();
