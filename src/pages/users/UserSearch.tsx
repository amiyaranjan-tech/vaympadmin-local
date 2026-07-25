import { Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { FilterSelect } from "../products/FilterSelect";

import { UserSearchProps } from "./types";

export function UserSearch({
  search,
  onSearchChange,

  status,
  onStatusChange,

  isVerified,
  onVerifiedChange,
}: UserSearchProps) {
  return (
    <Card className="rounded-2xl p-5 shadow-soft">
      <div className="rounded-xl border bg-muted/20 p-5">
        <div className="mb-5">
          <h3 className="text-base font-semibold">Filters</h3>

          <p className="text-sm text-muted-foreground">
            Search and filter users.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Search */}
          <div className="col-span-12 lg:col-span-7">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Search
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Name, Email, Phone..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Status */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <FilterSelect
              label="Status"
              placeholder="Status"
              value={status}
              onChange={onStatusChange}
              options={["active", "suspended", "banned"]}
              allLabel="All Status"
            />
          </div>

          {/* Verified */}
          <div className="col-span-12 md:col-span-6 lg:col-span-2">
            <FilterSelect
              label="Verified"
              placeholder="Verified"
              value={isVerified}
              onChange={onVerifiedChange}
              options={["yes", "no"]}
              allLabel="All"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
