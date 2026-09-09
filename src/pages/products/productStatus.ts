import type { ProductStatus } from "@/types/product";

// A narrower subset of the backend's constants/productStatus.js transition
// table — admin only ever takes one of three actions on a product: Reject,
// Approve & Publish (merged into one action — see ProductApprovals.tsx's
// handleApproveAndPublish, which issues the pending_review->approved->
// published calls back to back), or Hide (and its natural inverse,
// Unhide). Draft/archived and any other manual transition are seller- or
// system-only and deliberately not offered here. "approved" is kept as a
// dropdown target purely as a safety net for any product a pre-this-change
// admin action left sitting in that now-transient state.
//
// pending_review has no dropdown target at all: the backend requires a
// rejectionReason with the rejected transition, which this generic
// single-value dropdown can't collect — Reject is only reachable via
// ProductApprovals.tsx's dedicated button + reason dialog.
export const STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  draft: [],
  pending_review: [],
  approved: ["published"],
  published: ["hidden"],
  hidden: ["published"],
  archived: [],
  rejected: [],
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
