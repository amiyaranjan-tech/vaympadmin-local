import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { FilterSelect } from "./FilterSelect";
import { BANNER_TYPES, BANNER_TYPE_LABELS, POSITIONS, POSITION_LABELS } from "./bannerMeta";

interface BannerPrimaryFiltersProps {
  search: string;
  position: string;
  type: string;

  onSearchChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const POSITION_OPTIONS = POSITIONS.map((value) => ({
  value,
  label: POSITION_LABELS[value],
}));

const TYPE_OPTIONS = BANNER_TYPES.map((value) => ({
  value,
  label: BANNER_TYPE_LABELS[value],
}));

export function BannerPrimaryFilters({
  search,
  position,
  type,
  onSearchChange,
  onPositionChange,
  onTypeChange,
}: BannerPrimaryFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            placeholder="Search by name, offer text, tags..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Position */}
      <FilterSelect
        label="Position"
        placeholder="Select Position"
        value={position}
        onChange={onPositionChange}
        options={POSITION_OPTIONS}
        allLabel="All Positions"
      />

      {/* Type */}
      <FilterSelect
        label="Type"
        placeholder="Select Type"
        value={type}
        onChange={onTypeChange}
        options={TYPE_OPTIONS}
        allLabel="All Types"
      />
    </div>
  );
}
