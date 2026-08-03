import offerApi from "@/api/offer.api";

import type {
  BannerPriorityEntry,
  BulkUpsertTieredRequest,
  CreateBogoOfferRequest,
  CreateTierOfferRequest,
  Offer,
  OfferApiResponse,
  OfferListResponse,
  OfferQueryParams,
  UpdateBogoOfferRequest,
  UpdateTierOfferRequest,
} from "@/types/offer";

class OfferService {
  private handleResponse<T>(response: OfferApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  async getAll(params?: OfferQueryParams): Promise<OfferListResponse> {
    const response = await offerApi.getAll(params);

    return this.handleResponse(response);
  }

  async getById(id: string): Promise<Offer> {
    const response = await offerApi.getById(id);

    return this.handleResponse(response);
  }

  async createBogo(payload: CreateBogoOfferRequest): Promise<Offer> {
    const response = await offerApi.createBogo(payload);

    return this.handleResponse(response);
  }

  async updateBogo(id: string, payload: UpdateBogoOfferRequest): Promise<Offer> {
    const response = await offerApi.updateBogo(id, payload);

    return this.handleResponse(response);
  }

  async createTier(payload: CreateTierOfferRequest): Promise<Offer> {
    const response = await offerApi.createTier(payload);

    return this.handleResponse(response);
  }

  async updateTier(id: string, payload: UpdateTierOfferRequest): Promise<Offer> {
    const response = await offerApi.updateTier(id, payload);

    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const response = await offerApi.delete(id);

    this.handleResponse(response);
  }

  async updateStatus(id: string, isEnabled: boolean): Promise<Offer> {
    const response = await offerApi.updateStatus(id, { isEnabled });

    return this.handleResponse(response);
  }

  async getBannerPriorities(): Promise<BannerPriorityEntry[]> {
    const response = await offerApi.getBannerPriorities();

    return this.handleResponse(response);
  }

  async getTieredBySeller(sellerId: string): Promise<Offer[]> {
    const response = await offerApi.getTieredBySeller(sellerId);

    return this.handleResponse(response);
  }

  async bulkUpsertTiered(
    sellerId: string,
    payload: BulkUpsertTieredRequest,
  ): Promise<Offer[]> {
    const response = await offerApi.bulkUpsertTiered(sellerId, payload);

    return this.handleResponse(response);
  }
}

export default new OfferService();
