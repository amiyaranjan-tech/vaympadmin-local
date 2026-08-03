import api from "./axios";

import type {
  SignUploadRequest,
  UploadApiResponse,
  UploadSignature,
} from "@/types/upload";

/**
 * Upload API
 */
const uploadApi = {
  /**
   * ==========================================
   * Sign Upload
   * ==========================================
   */
  sign: async (
    payload: SignUploadRequest = {},
  ): Promise<UploadApiResponse<UploadSignature>> => {
    const response = await api.post<UploadApiResponse<UploadSignature>>(
      "/uploads/sign",
      payload,
    );

    return response.data;
  },
};

export default uploadApi;
