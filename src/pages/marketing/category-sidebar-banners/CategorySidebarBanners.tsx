import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useDropdownOptions from "@/hooks/useDropdownOptions";
import categorySidebarBannerService from "@/services/categorySidebarBanner.service";
import type { CategorySidebarBanner, CategorySidebarBannerGender } from "@/types/categorySidebarBanner";

import { CategorySidebarBannerCard } from "./CategorySidebarBannerCard";

const GRID_CLASSNAME = "grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

const GENDERS: { value: CategorySidebarBannerGender; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

const bannerKey = (gender: string, category: string) => `${gender}::${category}`;

// Upload a tile image per top-level category (Top Wear, Bottom Wear,
// Footwear, ...) — see storefront.service.js#getCategories'
// categoryBanners, which the RN/web Categories screen sidebar prefers
// over its own plain SVG icon per category. One tile per (gender, category),
// e.g. a women's Top Wear photo on the Women tab. Older gender-less tiles
// (gender "") still show as the fallback for a gender with no tile yet.
export default function CategorySidebarBanners() {
  const { options, loading: loadingOptions } = useDropdownOptions();

  const [gender, setGender] = useState<CategorySidebarBannerGender>("men");
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

  const categories = useMemo(
    () => [...(options.categoriesByGender[gender] ?? [])].sort(),
    [options.categoriesByGender, gender],
  );

  const bannerByCategory = useMemo(() => {
    const map = new Map<string, CategorySidebarBanner>();
    for (const banner of banners) {
      map.set(bannerKey(banner.gender ?? "", banner.category), banner);
    }
    return map;
  }, [banners]);

  const handleSaved = (banner: CategorySidebarBanner) => {
    setBanners((prev) => [
      ...prev.filter((b) => bannerKey(b.gender ?? "", b.category) !== bannerKey(banner.gender ?? "", banner.category)),
      banner,
    ]);
  };

  const handleRemoved = (category: string) => {
    setBanners((prev) => prev.filter((b) => bannerKey(b.gender ?? "", b.category) !== bannerKey(gender, category)));
  };

  const loading = loadingOptions || loadingBanners;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Sidebar Banners"
        description="Upload a banner image for each category shown in the Categories screen's sidebar (Top Wear, Bottom Wear, Footwear, ...). Each gender has its own image (Men / Women / Kids)."
      />

      <Tabs value={gender} onValueChange={(v) => setGender(v as CategorySidebarBannerGender)}>
        <TabsList className="rounded-xl">
          {GENDERS.map((g) => (
            <TabsTrigger key={g.value} value={g.value}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <CardGridSkeleton count={8} className={GRID_CLASSNAME} />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="No live categories found." />
      ) : (
        <div className={GRID_CLASSNAME}>
          {categories.map((category) => (
            <CategorySidebarBannerCard
              key={bannerKey(gender, category)}
              category={category}
              gender={gender}
              banner={bannerByCategory.get(bannerKey(gender, category))}
              onSaved={handleSaved}
              onRemoved={() => handleRemoved(category)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
