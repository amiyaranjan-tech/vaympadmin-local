import riderApi from "@/api/rider.api";

import type {
  CreateRiderRequest,
  Rider,
  RiderApiResponse,
  RiderListResponse,
  RiderQueryParams,
} from "@/types/rider";

class RiderService {
  private handleResponse<T>(response: RiderApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  async getAll(params?: RiderQueryParams): Promise<RiderListResponse> {
    const response = await riderApi.getAll(params);

    return this.handleResponse(response);
  }

  async getById(id: string): Promise<Rider> {
    const response = await riderApi.getById(id);

    return this.handleResponse(response);
  }

  async create(payload: CreateRiderRequest): Promise<Rider> {
    const response = await riderApi.create(payload);

    return this.handleResponse(response);
  }

  async delete(id: string): Promise<void> {
    const response = await riderApi.delete(id);

    this.handleResponse(response);
  }

  /**
   * ==========================================
   * Verify Rider
   * (pending -> active, atomically, on the backend)
   * ==========================================
   */
  verify(id: string): Promise<Rider> {
    return riderApi.verify(id, { isVerified: true }).then((r) => this.handleResponse(r));
  }

  /**
   * ==========================================
   * Reject Rider
   * (pending -> rejected, records a reason)
   * ==========================================
   */
  reject(id: string, reason: string): Promise<Rider> {
    return riderApi.reject(id, { reason }).then((r) => this.handleResponse(r));
  }

  /**
   * ==========================================
   * Block (Suspend) Rider
   * (active -> suspended)
   * ==========================================
   */
  block(id: string): Promise<Rider> {
    return riderApi
      .updateStatus(id, { status: "suspended" })
      .then((r) => this.handleResponse(r));
  }

  /**
   * ==========================================
   * Unblock (Reactivate) Rider
   * (suspended | inactive -> active)
   * ==========================================
   */
  unblock(id: string): Promise<Rider> {
    return riderApi
      .updateStatus(id, { status: "active" })
      .then((r) => this.handleResponse(r));
  }
}

export default new RiderService();
