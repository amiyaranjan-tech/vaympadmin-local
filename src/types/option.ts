/**
 * ==========================================
 * Common API Response
 * ==========================================
 */

export interface OptionApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  timestamp: string;
}

/**
 * ==========================================
 * Dropdown Option Field
 * ==========================================
 */

export type DropdownOptionField =
  | "category"
  | "group"
  | "subcategory"
  | "attributeKey"
  | "brand"
  | "color"
  | "material"
  | "season"
  | "occasion"
  | "pattern"
  | "tag"
  | "size"
  | "city"
  | "sleeveType"
  | "neckType"
  | "fit"
  | "closureType"
  | "length"
  | "rise"
  | "heelType"
  | "sole"
  | "styleType"
  | "sareeType"
  | "lehengaType"
  | "kurtaType"
  | "suitType"
  | "sherwaniType"
  | "dressType"
  | "productCollection";

/**
 * ==========================================
 * Dropdown Options (grouped, as returned by GET /options)
 * ==========================================
 *
 * Taxonomy chain: category -> groupsByCategory[category] -> group ->
 * subcategoriesByGroup["<category>::<group>"] -> subcategory ->
 * attributeTemplatesBySubcategory[subcategory] (which attribute keys
 * apply) + sizesBySubcategory[subcategory] (allowed sizes).
 *
 * `productCollection` is global/flat — a cross-cutting merchandising tag,
 * not part of the category chain (named productCollection, not
 * "collection", to avoid the backend's reserved Mongoose property).
 */

export interface DropdownOptions {
  categories: string[];
  groupsByCategory: Record<string, string[]>;
  subcategoriesByGroup: Record<string, string[]>;
  brands: string[];
  colors: string[];
  materials: string[];
  seasons: string[];
  occasions: string[];
  patterns: string[];
  tags: string[];
  cities: string[];
  sizesBySubcategory: Record<string, string[]>;
  attributeTemplatesBySubcategory: Record<string, string[]>;
  sleeveTypes: string[];
  neckTypes: string[];
  fits: string[];
  closureTypes: string[];
  lengths: string[];
  rises: string[];
  heelTypes: string[];
  soleTypes: string[];
  styleTypes: string[];
  sareeTypes: string[];
  lehengaTypes: string[];
  kurtaTypes: string[];
  suitTypes: string[];
  sherwaniTypes: string[];
  dressTypes: string[];
  productCollections: string[];
}

/**
 * ==========================================
 * Create Option
 * ==========================================
 */

export interface CreateOptionRequest {
  field: DropdownOptionField;
  value: string;
  scope?: string;
}

export interface DropdownOption {
  _id: string;
  field: DropdownOptionField;
  value: string;
  scope: string;
  createdAt: string;
  updatedAt: string;
}
