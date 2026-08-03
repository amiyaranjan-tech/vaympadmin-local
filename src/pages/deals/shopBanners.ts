import type { OfferShopBanner } from "@/types/offer";

// Shared by every offer form's "Shop Page Banners" section (BogoOfferForm,
// SpendThresholdOfferForm, TieredDealsForm) — up to 5 optional slots,
// array order IS display priority (slot 1 shows first). Always rendered
// as 5 fixed rows regardless of how many are actually filled in.
export const SHOP_BANNER_SLOTS = 5;
export const EMPTY_SHOP_BANNER: OfferShopBanner = { url: "", publicId: "", caption: "" };

export const padShopBanners = (banners: OfferShopBanner[] = []): OfferShopBanner[] =>
  Array.from({ length: SHOP_BANNER_SLOTS }, (_, i) => banners[i] ?? EMPTY_SHOP_BANNER);
