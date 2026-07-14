import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProductPrimaryFilters } from "./ProductPrimaryFilters";
import { ProductAdvancedFilters } from "./ProductAdvancedFilters";

interface ProductFiltersProps {
  productId: string;
  search: string;
  category: string;
  subcategory: string;
  sellerId: string;

  brand: string;
  size: string;
  gender: string;
  stockStatus: string;
  color: string;
  material: string;
  newArrival: string;
  discount: string;
  minPrice: string;
  maxPrice: string;
  dateAdded: string;

  onProductIdChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSellerChange: (value: string) => void;

  onBrandChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onMaterialChange: (value: string) => void;
  onNewArrivalChange: (value: string) => void;
  onDiscountChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onDateAddedChange: (value: string) => void;
}

export function ProductFilters({
  search,
  category,
  subcategory,
  sellerId,

  brand,
  size,
  gender,
  stockStatus,
  color,
  material,
  newArrival,
  discount,
  minPrice,
  maxPrice,
  dateAdded,

  onSearchChange,
  onCategoryChange,
  onSubcategoryChange,
  onSellerChange,

  onBrandChange,
  onSizeChange,
  onGenderChange,
  onStockStatusChange,
  onColorChange,
  onMaterialChange,
  onNewArrivalChange,
  onDiscountChange,
  onMinPriceChange,
  onMaxPriceChange,
  onDateAddedChange,
}: ProductFiltersProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-5">
      {/* Basic Filters */}
      <div className="space-y-4 rounded-xl border bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Basic Filters</h3>
            <p className="text-xs text-muted-foreground">
              Search and quickly narrow down products.
            </p>
          </div>
        </div>

        <ProductPrimaryFilters
          search={search}
          category={category}
          subcategory={subcategory}
          sellerId={sellerId}
          onSearchChange={onSearchChange}
          onCategoryChange={onCategoryChange}
          onSubcategoryChange={onSubcategoryChange}
          onSellerChange={onSellerChange}
        />
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowMore((prev) => !prev)}
        >
          {showMore ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Hide Advanced Filters
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show Advanced Filters
            </>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showMore && (
        <div className="space-y-4 rounded-xl border bg-background p-4">
          <div>
            <h3 className="text-sm font-semibold">Advanced Filters</h3>
            <p className="text-xs text-muted-foreground">
              Filter products by brand, stock, pricing, dates and other
              attributes.
            </p>
          </div>

          <ProductAdvancedFilters
            brand={brand}
            size={size}
            gender={gender}
            stockStatus={stockStatus}
            color={color}
            material={material}
            newArrival={newArrival}
            discount={discount}
            minPrice={minPrice}
            maxPrice={maxPrice}
            dateAdded={dateAdded}
            onBrandChange={onBrandChange}
            onSizeChange={onSizeChange}
            onGenderChange={onGenderChange}
            onStockStatusChange={onStockStatusChange}
            onColorChange={onColorChange}
            onMaterialChange={onMaterialChange}
            onNewArrivalChange={onNewArrivalChange}
            onDiscountChange={onDiscountChange}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
            onDateAddedChange={onDateAddedChange}
          />
        </div>
      )}
    </div>
  );
}
