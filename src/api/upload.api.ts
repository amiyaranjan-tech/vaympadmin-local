import api from "./axios";

import type { UploadApiResponse, UploadedImage } from "@/types/upload";

/**
 * Upload API
 */
const uploadApi = {
  /**
   * ==========================================
   * Upload File
   * POST /uploads — file bytes go through our backend, which stores them
   * in ImageKit and returns the hosted URL.
   * ==========================================
   */
  create: async (
    file: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<UploadApiResponse<UploadedImage>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<UploadApiResponse<UploadedImage>>(
      "/uploads",
      formData,
      {
        onUploadProgress: (event) => {
          if (!event.total || !onUploadProgress) return;
          onUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      },
    );

    return response.data;
  },
};

export default uploadApi;
