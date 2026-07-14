import { useMemo } from "react";

import { Product } from "../types";
import { filterProducts, ProductFilterOptions } from "../utils/filterProducts";

interface UseProductFiltersParams extends Omit<ProductFilterOptions, "now"> {
  products: Product[];
}

export function useProductFilters({
  products,
  productId,
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
}: UseProductFiltersParams) {
  const now = useMemo(() => new Date(), []);

  return useMemo(
    () =>
      filterProducts(products, {
        productId,
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
        now,
      }),
    [
      products,
      productId,
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
      now,
    ],
  );
}
