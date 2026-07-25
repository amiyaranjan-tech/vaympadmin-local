import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { formatCurrency } from "@/utils/format";
import useSellers from "@/hooks/useSellers";
import type { ProductStatus } from "@/types/product";
import { Product } from "./types";
import { STATUS_BADGE_VARIANT, STATUS_LABELS, STATUS_TRANSITIONS } from "./productStatus";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onStatusChange?: (id: string, status: ProductStatus) => void;
}

export function ProductDetailsSheet({ open, onOpenChange, product, onStatusChange }: Props) {
  const { sellers } = useSellers({ limit: 100 });

  if (!product) return null;

  const shopName =
    sellers.find((seller) => seller._id === product.seller)?.shopName ??
    "Unassigned";

  const nextStatuses = STATUS_TRANSITIONS[product.status] ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>

          <SheetDescription className="flex flex-wrap items-center gap-2">
            Product Details
            <Badge
              variant="secondary"
              className="font-mono text-xs tracking-wide"
            >
              {product._id}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="aspect-[4/5] w-full rounded-xl object-cover"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_BADGE_VARIANT[product.status]}>
              {STATUS_LABELS[product.status]}
            </Badge>

            {onStatusChange && nextStatuses.length > 0 && (
              <Select
                value=""
                onValueChange={(value) => onStatusChange(product._id, value as ProductStatus)}
              >
                <SelectTrigger className="h-8 w-auto min-w-[10rem] text-xs">
                  <SelectValue placeholder="Move to..." />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {product.isFeatured && <Badge>Featured</Badge>}
            {product.isTrending && <Badge>Trending</Badge>}
            {product.isNewArrival && <Badge>New Arrival</Badge>}
            {product.isLimitedStock && (
              <Badge variant="destructive">Limited Stock</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Product ID" value={product._id} />
            <Info label="Shop" value={shopName} />

            <Info label="Brand" value={product.brand} />
            <Info label="Category" value={product.category} />
            <Info label="Group" value={product.group} />
            <Info label="Subcategory" value={product.subcategory} />
            <Info label="Collection" value={product.productCollection || "—"} />
            <Info label="Gender" value={product.gender} />

            <Info label="Material" value={product.attributes.material ?? "—"} />
            <Info label="Color" value={product.color} />

            <Info label="Season" value={product.season} />
            <Info label="Pattern" value={product.attributes.pattern ?? "—"} />

            <Info label="Occasion" value={product.attributes.occasion ?? "—"} />
            <Info label="Stock" value={product.totalStock} />

            <Info label="Discount" value={`${product.discountPercent}%`} />

            <Info
              label="Selling Price"
              value={formatCurrency(product.sellingPrice)}
            />

            <Info
              label="Final Price"
              value={formatCurrency(product.finalPrice)}
            />
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Description</h4>

            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Attributes</h4>

            <div className="flex flex-wrap gap-2">
              {Object.entries(product.attributes).map(([key, value]) => (
                <Badge key={key} variant="secondary">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Variants</h4>

            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, i) => (
                <Badge key={i} variant="secondary">
                  {variant.size}
                  {variant.color ? ` / ${variant.color}` : ""} ({variant.stock})
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Tags</h4>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface InfoProps {
  label: string;
  value: string | number;
}

function Info({ label, value }: InfoProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      <div className="font-medium break-words">{value}</div>
    </div>
  );
}
