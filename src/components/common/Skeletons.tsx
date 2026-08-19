import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ==========================================
 * Loading skeletons
 * ==========================================
 * A small, reusable set covering the three content shapes repeated across
 * the admin's list/dashboard pages — a card grid (Products, Banners,
 * Deals, Sellers), a data table (Users, Shop Status), and a stat tile row
 * (Dashboard, Shop Status, Analytics). Pages compose these instead of a
 * blanket full-page spinner, so headers/filters/table columns stay visible
 * immediately and only the actual data area shows as loading.
 */

// One card-shaped placeholder — an image/thumb block plus a few text
// lines, close enough to every card-grid page's real layout (ProductCard,
// BannerCard, the Deals offer cards, Sellers' shop cards) without needing
// a bespoke skeleton per page.
export function CardSkeleton() {
  return (
    <Card className="space-y-3 rounded-2xl border-border/50 p-4 shadow-soft">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </Card>
  );
}

// `className` is the grid's own column classes (e.g.
// "grid gap-4 sm:grid-cols-2 md:grid-cols-3") — each page already varies
// these per its own layout, so it's passed through rather than hardcoded.
export function CardGridSkeleton({
  count = 6,
  className = "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Placeholder <tr> rows only — meant to sit inside a page's own real
// <table><thead> (already rendered with its real column labels) so the
// columns don't shift once real rows replace these.
export function TableRowSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-border/60">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Matches StatCard's own layout (label + value + icon chip) so a stat row
// doesn't jump in size once real numbers land.
export function StatCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-14" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </Card>
  );
}

export function StatCardRowSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// A compact picker-list row (thumb + 2 text lines) — e.g. ShopProductSelector's
// in-form product picker, where a full CardSkeleton/TableRowSkeleton would
// be oversized for the row's own actual height.
export function PickerRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// A cover-photo + avatar profile header (Seller Details' own layout) —
// used while the detail record itself is still loading, before there's
// any real name/badges/tabs to show.
export function ProfileHeaderSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
      <Skeleton className="h-36 w-full rounded-none" />

      <div className="flex flex-wrap items-end gap-4 p-6">
        <Skeleton className="-mt-14 h-20 w-20 shrink-0 rounded-2xl border-4 border-card" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </Card>
  );
}
