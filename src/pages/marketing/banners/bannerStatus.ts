import type { BannerStatus, EffectiveStatus } from "@/types/banner";

// Mirrors the backend's Banner.computeEffectiveStatus — this only
// decides display text/color; the backend remains the source of truth
// for what `effectiveStatus` actually is on a given banner.
export const STATUS_LABELS: Record<BannerStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
  inactive: "Inactive",
};

export const EFFECTIVE_STATUS_LABELS: Record<EffectiveStatus, string> = {
  ...STATUS_LABELS,
  scheduled: "Scheduled",
  expired: "Expired",
};

export const EFFECTIVE_STATUS_BADGE_VARIANT: Record<
  EffectiveStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  published: "default",
  hidden: "outline",
  inactive: "outline",
  scheduled: "secondary",
  expired: "destructive",
};
