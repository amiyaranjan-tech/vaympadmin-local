import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BannerPrimaryFilters } from "./BannerPrimaryFilters";
import { BannerAdvancedFilters } from "./BannerAdvancedFilters";

interface BannerFiltersProps {
  search: string;
  position: string;
  type: string;
  status: string;
  activeFilter: string;
  sort: string;

  onSearchChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onActiveFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function BannerFilters({
  search,
  position,
  type,
  status,
  activeFilter,
  sort,
  onSearchChange,
  onPositionChange,
  onTypeChange,
  onStatusChange,
  onActiveFilterChange,
  onSortChange,
}: BannerFiltersProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-5">
      {/* Basic Filters */}
      <div className="space-y-4 rounded-xl border bg-background p-4">
        <div>
          <h3 className="text-sm font-semibold">Basic Filters</h3>
          <p className="text-xs text-muted-foreground">
            Search and quickly narrow down banners.
          </p>
        </div>

        <BannerPrimaryFilters
          search={search}
          position={position}
          type={type}
          onSearchChange={onSearchChange}
          onPositionChange={onPositionChange}
          onTypeChange={onTypeChange}
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
              Filter banners by status, schedule and sort order.
            </p>
          </div>

          <BannerAdvancedFilters
            status={status}
            activeFilter={activeFilter}
            sort={sort}
            onStatusChange={onStatusChange}
            onActiveFilterChange={onActiveFilterChange}
            onSortChange={onSortChange}
          />
        </div>
      )}
    </div>
  );
}
