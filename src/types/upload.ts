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
 * Sign Upload
 * ==========================================
 */

export interface SignUploadRequest {
  folder?: string;
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * ==========================================
 * Uploaded Image
 * ==========================================
 * Shape shared by Banner/Product/Seller image fields — a real Cloudinary
 * upload result.
 */

export interface UploadedImage {
  url: string;
  publicId: string;
}
