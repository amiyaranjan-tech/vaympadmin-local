import type { DealType } from "@/types/product";

// Presentational metadata only — the actual enum values are enforced by
// the backend (constants/dealType.js). Mirrors bannerMeta.ts's shape.

export const DEAL_TYPES: DealType[] = [
  "none",
  "bogo",
  "buy2get1",
  "buy2get_discount",
  "tiered_amount",
  "tiered_percentage",
  "flash_sale",
  "limited_offer",
  "clearance",
  "combo_offer",
  "free_shipping",
];

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  none: "None",
  bogo: "Buy One Get One",
  buy2get1: "Buy Two Get One",
  buy2get_discount: "Buy Two Get Discount",
  tiered_amount: "Tiered Amount Off",
  tiered_percentage: "Tiered Percentage Off",
  flash_sale: "Flash Sale",
  limited_offer: "Limited Offer",
  clearance: "Clearance",
  combo_offer: "Combo Offer",
  free_shipping: "Free Shipping",
};
