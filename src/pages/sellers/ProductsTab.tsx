// src/pages/sellers/ProductsTab.tsx

import { Link } from "react-router-dom";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import { EmptyState } from "@/components/common/EmptyState";

import { formatCurrency } from "@/utils/format";

import type { ProductsTabProps } from "./SellerTabs.types";

const PLACEHOLDER_IMAGE = "https://placehold.co/200x200?text=Product";

export default function ProductsTab({
  shopProducts,
  onDelete,
}: ProductsTabProps) {
  return (
    <TabsContent value="products" className="mt-4">
      {shopProducts.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button asChild className="rounded-xl">
            <Link to="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      )}

      {shopProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="This seller hasn't listed any products. Add the first one to get their shop started."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopProducts.map((product) => (
            <Card
              key={product._id}
              className="flex gap-3 rounded-2xl p-3 shadow-soft"
            >
              <img
                src={product.images?.[0]?.url ?? PLACEHOLDER_IMAGE}
                alt={product.name}
                className="h-16 w-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <div className="text-sm font-medium">{product.name}</div>

                <div className="text-xs text-muted-foreground">
                  {formatCurrency(product.finalPrice)} · Stock{" "}
                  {product.totalStock}
                </div>

                <div className="mt-2 flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-lg text-xs"
                  >
                    <Link to={`/products/${product._id}/edit`}>
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 rounded-lg text-xs text-destructive"
                    onClick={() => onDelete("Product")}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </TabsContent>
  );
}
