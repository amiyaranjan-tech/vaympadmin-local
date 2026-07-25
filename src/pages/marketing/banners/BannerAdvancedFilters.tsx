import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FilterSelect } from "./FilterSelect";
import { STATUS_LABELS } from "./bannerStatus";

interface BannerAdvancedFiltersProps {
  status: string;
  activeFilter: string;
  sort: string;

  onStatusChange: (value: string) => void;
  onActiveFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ACTIVE_FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
];

const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "createdAt", label: "Newest" },
  { value: "views", label: "Most Viewed" },
  { value: "clicks", label: "Most Clicked" },
  { value: "startDate", label: "Start Date" },
  { value: "endDate", label: "End Date" },
];

export function BannerAdvancedFilters({
  status,
  activeFilter,
  sort,
  onStatusChange,
  onActiveFilterChange,
  onSortChange,
}: BannerAdvancedFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Status */}
      <FilterSelect
        label="Status"
        placeholder="Select Status"
        value={status}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        allLabel="All Statuses"
      />

      {/* Active / Scheduled / Expired — computed, independent of stored status */}
      <FilterSelect
        label="Schedule"
        placeholder="Select Schedule"
        value={activeFilter}
        onChange={onActiveFilterChange}
        options={ACTIVE_FILTER_OPTIONS}
        allLabel="Any Schedule"
      />

      {/* Sort */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Sort By
        </label>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
