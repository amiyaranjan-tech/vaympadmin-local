import type {
  BulkUpsertTieredRequest,
  CreateBogoOfferRequest,
  CreateTierOfferRequest,
  TierRow,
} from "@/types/offer";

import type {
  BogoOfferFormValues,
  TierOfferFormValues,
  TierRowFormValues,
  TierRowsFormValues,
} from "./offer.schema";

/** "" (left blank = uncapped) -> null; a real value -> Number(...). */
function toNullableNumber(value: string | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  if (value.trim() === "") return null;

  return Number(value);
}

/**
 * ==========================================
 * BOGO
 * ==========================================
 */

// A full CreateXRequest already structurally satisfies UpdateXRequest
// (Partial<CreateXRequest>), so one builder covers both create and update
// call sites — the form always has every field populated either way.
export function buildBogoOfferPayload(values: BogoOfferFormValues): CreateBogoOfferRequest {
  return {
    title: values.title.trim(),
    description: values.description?.trim() ?? "",

    seller: values.seller,
    scope: values.scope,
    products: values.scope === "entire_shop" ? [] : values.products,

    buyQuantity: values.buyQuantity,
    getQuantity: values.getQuantity,
    getDiscountPercent: values.getDiscountPercent,

    freeProductIds: values.freeProductIds,
    maximumFreeItems: toNullableNumber(values.maximumFreeItems),

    isEnabled: values.isEnabled,
    priority: values.priority,

    // Drop empty slots — the form always renders 5, only filled ones (a
    // real uploaded url) should ever reach the backend.
    shopBanners: values.shopBanners.filter((b) => b.url),

    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/**
 * ==========================================
 * Tier Offer (single — "Buy X Amount Get X OFF")
 * ==========================================
 */

export function buildTierOfferPayload(values: TierOfferFormValues): CreateTierOfferRequest {
  return {
    title: values.title.trim(),
    description: values.description?.trim() ?? "",

    type: values.type,
    seller: values.seller,
    scope: values.scope,
    products: values.scope === "entire_shop" ? [] : values.products,

    minSpend: values.minSpend,
    discountAmount: values.discountAmount,
    discountPercent: values.discountPercent,
    maximumDiscount: toNullableNumber(values.maximumDiscount),
    maxUses: toNullableNumber(values.maxUses),

    isEnabled: values.isEnabled,
    priority: values.priority,

    shopBanners: values.shopBanners.filter((b) => b.url),

    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/**
 * ==========================================
 * Tier Row (bulk Tiered Deals builder)
 * ==========================================
 */

export function buildTierRowPayload(values: TierRowFormValues): TierRow {
  return {
    _id: values._id,

    title: values.title.trim(),
    description: values.description?.trim() ?? "",

    type: values.type,

    minSpend: values.minSpend,
    discountAmount: values.discountAmount,
    discountPercent: values.discountPercent,
    maximumDiscount: toNullableNumber(values.maximumDiscount),
    maxUses: toNullableNumber(values.maxUses),

    isEnabled: values.isEnabled,
    priority: values.priority,

    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/**
 * ==========================================
 * Tiered Deals — Bulk Upsert Envelope
 * ==========================================
 * scope/products are ladder-level (one selection covers every tier row —
 * see offer.schema.ts#tierRowsSchema), submitted once here rather than
 * per-row.
 */

export function buildTierBulkPayload(values: TierRowsFormValues): BulkUpsertTieredRequest {
  return {
    scope: values.scope,
    products: values.scope === "entire_shop" ? [] : values.products,

    shopBanners: values.shopBanners.filter((b) => b.url),

    tiers: values.tiers.map(buildTierRowPayload),
  };
}
