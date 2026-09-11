// src/pages/riders/rider.status.ts

import { Ban, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";

import type { Rider, RiderStatus } from "@/types/rider";

/**
 * ==========================================
 * Status Badge Metadata
 * ==========================================
 */

export const RIDER_STATUS_META: Record<
  RiderStatus,
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
    label: "Blocked",
    badgeClass: "border-transparent bg-suspended/20 text-suspended-foreground",
  },
  inactive: {
    label: "Inactive",
    badgeClass: "border-transparent bg-muted text-muted-foreground",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "border-transparent bg-muted text-muted-foreground",
  },
};

/**
 * ==========================================
 * Status -> Available Quick Actions
 * ==========================================
 * Single source of truth for which lifecycle actions are legal for a
 * rider in a given status — mirrors the backend's transition rules
 * (constants/riderStatus.js) so the UI never offers an action the API
 * would reject.
 */

export type RiderAction = "verify" | "reject" | "block" | "unblock" | "delete";

const DELETABLE_STATUSES: RiderStatus[] = [
  "pending",
  "suspended",
  "inactive",
  "rejected",
];

export function getRiderActions(rider: Pick<Rider, "status">): RiderAction[] {
  const actions: RiderAction[] = [];

  if (rider.status === "pending") {
    actions.push("verify", "reject");
  }

  if (rider.status === "active") {
    actions.push("block");
  }

  if (rider.status === "suspended" || rider.status === "inactive") {
    actions.push("unblock");
  }

  if (DELETABLE_STATUSES.includes(rider.status)) {
    actions.push("delete");
  }

  return actions;
}

/**
 * ==========================================
 * Action Menu Copy
 * ==========================================
 */

export const RIDER_ACTION_META: Record<
  RiderAction,
  {
    label: string;
    icon: typeof ShieldCheck;
    confirm: string;
    destructive?: boolean;
  }
> = {
  verify: {
    label: "Verify Rider",
    icon: ShieldCheck,
    confirm: "Verify this rider? This activates their account so they can go online and accept orders.",
  },
  reject: {
    label: "Reject Rider",
    icon: X,
    confirm: "",
  },
  block: {
    label: "Block Rider",
    icon: Ban,
    confirm: "Block this rider? They'll be signed out of dispatch and can't accept new orders until unblocked.",
    destructive: true,
  },
  unblock: {
    label: "Unblock Rider",
    icon: RotateCcw,
    confirm: "Unblock this rider? Their account becomes active again.",
  },
  delete: {
    label: "Delete Rider",
    icon: Trash2,
    confirm: "Delete this rider? This can't be undone from the admin panel.",
    destructive: true,
  },
};
