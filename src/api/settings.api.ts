import api from "./axios";

import type {
  PlatformSettings,
  SettingsApiResponse,
  UpdateSettingsRequest,
} from "@/types/settings";

/**
 * Settings API
 */
const settingsApi = {
  /**
   * ==========================================
   * Get Settings
   * ==========================================
   */
  get: async (): Promise<SettingsApiResponse<PlatformSettings>> => {
    const response =
      await api.get<SettingsApiResponse<PlatformSettings>>("/settings");

    return response.data;
  },

  /**
   * ==========================================
   * Update Settings
   * ==========================================
   */
  update: async (
    payload: UpdateSettingsRequest,
  ): Promise<SettingsApiResponse<PlatformSettings>> => {
    const response = await api.put<SettingsApiResponse<PlatformSettings>>(
      "/settings",
      payload,
    );

    return response.data;
  },
};

export default settingsApi;
