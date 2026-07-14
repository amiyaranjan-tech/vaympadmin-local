import { Input } from "@/components/ui/input";
import { FilterSelect } from "./FilterSelect";

import {
  BRANDS_LIST,
  COLORS_LIST,
  DATE_FILTER_LIST,
  DISCOUNT_FILTER_LIST,
  GENDERS_LIST,
  MATERIALS_LIST,
  SIZES_LIST,
  STOCK_STATUS_LIST,
} from "@/data/mock";

interface ProductAdvancedFiltersProps {
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

export function ProductAdvancedFilters({
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
}: ProductAdvancedFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <FilterSelect
        label="Brand"
        placeholder="Select Brand"
        value={brand}
        onChange={onBrandChange}
        options={BRANDS_LIST}
        allLabel="All Brands"
      />

      <FilterSelect
        label="Size"
        placeholder="Select Size"
        value={size}
        onChange={onSizeChange}
        options={SIZES_LIST}
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
        label="Color"
        placeholder="Select Color"
        value={color}
        onChange={onColorChange}
        options={COLORS_LIST}
        allLabel="All Colors"
      />

      <FilterSelect
        label="Material"
        placeholder="Select Material"
        value={material}
        onChange={onMaterialChange}
        options={MATERIALS_LIST}
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

        <select
          value={discount}
          onChange={(e) => onDiscountChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Discounts</option>

          {DISCOUNT_FILTER_LIST.map((item) => (
            <option key={item} value={item}>
              {item}%+
            </option>
          ))}
        </select>
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
