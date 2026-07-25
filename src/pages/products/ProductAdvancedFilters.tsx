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

// Fixed backend enums — not part of the admin-editable taxonomy
// (DropdownOption), so kept as small local lists rather than fetched.
const GENDERS_LIST = ["men", "women", "unisex", "kids"];
const STOCK_STATUS_LIST = ["in-stock", "low-stock", "out-of-stock"];
const STATUS_LIST = [
  "draft",
  "pending_review",
  "approved",
  "published",
  "hidden",
  "archived",
  "rejected",
];
const DATE_FILTER_LIST = ["today", "7-days", "30-days", "3-months", "1-year"];
const DISCOUNT_FILTER_LIST = ["10", "20", "30", "50"];

interface ProductAdvancedFiltersProps {
  brand: string;
  size: string;
  gender: string;
  stockStatus: string;
  status: string;
  color: string;
  material: string;
  newArrival: string;
  discount: string;
  minPrice: string;
  maxPrice: string;
  dateAdded: string;

  onBrandChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onMaterialChange: (value: string) => void;
  onNewArrivalChange: (value: string) => void;
  onDiscountChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onDateAddedChange: (value: string) => void;
}

export function ProductAdvancedFilters({
  brand,
  size,
  gender,
  stockStatus,
  status,
  color,
  material,
  newArrival,
  discount,
  minPrice,
  maxPrice,
  dateAdded,
  onBrandChange,
  onSizeChange,
  onGenderChange,
  onStockStatusChange,
  onStatusChange,
  onColorChange,
  onMaterialChange,
  onNewArrivalChange,
  onDiscountChange,
  onMinPriceChange,
  onMaxPriceChange,
  onDateAddedChange,
}: ProductAdvancedFiltersProps) {
  const { options } = useDropdownOptions();

  const allSizes = Array.from(new Set(Object.values(options.sizesBySubcategory).flat()));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <FilterSelect
        label="Brand"
        placeholder="Select Brand"
        value={brand}
        onChange={onBrandChange}
        options={options.brands}
        allLabel="All Brands"
      />

      <FilterSelect
        label="Size"
        placeholder="Select Size"
        value={size}
        onChange={onSizeChange}
        options={allSizes}
        allLabel="All Sizes"
      />

      <FilterSelect
        label="Gender"
        placeholder="Select Gender"
        value={gender}
        onChange={onGenderChange}
        options={GENDERS_LIST}
        allLabel="All Genders"
      />

      <FilterSelect
        label="Stock Status"
        placeholder="Select Stock Status"
        value={stockStatus}
        onChange={onStockStatusChange}
        options={STOCK_STATUS_LIST}
        allLabel="All Stock Status"
      />

      <FilterSelect
        label="Status"
        placeholder="Select Status"
        value={status}
        onChange={onStatusChange}
        options={STATUS_LIST}
        allLabel="All Statuses"
      />

      <FilterSelect
        label="Color"
        placeholder="Select Color"
        value={color}
        onChange={onColorChange}
        options={options.colors}
        allLabel="All Colors"
      />

      <FilterSelect
        label="Material"
        placeholder="Select Material"
        value={material}
        onChange={onMaterialChange}
        options={options.materials}
        allLabel="All Materials"
      />

      <FilterSelect
        label="New Arrival"
        placeholder="Select Option"
        value={newArrival}
        onChange={onNewArrivalChange}
        options={["yes", "no"]}
        allLabel="All Products"
      />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Discount
        </label>

        <Select value={discount} onValueChange={onDiscountChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Discounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Discounts</SelectItem>

            {DISCOUNT_FILTER_LIST.map((item) => (
              <SelectItem key={item} value={item}>
                {item}%+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Min Price
        </label>

        <Input
          type="number"
          placeholder="₹0"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Max Price
        </label>

        <Input
          type="number"
          placeholder="₹10000"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
        />
      </div>

      <FilterSelect
        label="Date Added"
        placeholder="Select Date"
        value={dateAdded}
        onChange={onDateAddedChange}
        options={DATE_FILTER_LIST}
        allLabel="All Time"
      />
    </div>
  );
}
