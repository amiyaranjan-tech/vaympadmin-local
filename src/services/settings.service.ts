import settingsApi from "@/api/settings.api";

import type {
  PlatformSettings,
  SettingsApiResponse,
  UpdateSettingsRequest,
} from "@/types/settings";

class SettingsService {
  /**
   * ==========================================
   * Handle API Response
   * ==========================================
   */

  private handleResponse<T>(response: SettingsApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  }

  /**
   * ==========================================
   * Get Settings
   * ==========================================
   */

  async get(): Promise<PlatformSettings> {
    const response = await settingsApi.get();

    return this.handleResponse(response);
  }

  /**
   * ==========================================
   * Update Settings
   * ==========================================
   */

  async update(payload: UpdateSettingsRequest): Promise<PlatformSettings> {
    const response = await settingsApi.update(payload);

    return this.handleResponse(response);
  }
}

export default new SettingsService();
