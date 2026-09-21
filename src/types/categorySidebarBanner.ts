import type { UploadedImage } from "@/types/upload";

/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface CategorySidebarBannerApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Category Sidebar Banner
 * ==========================================
 * One admin-uploaded tile image per top-level category (Top Wear, Bottom
 * Wear, Footwear, ...) — see backend models/CategorySidebarBanner.js.
 * Powers the consumer app's Categories screen SIDEBAR instead of its
 * previous plain SVG icon per category. Gender-agnostic — unlike
 * CategoryBanner (types/categoryBanner.ts), which is keyed per
 * (gender, category, subcategory) for the subcategory GRID.
 */

export interface CategorySidebarBanner {
  _id: string;
  category: string;
  image: UploadedImage;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCategorySidebarBannerRequest {
  category: string;
  image: UploadedImage;
}

export interface DeleteCategorySidebarBannerRequest {
  category: string;
}
