import type {
  CreateProductRequest,
  ProductImage,
  UpdateProductRequest,
} from "@/types/product";

import type { ProductFormValues } from "./product.schema";

/**
 * Pricing step breakdown — mirrors the backend's
 * models/Product.js#computeDerivedFields (and the Seller App's form).
 * MRP minus the seller's discount % is the Discounted Price (sellerPrice);
 * Vaymp's commission is taken from that, leaving the cost price (what the
 * seller is finally paid).
 */
export function priceBreakdown(
  mrp: number,
  discountPercent: number,
  commissionRate: number,
) {
  const sellerPrice = Math.max(0, Math.round(mrp * (1 - discountPercent / 100)));
  const commission = Math.round((sellerPrice * commissionRate) / 100);

  return {
    sellerPrice,
    commission,
    costPrice: sellerPrice - commission,
  };
}

/**
 * ==========================================
 * Common Mapper
 * ==========================================
 */

function buildCommonPayload(values: ProductFormValues, images: ProductImage[]) {
  return {
    name: values.name.trim(),

    description: values.description.trim(),

    brand: values.brand.trim(),

    category: values.category.trim(),

    group: values.group.map((g) => g.trim()),

    subcategory: values.subcategory.trim(),

    gender: values.gender,

    seller: values.seller,

    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),

    sellingPrice: values.sellingPrice,

    costPrice: values.costPrice,

    discountPercent: values.discountPercent,

    sellerPrice: priceBreakdown(values.sellingPrice, values.discountPercent, 0)
      .sellerPrice,

    variants: values.variants.map((variant) => ({
      size: variant.size,
      color: variant.color?.trim() ?? "",
      sku: variant.sku?.trim() ?? "",
      stock: variant.stock,
    })),

    color: values.color.trim(),

    season: values.season.trim(),

    attributes: Object.fromEntries(
      Object.entries(values.attributes ?? {}).filter(([, value]) => value.trim() !== ""),
    ),

    isFeatured: values.isFeatured,

    isTrending: values.isTrending,

    isNewArrival: values.isNewArrival,

    isLimitedStock: values.isLimitedStock,

    isBogo: values.isBogo,

    tryAndBuy: values.tryAndBuy,

    isReturnable: values.isReturnable,

    excludeFromShopDeals: values.excludeFromShopDeals,

    // dealType is intentionally never sent here — it's owned by the
    // deal-link flow (BogoOfferForm/TieredDealsForm linking a product to
    // an Offer, see offer.service.js#syncBogoProductDealTypes), not this
    // form. Submitting it here would silently overwrite that on every edit.

    images,

    video: values.video?.trim() ?? "",
  };
}

/**
 * ==========================================
 * Create Payload
 * ==========================================
 *
 * New products enter the marketplace workflow at "draft" — they move
 * through pending_review -> approved -> published via the separate
 * status action, not automatically on creation.
 */

export function createProductPayload(
  values: ProductFormValues,
  images: ProductImage[],
): CreateProductRequest {
  return {
    ...buildCommonPayload(values, images),

    status: "draft",
  };
}

/**
 * ==========================================
 * Update Payload
 * ==========================================
 */

export function updateProductPayload(
  values: ProductFormValues,
  images: ProductImage[],
): UpdateProductRequest {
  return buildCommonPayload(values, images);
}
