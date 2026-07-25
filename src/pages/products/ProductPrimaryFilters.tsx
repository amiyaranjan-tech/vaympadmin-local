import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterSelect } from "./FilterSelect";

import useDropdownOptions from "@/hooks/useDropdownOptions";
import useSellers from "@/hooks/useSellers";

interface ProductPrimaryFiltersProps {
  search: string;
  category: string;
  group: string;
  subcategory: string;
  sellerId: string;

  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSellerChange: (value: string) => void;
}

export function ProductPrimaryFilters({
  search,
  category,
  group,
  subcategory,
  sellerId,
  onSearchChange,
  onCategoryChange,
  onGroupChange,
  onSubcategoryChange,
  onSellerChange,
}: ProductPrimaryFiltersProps) {
  const { options } = useDropdownOptions();

  const groups =
    category === "all"
      ? Object.values(options.groupsByCategory).flat()
      : (options.groupsByCategory[category] ?? []);

  const subcategories =
    group === "all"
      ? Object.values(options.subcategoriesByGroup).flat()
      : (options.subcategoriesByGroup[`${category}::${group}`] ?? []);

  const { sellers } = useSellers({ limit: 100 });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
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
        options={options.categories}
        allLabel="All Categories"
      />

      {/* Group */}
      <FilterSelect
        label="Group"
        placeholder="Select Group"
        value={group}
        onChange={onGroupChange}
        options={groups}
        allLabel="All Groups"
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

        <Select value={sellerId} onValueChange={onSellerChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Sellers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sellers</SelectItem>

            {sellers.map((seller) => (
              <SelectItem key={seller._id} value={seller._id}>
                {seller.shopName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
