import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Loader2, PackageSearch, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductQuickViewDrawer } from "@/components/products/ProductQuickViewDrawer";

import useProducts from "@/hooks/useProducts";
import { formatCurrency } from "@/utils/format";
import type { Product } from "@/types/product";

const SEARCH_DEBOUNCE_MS = 300;
// No infinite-scroll pagination — same precedent as
// components/deals/ProductMultiPicker.tsx (BOGO's picker): search narrows
// the list rather than loading pages. Bumped higher than that compact
// chip-picker's 20 since this renders full cards, still a bounded fetch,
// never the whole catalog.
const RESULT_LIMIT = 40;

interface ShopProductSelectorProps {
  sellerId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Rich, card-based product picker scoped to one shop — checkbox, image,
 * price/MRP/discount, category/subcategory, and a View button that opens
 * a quick-view drawer without toggling selection. Built for Spend/Tiered
 * targeting (qualifying products); intentionally NOT wired into BOGO's
 * picker (ProductMultiPicker) in this change — that stays untouched.
 */
export function ShopProductSelector({ sellerId, selectedIds, onChange }: ShopProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const { products, loading, error, fetchProducts } = useProducts({
    seller: sellerId,
    limit: RESULT_LIMIT,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchProducts({ seller: sellerId, search, limit: RESULT_LIMIT }, false);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sellerId]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allLoadedSelected = products.length > 0 && products.every((p) => selectedSet.has(p._id));

  const toggle = (id: string) => {
    onChange(selectedSet.has(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]);
  };

  const toggleAllLoaded = () => {
    if (allLoadedSelected) {
      const loadedIds = new Set(products.map((p) => p._id));
      onChange(selectedIds.filter((id) => !loadedIds.has(id)));
    } else {
      onChange([...new Set([...selectedIds, ...products.map((p) => p._id)])]);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description={search ? "Try a different search term." : "This shop has no products yet."}
        />
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={allLoadedSelected} onCheckedChange={toggleAllLoaded} />
            Select all loaded products
          </label>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <Checkbox
                  checked={selectedSet.has(product._id)}
                  onCheckedChange={() => toggle(product._id)}
                />

                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{product.name}</div>

                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold">{formatCurrency(product.finalPrice)}</span>
                    {product.sellingPrice > product.finalPrice && (
                      <span className="text-muted-foreground line-through">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    )}
                    {product.discountPercent > 0 && (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {product.discountPercent}% OFF
                      </Badge>
                    )}
                  </div>

                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {product.category} · {product.subcategory}
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="shrink-0 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewProduct(product);
                  }}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} product{selectedIds.length === 1 ? "" : "s"} selected
        </span>

        {selectedIds.length > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange([])}>
            Clear Selection
          </Button>
        )}
      </div>

      <ProductQuickViewDrawer
        product={viewProduct}
        open={!!viewProduct}
        onOpenChange={(open) => !open && setViewProduct(null)}
      />
    </div>
  );
}
