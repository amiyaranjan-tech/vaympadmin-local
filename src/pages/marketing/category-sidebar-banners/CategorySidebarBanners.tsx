import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";

import useDropdownOptions from "@/hooks/useDropdownOptions";
import categorySidebarBannerService from "@/services/categorySidebarBanner.service";
import type { CategorySidebarBanner } from "@/types/categorySidebarBanner";

import { CategorySidebarBannerCard } from "./CategorySidebarBannerCard";

const GRID_CLASSNAME = "grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

// Upload a tile image per top-level category (Top Wear, Bottom Wear,
// Footwear, ...) — see storefront.service.js#getCategories'
// categoryBanners, which the RN/web Categories screen sidebar prefers
// over its own plain SVG icon per category. Gender-agnostic (same fixed
// category set regardless of which gender tab is selected) — unlike
// category-banners/CategoryBanners.tsx, which is keyed per
// (gender, category, subcategory) for the subcategory GRID.
export default function CategorySidebarBanners() {
  const { options, loading: loadingOptions } = useDropdownOptions();

  const [banners, setBanners] = useState<CategorySidebarBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setBanners(await categorySidebarBannerService.getAll());
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load category sidebar banners",
        );
      } finally {
        setLoadingBanners(false);
      }
    })();
  }, []);

  // Flat, deduped, gender-agnostic — the same category set every gender
  // tab's sidebar shows (see CategoriesScreen.tsx's useCategories()).
  const categories = useMemo(
    () => [...new Set(Object.values(options.categoriesByGender).flat())].sort(),
    [options.categoriesByGender],
  );

  const bannerByCategory = useMemo(() => {
    const map = new Map<string, CategorySidebarBanner>();
    for (const banner of banners) {
      map.set(banner.category, banner);
    }
    return map;
  }, [banners]);

  const handleSaved = (banner: CategorySidebarBanner) => {
    setBanners((prev) => [...prev.filter((b) => b.category !== banner.category), banner]);
  };

  const handleRemoved = (category: string) => {
    setBanners((prev) => prev.filter((b) => b.category !== category));
  };

  const loading = loadingOptions || loadingBanners;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Sidebar Banners"
        description="Upload a banner image for each category shown in the Categories screen's sidebar (Top Wear, Bottom Wear, Footwear, ...) — replaces the default icon."
      />

      {loading ? (
        <CardGridSkeleton count={8} className={GRID_CLASSNAME} />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="No live categories found." />
      ) : (
        <div className={GRID_CLASSNAME}>
          {categories.map((category) => (
            <CategorySidebarBannerCard
              key={category}
              category={category}
              banner={bannerByCategory.get(category)}
              onSaved={handleSaved}
              onRemoved={() => handleRemoved(category)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
