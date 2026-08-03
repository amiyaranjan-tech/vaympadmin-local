import api from "./axios";

import type {
  CreateOptionRequest,
  DeleteOptionRequest,
  DropdownOption,
  DropdownOptions,
  OptionApiResponse,
} from "@/types/option";

/**
 * Option API
 */
const optionApi = {
  /**
   * ==========================================
   * Get All Options
   * ==========================================
   */
  getAll: async (): Promise<OptionApiResponse<DropdownOptions>> => {
    const response =
      await api.get<OptionApiResponse<DropdownOptions>>("/options");

    return response.data;
  },

  /**
   * ==========================================
   * Create Option
   * ==========================================
   */
  create: async (
    payload: CreateOptionRequest,
  ): Promise<OptionApiResponse<DropdownOption>> => {
    const response = await api.post<OptionApiResponse<DropdownOption>>(
      "/options",
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================
   * Delete Option
   * ==========================================
   */
  delete: async (
    payload: DeleteOptionRequest,
  ): Promise<OptionApiResponse<null>> => {
    const response = await api.delete<OptionApiResponse<null>>("/options", {
      data: payload,
    });

    return response.data;
  },
};

export default optionApi;
