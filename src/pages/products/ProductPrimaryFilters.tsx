import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { FilterSelect } from "./FilterSelect";

import { CATEGORIES_LIST, sellers, SUBCATEGORIES_LIST } from "@/data/mock";

interface ProductPrimaryFiltersProps {
  search: string;
  category: string;
  subcategory: string;
  sellerId: string;

  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSellerChange: (value: string) => void;
}

export function ProductPrimaryFilters({
  search,
  category,
  subcategory,
  sellerId,
  onSearchChange,
  onCategoryChange,
  onSubcategoryChange,
  onSellerChange,
}: ProductPrimaryFiltersProps) {
  const subcategories =
    category === "all"
      ? Object.values(SUBCATEGORIES_LIST).flat()
      : SUBCATEGORIES_LIST[category as keyof typeof SUBCATEGORIES_LIST];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {/* Search */}
      <div className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">
          Search
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, brand, category..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <FilterSelect
        label="Category"
        placeholder="Select Category"
        value={category}
        onChange={onCategoryChange}
        options={CATEGORIES_LIST}
        allLabel="All Categories"
      />

      {/* Subcategory */}
      <FilterSelect
        label="Subcategory"
        placeholder="Select Subcategory"
        value={subcategory}
        onChange={onSubcategoryChange}
        options={subcategories}
        allLabel="All Subcategories"
      />

      {/* Seller */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Seller
        </label>

        <select
          value={sellerId}
          onChange={(e) => onSellerChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Sellers</option>

          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.shopName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
