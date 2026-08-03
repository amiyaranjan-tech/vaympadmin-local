import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { formatCurrency } from "@/utils/format";

import type { Product } from "@/types/product";

interface ProductQuickViewDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Caller already knows which shop this product belongs to (it's the
  // shop the surrounding form is targeting) — cheaper than a second
  // seller lookup just to show a name here.
  shopName?: string;
}

/**
 * Generic, reusable product quick-view — a right-side drawer showing just
 * enough to sanity-check a product while configuring a deal, without
 * navigating away from the form. Deliberately lighter than
 * pages/products/ProductDetailsSheet.tsx (no status-transition controls,
 * no attributes/variants/tags breakdown) — that one is product-management-
 * specific; this one is meant for any screen that just needs a peek.
 */
export function ProductQuickViewDrawer({
  product,
  open,
  onOpenChange,
  shopName,
}: ProductQuickViewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{product?.name ?? "Product"}</SheetTitle>
          <SheetDescription>Product details</SheetDescription>
        </SheetHeader>

        {product && (
          <div className="mt-6 space-y-5">
            <img
              src={product.images[0]?.url}
              alt={product.name}
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{product.status}</Badge>
              {product.dealType !== "none" && <Badge>{product.dealType}</Badge>}
              {product.isMassiveDeal && (
                <Badge className="bg-rose-600 text-white">Massive Deal</Badge>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{formatCurrency(product.finalPrice)}</span>
              {product.sellingPrice > product.finalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.sellingPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-sm font-medium text-emerald-600">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Shop" value={shopName ?? "—"} />
              <Info label="Brand" value={product.brand} />
              <Info label="Gender" value={product.gender} />
              <Info label="Category" value={product.category} />
              <Info label="Subcategory" value={product.subcategory} />
              <Info label="Stock" value={product.totalStock} />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}
