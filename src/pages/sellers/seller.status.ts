// src/pages/sellers/seller.status.ts

import { PowerOff, RotateCcw, ShieldCheck, ShieldOff } from "lucide-react";

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

export type SellerAction = "verify" | "unverify" | "deactivate" | "reactivate";

export const SELLER_STATUS_ACTIONS: Record<SellerStatus, SellerAction[]> = {
  pending: ["verify"],
  active: ["deactivate"],
  suspended: ["reactivate"],
  inactive: ["reactivate"],
};

/**
 * ==========================================
 * Status + Verification -> Available Quick Actions
 * ==========================================
 *
 * verify/unverify are gated on `isVerified`, not `status` — the backend
 * (services/seller.service.js#updateVerification) allows verifying from
 * "pending" (first approval, also activates) or "active" (re-verifying a
 * seller the admin previously unverified), and allows unverifying
 * whenever isVerified is currently true, regardless of status. Layers
 * that on top of SELLER_STATUS_ACTIONS rather than duplicating "verify"/
 * "unverify" into every status's static list above.
 */

export function getSellerActions(seller: {
  status: SellerStatus;
  isVerified: boolean;
}): SellerAction[] {
  const actions = [...SELLER_STATUS_ACTIONS[seller.status]];

  if (seller.isVerified) {
    if (!actions.includes("unverify")) {
      actions.push("unverify");
    }
  } else if (
    (seller.status === "pending" || seller.status === "active") &&
    !actions.includes("verify")
  ) {
    actions.push("verify");
  }

  return actions;
}

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
      "Verify this seller? This marks their shop as verified (and activates it, if it isn't already).",
  },
  unverify: {
    label: "Unverify Seller",
    icon: ShieldOff,
    confirm:
      "Remove this seller's verified badge? They won't be able to add or edit products until re-verified. This doesn't change their shop status — use Deactivate to make the shop unusable for a while.",
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
};
