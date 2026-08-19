import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ImageOff, SearchX } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import useBanners from "@/hooks/useBanners";
import type { Banner, BannerQueryParams } from "@/types/banner";

import { BannerCard } from "./BannerCard";
import { BannerFilters } from "./BannerFilters";
import { useBannerState } from "./hooks/useBannerState";

export default function Banners() {
  const [page, setPage] = useState(1);

  const {
    search,
    position,
    type,
    status,
    activeFilter,
    sort,

    setSearch,
    setPosition,
    setType,
    setStatus,
    setActiveFilter,
    setSort,
  } = useBannerState();

  // Any filter change should jump back to page 1. Adjusted during render
  // (not in an effect) to avoid the extra commit a setState-in-effect
  // would cause — see https://react.dev/learn/you-might-not-need-an-effect.
  const filterKey = `${search}|${position}|${type}|${status}|${activeFilter}|${sort}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const queryParams = useMemo<BannerQueryParams>(() => {
    const params: BannerQueryParams = {
      page,
      limit: 24,
      sort: sort as BannerQueryParams["sort"],
    };

    if (search.trim()) params.search = search.trim();
    if (position !== "all") params.position = position as BannerQueryParams["position"];
    if (type !== "all") params.type = type as BannerQueryParams["type"];

    if (activeFilter !== "all") {
      params.activeFilter = activeFilter as BannerQueryParams["activeFilter"];
    } else if (status !== "all") {
      params.status = status as BannerQueryParams["status"];
    }

    return params;
  }, [page, search, position, type, status, activeFilter, sort]);

  const {
    banners,
    total,
    totalPages,
    loading,
    fetchBanners,
    deleteBanner,
    updateStatus,
    duplicateBanner,
  } = useBanners();

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchBanners(queryParams, false);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleDelete = (id: string) => {
    void deleteBanner(id);
  };

  const handleDuplicate = (id: string) => {
    void duplicateBanner(id);
  };

  const handleTogglePublish = (banner: Banner) => {
    void updateStatus(banner._id, banner.status === "published" ? "hidden" : "published");
  };

  const hasActiveFilters = Object.keys(queryParams).some(
    (key) => key !== "limit" && key !== "page" && key !== "sort",
  );

  const clearFilters = () => {
    setSearch("");
    setPosition("all");
    setType("all");
    setStatus("all");
    setActiveFilter("all");
    setSort("priority");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description={`Showing ${banners.length} of ${total} banners`}
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/marketing/banners/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Link>
          </Button>
        }
      />

      <Card className="rounded-2xl p-4 shadow-soft">
        <BannerFilters
          search={search}
          position={position}
          type={type}
          status={status}
          activeFilter={activeFilter}
          sort={sort}
          onSearchChange={setSearch}
          onPositionChange={setPosition}
          onTypeChange={setType}
          onStatusChange={setStatus}
          onActiveFilterChange={setActiveFilter}
          onSortChange={setSort}
        />
      </Card>

      {loading ? (
        <CardGridSkeleton count={6} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" />
      ) : banners.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={SearchX}
            title="No banners match your filters"
            description="Try adjusting or clearing the filters to see more results."
            action={
              <Button variant="outline" className="rounded-xl" onClick={clearFilters}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={ImageOff}
            title="No banners yet"
            description="Create your first banner to start driving traffic from the Consumer app."
            action={
              <Button asChild className="rounded-xl">
                <Link to="/marketing/banners/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Banner
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            <PaginationItem>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
