import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * ==========================================
 * Date Range Filter
 * ==========================================
 * Same Popover + Calendar(mode="range") combination Topbar.tsx already
 * has, extracted here so it can actually drive a page's data instead of
 * sitting decorative/unwired (Topbar's own `range` state was local and
 * never used anywhere else).
 */
export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <CalendarIcon className="h-4 w-4" />

          {value?.from
            ? `${value.from.toLocaleDateString()} – ${
                value.to?.toLocaleDateString() ?? "..."
              }`
            : "Date range"}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0">
        <Calendar mode="range" selected={value} onSelect={onChange} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  );
}
