import optionApi from "@/api/option.api";

import type {
  CreateOptionRequest,
  DropdownOption,
  DropdownOptions,
  OptionApiResponse,
} from "@/types/option";

class OptionService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: OptionApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get All Options
   * ==========================================
   */

  async getAll(): Promise<DropdownOptions> {
    const response = await optionApi.getAll();

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Create Option
   * ==========================================
   */

  async create(payload: CreateOptionRequest): Promise<DropdownOption> {
    const response = await optionApi.create(payload);

    return this.handleResponse(response);
  }
}

export default new OptionService();
