import type { ProductStatus } from "@/types/product";

// Mirrors the backend's constants/productStatus.js transition table —
// this only decides which options the UI *offers*; the backend remains
// the actual enforcement point for every transition.
export const STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  draft: ["pending_review", "archived"],
  pending_review: ["approved", "rejected", "draft"],
  approved: ["published", "draft"],
  published: ["hidden", "archived"],
  hidden: ["published", "archived"],
  archived: [],
  rejected: ["draft"],
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  published: "Published",
  hidden: "Hidden",
  archived: "Archived",
  rejected: "Rejected",
};

export const STATUS_BADGE_VARIANT: Record<
  ProductStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  pending_review: "secondary",
  approved: "secondary",
  published: "default",
  hidden: "outline",
  archived: "outline",
  rejected: "destructive",
};
