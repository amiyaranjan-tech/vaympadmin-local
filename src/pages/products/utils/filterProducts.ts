import { Product } from "../types";

export interface ProductFilterOptions {
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
  now: Date;
}

export function filterProducts(
  products: Product[],
  filters: ProductFilterOptions,
): Product[] {
  const {
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
  } = filters;

  return products.filter((product) => {
    const searchText = [
      product.id,
      product.name,
      product.brand,
      product.category,
      "subcategory" in product ? product.subcategory : "",
    ]
      .join(" ")
      .toLowerCase();

    const createdDate = new Date(product.createdAt);

    const daysSinceCreated = (now.getTime() - createdDate.getTime()) / 86400000;

    // Product ID
    if (
      productId &&
      !product.id.toLowerCase().includes(productId.toLowerCase())
    ) {
      return false;
    }

    // Search
    if (search && !searchText.includes(search.toLowerCase())) {
      return false;
    }

    // Category
    if (category !== "all" && product.category !== category) {
      return false;
    }

    // Subcategory
    if (
      subcategory !== "all" &&
      "subcategory" in product &&
      product.subcategory !== subcategory
    ) {
      return false;
    }

    // Seller
    if (sellerId !== "all" && product.sellerId !== sellerId) {
      return false;
    }

    // Brand
    if (brand !== "all" && product.brand !== brand) {
      return false;
    }

    // Size
    if (size !== "all" && !product.sizes.some((item) => item.size === size)) {
      return false;
    }

    // Gender
    if (gender !== "all" && product.gender !== gender) {
      return false;
    }

    // Color
    if (color !== "all" && product.color !== color) {
      return false;
    }

    // Material
    if (material !== "all" && product.material !== material) {
      return false;
    }

    // New Arrival
    if (newArrival === "yes" && !product.newArrival) {
      return false;
    }

    if (newArrival === "no" && product.newArrival) {
      return false;
    }

    // Discount
    if (discount !== "all" && product.discount < Number(discount)) {
      return false;
    }

    // Price Range
    if (minPrice && product.discountPrice < Number(minPrice)) {
      return false;
    }

    if (maxPrice && product.discountPrice > Number(maxPrice)) {
      return false;
    }

    // Stock Status
    switch (stockStatus) {
      case "in-stock":
        if (product.stock <= 0) {
          return false;
        }
        break;

      case "low-stock":
        if (product.stock <= 0 || product.stock > 20) {
          return false;
        }
        break;

      case "out-of-stock":
        if (product.stock > 0) {
          return false;
        }
        break;
    }

    // Date Added
    switch (dateAdded) {
      case "today":
        if (daysSinceCreated > 1) {
          return false;
        }
        break;

      case "7-days":
        if (daysSinceCreated > 7) {
          return false;
        }
        break;

      case "30-days":
        if (daysSinceCreated > 30) {
          return false;
        }
        break;

      case "3-months":
        if (daysSinceCreated > 90) {
          return false;
        }
        break;

      case "1-year":
        if (daysSinceCreated > 365) {
          return false;
        }
        break;
    }

    return true;
  });
}
