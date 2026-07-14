import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FilterSelect } from "../products/FilterSelect";
import { CITIES_LIST } from "@/data/mock";

interface UserSearchProps {
  search: string;
  onSearchChange: (value: string) => void;

  userId: string;
  onUserIdChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  city: string;
  onCityChange: (value: string) => void;

  orders: string;
  onOrdersChange: (value: string) => void;

  minSpend: string;
  onMinSpendChange: (value: string) => void;

  maxSpend: string;
  onMaxSpendChange: (value: string) => void;

  joinedDate: string;
  onJoinedDateChange: (value: string) => void;

  wishlist: string;
  onWishlistChange: (value: string) => void;

  customerType: string;
  onCustomerTypeChange: (value: string) => void;
}

export function UserSearch({
  search,
  onSearchChange,

  userId,
  onUserIdChange,

  status,
  onStatusChange,

  city,
  onCityChange,

  orders,
  onOrdersChange,

  minSpend,
  onMinSpendChange,

  maxSpend,
  onMaxSpendChange,

  joinedDate,
  onJoinedDateChange,

  wishlist,
  onWishlistChange,

  customerType,
  onCustomerTypeChange,
}: UserSearchProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Card className="rounded-2xl p-5 shadow-soft space-y-5">
      {/* Basic Filters */}
      {/* Basic Filters */}
      <div className="rounded-xl border bg-muted/20 p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Basic Filters</h3>
            <p className="text-sm text-muted-foreground">
              Quickly search and filter users.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Search */}
          <div className="col-span-12 lg:col-span-5">
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

          {/* User ID */}
          <div className="col-span-12 md:col-span-6 lg:col-span-2">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              User ID
            </label>

            <Input
              value={userId}
              placeholder="USR001"
              onChange={(e) => onUserIdChange(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="col-span-12 md:col-span-6 lg:col-span-2">
            <FilterSelect
              label="Status"
              placeholder="Status"
              value={status}
              onChange={onStatusChange}
              options={["active", "blocked"]}
              allLabel="All Status"
            />
          </div>

          {/* City */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <FilterSelect
              label="City"
              placeholder="City"
              value={city}
              onChange={onCityChange}
              options={CITIES_LIST}
              allLabel="All Cities"
            />
          </div>
        </div>
      </div>

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

      {showMore && (
        <div className="space-y-4 border-t pt-5">
          <div>
            <h3 className="text-sm font-semibold">Advanced Filters</h3>

            <p className="text-xs text-muted-foreground">
              Filter users by orders, spending, wishlist and join date.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Orders"
              placeholder="Select Orders"
              value={orders}
              onChange={onOrdersChange}
              options={["0-5", "5-10", "10-25", "25-50", "50+"]}
              allLabel="All"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Min Spend
              </label>

              <Input
                type="number"
                placeholder="₹0"
                value={minSpend}
                onChange={(e) => onMinSpendChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Max Spend
              </label>

              <Input
                type="number"
                placeholder="₹100000"
                value={maxSpend}
                onChange={(e) => onMaxSpendChange(e.target.value)}
              />
            </div>

            <FilterSelect
              label="Joined"
              placeholder="Select Date"
              value={joinedDate}
              onChange={onJoinedDateChange}
              options={["today", "7-days", "30-days", "3-months", "1-year"]}
              allLabel="All Time"
            />

            <FilterSelect
              label="Wishlist"
              placeholder="Wishlist"
              value={wishlist}
              onChange={onWishlistChange}
              options={["yes", "no"]}
              allLabel="All"
            />

            <FilterSelect
              label="Customer Type"
              placeholder="Customer Type"
              value={customerType}
              onChange={onCustomerTypeChange}
              options={["new", "returning", "vip"]}
              allLabel="All"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
