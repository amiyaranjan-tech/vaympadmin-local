import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import optionService from "@/services/option.service";
import { sortSizes } from "@/utils/sortSizes";

import type { CreateOptionRequest, DropdownOptions } from "@/types/option";

const EMPTY: DropdownOptions = {
  categories: [],
  groupsByCategory: {},
  subcategoriesByGroup: {},
  brands: [],
  colors: [],
  materials: [],
  seasons: [],
  occasions: [],
  patterns: [],
  tags: [],
  cities: [],
  sizesBySubcategory: {},
  attributeTemplatesBySubcategory: {},
  sleeveTypes: [],
  neckTypes: [],
  fits: [],
  closureTypes: [],
  lengths: [],
  rises: [],
  heelTypes: [],
  soleTypes: [],
  styleTypes: [],
  sareeTypes: [],
  lehengaTypes: [],
  kurtaTypes: [],
  suitTypes: [],
  sherwaniTypes: [],
  dressTypes: [],
  productCollections: [],
};

const insertSorted = (list: string[], value: string) =>
  list.some((v) => v.toLowerCase() === value.toLowerCase())
    ? list
    : [...list, value].sort();

const insertSize = (list: string[], value: string) =>
  list.some((v) => v.toLowerCase() === value.toLowerCase())
    ? list
    : sortSizes([...list, value]);

export default function useDropdownOptions() {
  const [options, setOptions] = useState<DropdownOptions>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await optionService.getAll();

        if (!cancelled) setOptions(data);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load dropdown options";

          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * ==========================================
   * Add Option
   * ==========================================
   *
   * Persists the new value immediately (independent of whether the
   * surrounding form is ever submitted) and updates local state
   * optimistically so it shows up right away on this page.
   */

  const addOption = useCallback(
    ({ field, value, scope = "" }: CreateOptionRequest) => {
      const trimmed = value.trim();

      if (!trimmed) return;

      setOptions((prev) => {
        switch (field) {
          case "category":
            return { ...prev, categories: insertSorted(prev.categories, trimmed) };
          case "group":
            return {
              ...prev,
              groupsByCategory: {
                ...prev.groupsByCategory,
                [scope]: insertSorted(prev.groupsByCategory[scope] ?? [], trimmed),
              },
            };
          case "subcategory":
            return {
              ...prev,
              subcategoriesByGroup: {
                ...prev.subcategoriesByGroup,
                [scope]: insertSorted(
                  prev.subcategoriesByGroup[scope] ?? [],
                  trimmed,
                ),
              },
            };
          case "attributeKey":
            return {
              ...prev,
              attributeTemplatesBySubcategory: {
                ...prev.attributeTemplatesBySubcategory,
                [scope]: insertSorted(
                  prev.attributeTemplatesBySubcategory[scope] ?? [],
                  trimmed,
                ),
              },
            };
          case "brand":
            return { ...prev, brands: insertSorted(prev.brands, trimmed) };
          case "color":
            return { ...prev, colors: insertSorted(prev.colors, trimmed) };
          case "material":
            return { ...prev, materials: insertSorted(prev.materials, trimmed) };
          case "season":
            return { ...prev, seasons: insertSorted(prev.seasons, trimmed) };
          case "occasion":
            return { ...prev, occasions: insertSorted(prev.occasions, trimmed) };
          case "pattern":
            return { ...prev, patterns: insertSorted(prev.patterns, trimmed) };
          case "tag":
            return { ...prev, tags: insertSorted(prev.tags, trimmed) };
          case "city":
            return { ...prev, cities: insertSorted(prev.cities, trimmed) };
          case "size":
            return {
              ...prev,
              sizesBySubcategory: {
                ...prev.sizesBySubcategory,
                [scope]: insertSize(
                  prev.sizesBySubcategory[scope] ?? [],
                  trimmed,
                ),
              },
            };
          case "sleeveType":
            return { ...prev, sleeveTypes: insertSorted(prev.sleeveTypes, trimmed) };
          case "neckType":
            return { ...prev, neckTypes: insertSorted(prev.neckTypes, trimmed) };
          case "fit":
            return { ...prev, fits: insertSorted(prev.fits, trimmed) };
          case "closureType":
            return { ...prev, closureTypes: insertSorted(prev.closureTypes, trimmed) };
          case "length":
            return { ...prev, lengths: insertSorted(prev.lengths, trimmed) };
          case "rise":
            return { ...prev, rises: insertSorted(prev.rises, trimmed) };
          case "heelType":
            return { ...prev, heelTypes: insertSorted(prev.heelTypes, trimmed) };
          case "sole":
            return { ...prev, soleTypes: insertSorted(prev.soleTypes, trimmed) };
          case "styleType":
            return { ...prev, styleTypes: insertSorted(prev.styleTypes, trimmed) };
          case "sareeType":
            return { ...prev, sareeTypes: insertSorted(prev.sareeTypes, trimmed) };
          case "lehengaType":
            return { ...prev, lehengaTypes: insertSorted(prev.lehengaTypes, trimmed) };
          case "kurtaType":
            return { ...prev, kurtaTypes: insertSorted(prev.kurtaTypes, trimmed) };
          case "suitType":
            return { ...prev, suitTypes: insertSorted(prev.suitTypes, trimmed) };
          case "sherwaniType":
            return { ...prev, sherwaniTypes: insertSorted(prev.sherwaniTypes, trimmed) };
          case "dressType":
            return { ...prev, dressTypes: insertSorted(prev.dressTypes, trimmed) };
          case "productCollection":
            return { ...prev, productCollections: insertSorted(prev.productCollections, trimmed) };
          default:
            return prev;
        }
      });

      optionService.create({ field, value: trimmed, scope }).catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to save new option";

        toast.error(message);
      });
    },
    [],
  );

  return { options, loading, addOption };
}
