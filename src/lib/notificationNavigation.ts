import type { AdminNotification } from "@/types/notification";

/**
 * ==========================================
 * Notification Navigation
 * ==========================================
 *
 * The backend's constants/notification.js TYPE_DEEPLINK is the only place
 * navigation metadata is decided — each AdminNotification's `data` carries
 * {type, screen, entityType, ...entityIds} merged in from that map (see
 * services/notification/templateEngine.js#resolve). This is the one place
 * that `screen` string gets interpreted into a real admin route: an
 * explicit allow-list, so an unrecognized/unexpected value from a
 * notification payload can never navigate somewhere unintended.
 */
function readString(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value ? value : null;
}

export function resolveNotificationRoute(notification: AdminNotification): string {
  const data = notification.data ?? {};
  const screen = readString(data, "screen");
  const type = readString(data, "type") ?? notification.type;

  switch (screen) {
    case "ProductDetails": {
      // A pending_review product has no useful destination on its own
      // edit page yet (it isn't published) — Reject/Approve & Publish
      // live on the Approvals queue instead. Low/out-of-stock alerts go
      // straight to the product's own edit page.
      if (type === "ADMIN_PRODUCT_REVIEW_REQUIRED") return "/products/approvals";
      const productId = readString(data, "productId");
      return productId ? `/products/${productId}/edit` : "/products";
    }
    case "SellerDetails": {
      const sellerId = readString(data, "sellerId");
      return sellerId ? `/sellers/${sellerId}` : "/sellers";
    }
    case "OrderDetails":
      // Orders isn't wired to real backend data yet (still src/data/mock)
      // — nothing to deep-link an id to, so just the list.
      return "/orders";
    case "ReturnDetails":
    case "RefundDetails":
      // Same as Orders — Refunds is still mock data too.
      return "/refunds";
    case "Support":
    case "Dashboard":
    default:
      return "/notifications";
  }
}
