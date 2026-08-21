import type { UploadedImage } from "@/types/upload";

/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface CategoryBannerApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Category Banner
 * ==========================================
 * One admin-uploaded tile image per (gender, category, subcategory) — see
 * backend models/CategoryBanner.js. Powers the consumer app's Categories
 * screen subcategory grid instead of its previous arbitrary product-photo
 * fallback.
 */

export type CategoryBannerGender = "men" | "women" | "kids" | "unisex";

export interface CategoryBanner {
  _id: string;
  gender: CategoryBannerGender;
  category: string;
  subcategory: string;
  image: UploadedImage;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCategoryBannerRequest {
  gender: CategoryBannerGender;
  category: string;
  subcategory: string;
  image: UploadedImage;
}

export interface DeleteCategoryBannerRequest {
  gender: CategoryBannerGender;
  category: string;
  subcategory: string;
}
