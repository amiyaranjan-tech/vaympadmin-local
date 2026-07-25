import sellerApi from "@/api/seller.api";

import type {
  CreateSellerRequest,
  Seller,
  SellerApiResponse,
  SellerListResponse,
  SellerQueryParams,
  SellerStatus,
  ShopStatusRequest,
  UpdateSellerRequest,
  VerifySellerRequest,
} from "@/types/seller";

class SellerService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: SellerApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Sellers
   * ==========================================
   */

  async getAll(params?: SellerQueryParams): Promise<SellerListResponse> {
    const response = await sellerApi.getAll(params);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Get Seller By Id
   * ==========================================
   */

  async getById(id: string): Promise<Seller> {
    const response = await sellerApi.getById(id);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Create Seller
   * ==========================================
   */

  async create(payload: CreateSellerRequest): Promise<Seller> {
    const response = await sellerApi.create(payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Seller
   * ==========================================
   */

  async update(id: string, payload: UpdateSellerRequest): Promise<Seller> {
    const response = await sellerApi.update(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Delete Seller
   * ==========================================
   */

  async delete(id: string): Promise<void> {
    const response = await sellerApi.delete(id);

    this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Seller Status
   * ==========================================
   */

  async updateStatus(id: string, status: SellerStatus): Promise<Seller> {
    const response = await sellerApi.updateStatus(id, {
      status,
    });

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Shop Status
   * ==========================================
   */

  async updateShopStatus(
    id: string,
    payload: ShopStatusRequest,
  ): Promise<Seller> {
    const response = await sellerApi.updateShopStatus(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Seller Verification
   * ==========================================
   */

  async updateVerification(
    id: string,
    payload: VerifySellerRequest,
  ): Promise<Seller> {
    const response = await sellerApi.updateVerification(id, payload);

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Approve Seller
   * ==========================================
   */

  approve(id: string): Promise<Seller> {
    return this.updateStatus(id, "active");
  }

  /**
   * ==========================================
   * Suspend Seller
   * ==========================================
   */

  suspend(id: string): Promise<Seller> {
    return this.updateStatus(id, "suspended");
  }

  /**
   * ==========================================
   * Open Shop
   * ==========================================
   */

  openShop(id: string): Promise<Seller> {
    return this.updateShopStatus(id, {
      shopStatusMode: "manual",
      shopStatus: "open",
    });
  }

  /**
   * ==========================================
   * Close Shop
   * ==========================================
   */

  closeShop(id: string): Promise<Seller> {
    return this.updateShopStatus(id, {
      shopStatusMode: "manual",
      shopStatus: "closed",
    });
  }

  /**
   * ==========================================
   * Set Shop Status To Automatic
   * ==========================================
   */

  setAutoShopStatus(id: string): Promise<Seller> {
    return this.updateShopStatus(id, {
      shopStatusMode: "auto",
    });
  }

  /**
   * ==========================================
   * Verify Seller
   * ==========================================
   */

  verify(id: string): Promise<Seller> {
    return this.updateVerification(id, {
      isVerified: true,
    });
  }

  /**
   * ==========================================
   * Remove Verification
   * ==========================================
   */

  unverify(id: string): Promise<Seller> {
    return this.updateVerification(id, {
      isVerified: false,
    });
  }

  /**
   * ==========================================
   * Search Sellers
   * ==========================================
   */

  search(search: string): Promise<SellerListResponse> {
    return this.getAll({
      search,
    });
  }

  /**
   * ==========================================
   * Get Active Sellers
   * ==========================================
   */

  getActive(): Promise<SellerListResponse> {
    return this.getAll({
      status: "active",
    });
  }

  /**
   * ==========================================
   * Get Pending Sellers
   * ==========================================
   */

  getPending(): Promise<SellerListResponse> {
    return this.getAll({
      status: "pending",
    });
  }

  /**
   * ==========================================
   * Get Suspended Sellers
   * ==========================================
   */

  getSuspended(): Promise<SellerListResponse> {
    return this.getAll({
      status: "suspended",
    });
  }
}

export default new SellerService();
