import bannerApi from "@/api/banner.api";

import type {
  Banner,
  BannerApiResponse,
  BannerListResponse,
  BannerQueryParams,
  BannerStatus,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "@/types/banner";

class BannerService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: BannerApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Banners
   * ==========================================
   */

  async getAll(params?: BannerQueryParams): Promise<BannerListResponse> {
    const response = await bannerApi.getAll(params);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Get Banner By Id
   * ==========================================
   */

  async getById(id: string): Promise<Banner> {
    const response = await bannerApi.getById(id);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Create Banner
   * ==========================================
   */

  async create(payload: CreateBannerRequest): Promise<Banner> {
    const response = await bannerApi.create(payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Banner
   * ==========================================
   */

  async update(id: string, payload: UpdateBannerRequest): Promise<Banner> {
    const response = await bannerApi.update(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Delete Banner
   * ==========================================
   */

  async delete(id: string): Promise<void> {
    const response = await bannerApi.delete(id);

    this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Banner Status
   * ==========================================
   */

  async updateStatus(id: string, status: BannerStatus): Promise<Banner> {
    const response = await bannerApi.updateStatus(id, {
      status,
    });

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Duplicate Banner
   * ==========================================
   */

  async duplicate(id: string): Promise<Banner> {
    const response = await bannerApi.duplicate(id);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Publish Banner
   * ==========================================
   */

  publish(id: string): Promise<Banner> {
    return this.updateStatus(id, "published");
  }

  /**
   * ==========================================
   * Hide Banner
   * ==========================================
   */

  hide(id: string): Promise<Banner> {
    return this.updateStatus(id, "hidden");
  }
}

export default new BannerService();
