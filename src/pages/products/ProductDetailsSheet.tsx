import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { formatCurrency } from "@/utils/format";
import { Product } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailsSheet({ open, onOpenChange, product }: Props) {
  if (!product) return null;

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
              {product.id}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <img
            src={product.images[0]}
            alt={product.name}
            className="aspect-[4/5] w-full rounded-xl object-cover"
          />

          <div className="flex flex-wrap gap-2">
            {product.featured && <Badge>Featured</Badge>}

            {product.trending && <Badge>Trending</Badge>}

            {product.newArrival && <Badge>New Arrival</Badge>}

            {product.limitedStock && (
              <Badge variant="destructive">Limited Stock</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Product ID" value={product.id} />
            <Info label="Brand" value={product.brand} />

            <Info label="Category" value={product.category} />
            <Info label="Gender" value={product.gender} />

            <Info label="Material" value={product.material} />
            <Info label="Color" value={product.color} />

            <Info label="Season" value={product.season} />
            <Info label="Pattern" value={product.pattern} />

            <Info label="Occasion" value={product.occasion} />
            <Info label="Stock" value={product.stock} />

            <Info label="Sold" value={product.sold} />
            <Info label="Discount" value={`${product.discount}%`} />

            <Info
              label="Selling Price"
              value={formatCurrency(product.sellingPrice)}
            />

            <Info
              label="Discount Price"
              value={formatCurrency(product.discountPrice)}
            />
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Description</h4>

            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Available Sizes</h4>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Badge key={size.size} variant="secondary">
                  {size.size} ({size.quantity})
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
