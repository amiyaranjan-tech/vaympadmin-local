import type { Offer } from "@/types/offer";
import type { Product } from "./types";
import { formatCurrency } from "@/utils/format";

// Whether `offer` would actually apply right now — an admin's offer list
// includes disabled/expired/future ones too (they still need to manage
// them), but the product card's own badge should only ever reflect deals
// a shopper could actually get today.
export function isOfferActiveNow(offer: Offer): boolean {
  if (!offer.isEnabled) return false;

  const now = Date.now();
  return now >= new Date(offer.startDate).getTime() && now <= new Date(offer.endDate).getTime();
}

function offerSellerId(seller: Offer["seller"]): string | null {
  if (!seller) return null;
  return typeof seller === "string" ? seller : seller._id;
}

// Mirrors the consumer app's own eligibility rule (see backend
// deals.service.js#getOffers' product-level filter): "entire_shop" covers
// every product at that same seller, "selected_products" only the ones
// explicitly listed.
export function offerAppliesToProduct(offer: Offer, product: Product): boolean {
  if (!product.seller || offerSellerId(offer.seller) !== product.seller) return false;

  if (offer.scope === "entire_shop") return true;

  return offer.products.some((p) => (typeof p === "string" ? p : p._id) === product._id);
}

// Every currently-active offer this product qualifies for — the same set
// the Consumer app's own dealCount is built from (see storefront.service.js
// #attachActiveDealTypes), just computed client-side here since the admin
// product list endpoint doesn't attach it.
export function activeOffersForProduct(offers: Offer[], product: Product): Offer[] {
  return offers.filter((offer) => isOfferActiveNow(offer) && offerAppliesToProduct(offer, product));
}

// The exact mechanic, not just the offer type — "Buy 2 Get 2", "Spend
// ₹999 → ₹200 off", etc. Mirrors the Consumer app's own getDealTypeLabel/
// Deals.tsx's own offer-card copy so the same deal reads identically in
// both places.
export function offerMechanicLabel(offer: Offer): string {
  if (offer.type === "bogo") {
    return `Buy ${offer.buyQuantity} Get ${offer.getQuantity} Free`;
  }

  if (offer.type === "free_shipping") {
    return `Spend ${formatCurrency(offer.minSpend)} → Free Shipping`;
  }

  const reward =
    offer.type === "tier_amount"
      ? `${formatCurrency(offer.discountAmount)} off`
      : `${offer.discountPercent}% off`;

  return `Spend ${formatCurrency(offer.minSpend)} → ${reward}`;
}
