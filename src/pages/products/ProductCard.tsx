import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
}

export function ProductCard({ product, onDelete, onView }: ProductCardProps) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {product.featured && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}

            {product.trending && (
              <Badge className="bg-secondary text-secondary-foreground">
                Trending
              </Badge>
            )}
          </div>

          <div className="absolute left-2 top-2">
            <Badge className="bg-destructive text-destructive-foreground">
              -{product.discount}%
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

                <DropdownMenuItem asChild>
                  <Link to={`/products/${product.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => onDelete(product.id)}
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
                {formatCurrency(product.discountPrice)}
              </div>

              <div className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.sellingPrice)}
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              Stock
              <br />
              <span className="font-medium text-foreground">
                {product.stock}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
