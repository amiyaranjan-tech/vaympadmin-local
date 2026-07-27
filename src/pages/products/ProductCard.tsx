import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatCurrency } from "@/utils/format";
import { Product } from "./types";
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from "./productStatus";
import { DEAL_TYPE_LABELS } from "./productMeta";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
  onApprove?: (id: string) => void;
}

export function ProductCard({ product, onDelete, onView, onApprove }: ProductCardProps) {
  const canApprove = product.status === "pending_review";

  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}

            {product.isTrending && (
              <Badge className="bg-secondary text-secondary-foreground">
                Trending
              </Badge>
            )}

            {product.tryAndBuy && (
              <Badge className="bg-emerald-600 text-white">Try & Buy</Badge>
            )}

            {product.dealType && product.dealType !== "none" && (
              <Badge className="bg-amber-500 text-white">
                {DEAL_TYPE_LABELS[product.dealType]}
              </Badge>
            )}
          </div>

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.discountPercent > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{product.discountPercent}%
              </Badge>
            )}

            <Badge variant={STATUS_BADGE_VARIANT[product.status]}>
              {STATUS_LABELS[product.status]}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{product.name}</div>

              <div className="truncate text-xs text-muted-foreground">
                {product.brand} · {product.category}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onView(product)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>

                {canApprove && onApprove && (
                  <DropdownMenuItem onSelect={() => onApprove(product._id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to={`/products/${product._id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => onDelete(product._id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">
                {formatCurrency(product.finalPrice)}
              </div>

              <div className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.sellingPrice)}
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              Stock
              <br />
              <span className="font-medium text-foreground">
                {product.totalStock}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
