import { useEffect, useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useDropdownOptions from "@/hooks/useDropdownOptions";
import categoryBannerService from "@/services/categoryBanner.service";
import type { CategoryBanner, CategoryBannerGender } from "@/types/categoryBanner";

import { SubcategoryBannerCard } from "./SubcategoryBannerCard";

const GENDERS: { value: CategoryBannerGender; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

const GRID_CLASSNAME = "grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

function bannerKey(gender: string, category: string, subcategory: string) {
  return `${gender}::${category}::${subcategory}`;
}

// Upload a curated tile image per (gender, category, subcategory) — see
// storefront.service.js#getCategories' subcategoryBanners, which the RN
// Categories screen prefers over its own arbitrary product-photo
// fallback. Taxonomy comes from useDropdownOptions (same hook ProductForm
// already uses for its cascading Gender -> Category -> Subcategory
// pickers) — this page just walks the same live taxonomy instead of
// letting the admin type free-form values.
export default function CategoryBanners() {
  const { options, loading: loadingOptions } = useDropdownOptions();

  const [banners, setBanners] = useState<CategoryBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const [gender, setGender] = useState<CategoryBannerGender>("men");
  const [category, setCategory] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setBanners(await categoryBannerService.getAll());
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load category banners",
        );
      } finally {
        setLoadingBanners(false);
      }
    })();
  }, []);

  const categories = options.categoriesByGender[gender] ?? [];

  // Default to (or re-pick, on a gender switch) this gender's first
  // category once the taxonomy's loaded — adjusted during render, not in
  // an effect, to avoid the extra commit a setState-in-effect would cause
  // (same technique as Banners.tsx's own filterKey/prevFilterKey).
  const categoriesKey = `${gender}|${categories.join(",")}`;
  const [prevCategoriesKey, setPrevCategoriesKey] = useState("");

  if (categoriesKey !== prevCategoriesKey) {
    setPrevCategoriesKey(categoriesKey);
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }

  const subcategories = options.subcategoriesByCategory[`${gender}::${category}`] ?? [];

  const bannerByKey = useMemo(() => {
    const map = new Map<string, CategoryBanner>();
    for (const banner of banners) {
      map.set(bannerKey(banner.gender, banner.category, banner.subcategory), banner);
    }
    return map;
  }, [banners]);

  const handleSaved = (banner: CategoryBanner) => {
    setBanners((prev) => [
      ...prev.filter(
        (b) => bannerKey(b.gender, b.category, b.subcategory) !== bannerKey(banner.gender, banner.category, banner.subcategory),
      ),
      banner,
    ]);
  };

  const handleRemoved = (subcategory: string) => {
    setBanners((prev) =>
      prev.filter((b) => bannerKey(b.gender, b.category, b.subcategory) !== bannerKey(gender, category, subcategory)),
    );
  };

  const loading = loadingOptions || loadingBanners;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Banners"
        description="Upload a banner image for each subcategory tile shown on the app's Categories screen (Blazers, Cardigans, ...) — replaces the default random product-photo fallback."
      />

      <Tabs value={gender} onValueChange={(v) => setGender(v as CategoryBannerGender)}>
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
        <EmptyState
          title="No categories yet"
          description={`No live categories found for ${gender}.`}
        />
      ) : (
        <>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="h-auto flex-wrap rounded-xl">
              {categories.map((c) => (
                <TabsTrigger key={c} value={c}>
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {subcategories.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title="No subcategories yet"
              description={`No live subcategories found under ${gender} / ${category}.`}
            />
          ) : (
            <div className={GRID_CLASSNAME}>
              {subcategories.map((subcategory) => (
                <SubcategoryBannerCard
                  key={subcategory}
                  gender={gender}
                  category={category}
                  subcategory={subcategory}
                  banner={bannerByKey.get(bannerKey(gender, category, subcategory))}
                  onSaved={handleSaved}
                  onRemoved={() => handleRemoved(subcategory)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
