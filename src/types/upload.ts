/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface UploadApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Uploaded Image
 * ==========================================
 * Shape shared by Banner/Product/Seller image fields — a real hosted
 * upload result (backend stores it in ImageKit, see api/upload.api.ts).
 */

export interface UploadedImage {
  url: string;
  publicId: string;
}
