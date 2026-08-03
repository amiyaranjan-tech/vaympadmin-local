import api from "./axios";

import type {
  BannerPriorityEntry,
  BulkUpsertTieredRequest,
  CreateBogoOfferRequest,
  CreateTierOfferRequest,
  Offer,
  OfferApiResponse,
  OfferListResponse,
  OfferQueryParams,
  OfferStatusRequest,
  UpdateBogoOfferRequest,
  UpdateTierOfferRequest,
} from "@/types/offer";

/**
 * Offer API
 */
const offerApi = {
  /**
   * ==========================================
   * Get Offers
   * ==========================================
   */
  getAll: async (
    params?: OfferQueryParams,
  ): Promise<OfferApiResponse<OfferListResponse>> => {
    const response = await api.get<OfferApiResponse<OfferListResponse>>("/offers", {
      params,
    });

    return response.data;
  },

  /**
   * ==========================================
   * Get Offer By ID
   * ==========================================
   */
  getById: async (id: string): Promise<OfferApiResponse<Offer>> => {
    const response = await api.get<OfferApiResponse<Offer>>(`/offers/${id}`);

    return response.data;
  },

  /**
   * ==========================================
   * Create / Update BOGO Offer
   * ==========================================
   */
  createBogo: async (
    payload: CreateBogoOfferRequest,
  ): Promise<OfferApiResponse<Offer>> => {
    const response = await api.post<OfferApiResponse<Offer>>("/offers/bogo", payload);

    return response.data;
  },

  updateBogo: async (
    id: string,
    payload: UpdateBogoOfferRequest,
  ): Promise<OfferApiResponse<Offer>> => {
    const response = await api.put<OfferApiResponse<Offer>>(`/offers/bogo/${id}`, payload);

    return response.data;
  },

  /**
   * ==========================================
   * Create / Update Tier Offer
   * ==========================================
   */
  createTier: async (
    payload: CreateTierOfferRequest,
  ): Promise<OfferApiResponse<Offer>> => {
    const response = await api.post<OfferApiResponse<Offer>>("/offers/tier", payload);

    return response.data;
  },

  updateTier: async (
    id: string,
    payload: UpdateTierOfferRequest,
  ): Promise<OfferApiResponse<Offer>> => {
    const response = await api.put<OfferApiResponse<Offer>>(`/offers/tier/${id}`, payload);

    return response.data;
  },

  /**
   * ==========================================
   * Delete Offer
   * ==========================================
   */
  delete: async (id: string): Promise<OfferApiResponse<null>> => {
    const response = await api.delete<OfferApiResponse<null>>(`/offers/${id}`);

    return response.data;
  },

  /**
   * ==========================================
   * Update Offer Status
   * ==========================================
   */
  updateStatus: async (
    id: string,
    payload: OfferStatusRequest,
  ): Promise<OfferApiResponse<Offer>> => {
    const response = await api.patch<OfferApiResponse<Offer>>(
      `/offers/${id}/status`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get Banner Priorities
   * ==========================================
   * Every non-deleted offer (any type) currently occupying a banner
   * position — duplicate-avoidance UX for the banner priority field.
   */
  getBannerPriorities: async (): Promise<OfferApiResponse<BannerPriorityEntry[]>> => {
    const response = await api.get<OfferApiResponse<BannerPriorityEntry[]>>(
      "/offers/banner-priorities",
    );

    return response.data;
  },

  /**
   * ==========================================
   * Get / Bulk Upsert Tiered Offers By Seller
   * ==========================================
   */
  getTieredBySeller: async (sellerId: string): Promise<OfferApiResponse<Offer[]>> => {
    const response = await api.get<OfferApiResponse<Offer[]>>(
      `/sellers/${sellerId}/tiered`,
    );

    return response.data;
  },

  bulkUpsertTiered: async (
    sellerId: string,
    payload: BulkUpsertTieredRequest,
  ): Promise<OfferApiResponse<Offer[]>> => {
    const response = await api.post<OfferApiResponse<Offer[]>>(
      `/sellers/${sellerId}/tiered`,
      payload,
    );

    return response.data;
  },
};

export default offerApi;
