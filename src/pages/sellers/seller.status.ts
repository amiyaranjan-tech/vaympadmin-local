// src/pages/sellers/seller.status.ts

import { Archive, Ban, PowerOff, RotateCcw, ShieldCheck } from "lucide-react";

import type { SellerStatus } from "@/types/seller";

/**
 * ==========================================
 * Status Badge Metadata
 * ==========================================
 */

export const SELLER_STATUS_META: Record<
  SellerStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "border-transparent bg-warning/20 text-warning-foreground",
  },
  active: {
    label: "Active",
    badgeClass: "border-transparent bg-success/15 text-success-foreground",
  },
  suspended: {
    label: "Suspended",
    badgeClass: "border-transparent bg-suspended/20 text-suspended-foreground",
  },
  inactive: {
    label: "Inactive",
    badgeClass: "border-transparent bg-muted text-muted-foreground",
  },
};

/**
 * ==========================================
 * Status -> Available Quick Actions
 * ==========================================
 *
 * Single source of truth for which lifecycle actions are legal for a
 * seller in a given status — mirrors the backend's transition rules
 * (constants/sellerStatus.js) so the UI never offers an action the API
 * would reject.
 */

export type SellerAction =
  | "verify"
  | "suspend"
  | "deactivate"
  | "reactivate"
  | "archive";

export const SELLER_STATUS_ACTIONS: Record<SellerStatus, SellerAction[]> = {
  pending: ["verify", "archive"],
  active: ["suspend", "deactivate"],
  suspended: ["reactivate", "archive"],
  inactive: ["reactivate", "archive"],
};

/**
 * ==========================================
 * Action Menu Copy
 * ==========================================
 *
 * Shared between the Sellers list dropdown and the Seller Details page
 * action buttons so label/icon/confirmation text never drift apart.
 */

export const SELLER_ACTION_META: Record<
  SellerAction,
  {
    label: string;
    icon: typeof ShieldCheck;
    confirm: string;
    destructive?: boolean;
  }
> = {
  verify: {
    label: "Verify Seller",
    icon: ShieldCheck,
    confirm:
      "Verify this seller? This will mark them verified and activate their shop immediately.",
  },
  suspend: {
    label: "Suspend",
    icon: Ban,
    confirm: "Suspend this seller? Their shop will stop being usable until reactivated.",
  },
  deactivate: {
    label: "Deactivate",
    icon: PowerOff,
    confirm: "Deactivate this seller? Their shop will stop being usable until reactivated.",
  },
  reactivate: {
    label: "Reactivate",
    icon: RotateCcw,
    confirm: "Reactivate this seller? Their shop will become usable again.",
  },
  archive: {
    label: "Archive Seller",
    icon: Archive,
    confirm:
      "Archive this seller? They'll be hidden from the marketplace. This can be reversed later, no data is permanently deleted.",
    destructive: true,
  },
};
