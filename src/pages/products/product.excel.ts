import type { CreateProductRequest, Product, ProductGender, ProductStatus } from "@/types/product";
import type { Seller } from "@/types/seller";

/**
 * ==========================================
 * Helpers
 * ==========================================
 */

function getCell(row: Record<string, unknown>, key: string): string {
  const target = key.toLowerCase();

  const match = Object.keys(row).find((k) => k.trim().toLowerCase() === target);

  return match ? String(row[match] ?? "").trim() : "";
}

function toNumber(value: string, fallback = 0): number {
  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
}

function toBoolean(value: string): boolean {
  return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
}

// "size:stock" pairs, comma separated, e.g. "S:10, M:15, L:8" — color/sku
// default empty and can be filled in later through the product form.
function parseVariants(value: string): Product["variants"] {
  if (!value) return [];

  return value
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [size, stock] = pair.split(":").map((p) => p.trim());

      return { size: size ?? "", color: "", sku: "", stock: toNumber(stock ?? "0") };
    })
    .filter((v) => v.size);
}

function formatVariants(variants: Product["variants"]): string {
  return variants.map((v) => `${v.size}:${v.stock}`).join(", ");
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Which attribute columns an import sheet may carry — same key set as
// the subcategory-driven attribute templates in the admin form; unknown
// keys are simply never populated, empty ones are dropped before send.
const ATTRIBUTE_COLUMNS = [
  "material", "occasion", "pattern", "styleType", "sleeveType", "neckType",
  "fit", "closureType", "length", "rise", "heelType", "sole", "sareeType",
  "lehengaType", "kurtaType", "suitType", "sherwaniType", "dressType",
];

const GENDERS: ProductGender[] = ["men", "women", "unisex", "kids"];
const STATUSES: ProductStatus[] = [
  "draft",
  "pending_review",
  "approved",
  "published",
  "hidden",
  "archived",
  "rejected",
];

function resolveSeller(
  value: string,
  sellers: Seller[],
): { sellerId: string | null; error?: string } {
  if (!value) return { sellerId: null };

  const byId = sellers.find((s) => s._id === value);
  if (byId) return { sellerId: byId._id };

  const byName = sellers.find(
    (s) => s.shopName.toLowerCase() === value.toLowerCase(),
  );
  if (byName) return { sellerId: byName._id };

  return { sellerId: null, error: `Seller "${value}" not found` };
}

/**
 * ==========================================
 * Row -> Create Payload
 * ==========================================
 */

export interface ExcelRowResult {
  row: number;
  payload?: CreateProductRequest;
  error?: string;
}

export function excelRowToPayload(
  row: Record<string, unknown>,
  rowIndex: number,
  sellers: Seller[],
): ExcelRowResult {
  const name = getCell(row, "Name");
  const brand = getCell(row, "Brand");
  const category = getCell(row, "Category");
  const group = getCell(row, "Group");
  const subcategory = getCell(row, "Subcategory");
  const costPrice = getCell(row, "CostPrice");
  const sellingPrice = getCell(row, "SellingPrice");

  if (!name || !brand || !category || !group || !subcategory || !costPrice || !sellingPrice) {
    return {
      row: rowIndex,
      error:
        "Missing required field(s): Name, Brand, Category, Group, Subcategory, CostPrice, SellingPrice",
    };
  }

  const sellerValue = getCell(row, "Seller");
  const { sellerId, error: sellerError } = resolveSeller(sellerValue, sellers);

  if (sellerError) {
    return { row: rowIndex, error: sellerError };
  }

  const genderRaw = getCell(row, "Gender").toLowerCase();
  const statusRaw = getCell(row, "Status").toLowerCase();

  const attributes: Record<string, string> = {};
  for (const key of ATTRIBUTE_COLUMNS) {
    const value = getCell(row, key);
    if (value) attributes[key] = value;
  }

  const payload: CreateProductRequest = {
    name,
    description: getCell(row, "Description"),
    brand,
    category,
    group,
    subcategory,
    productCollection: getCell(row, "Collection"),
    gender: GENDERS.includes(genderRaw as ProductGender)
      ? (genderRaw as ProductGender)
      : "unisex",
    tags: parseTags(getCell(row, "Tags")),
    seller: sellerId,
    costPrice: toNumber(costPrice),
    sellingPrice: toNumber(sellingPrice),
    discountPercent: toNumber(getCell(row, "DiscountPercent"), 0),
    variants: parseVariants(getCell(row, "Variants") || getCell(row, "Sizes")),
    color: getCell(row, "Color"),
    season: getCell(row, "Season") || "All",
    attributes,
    isFeatured: toBoolean(getCell(row, "IsFeatured")),
    isTrending: toBoolean(getCell(row, "IsTrending")),
    isNewArrival: toBoolean(getCell(row, "IsNewArrival")),
    isLimitedStock: toBoolean(getCell(row, "IsLimitedStock")),
    isBogo: toBoolean(getCell(row, "IsBogo")),
    video: getCell(row, "Video"),
    status: STATUSES.includes(statusRaw as ProductStatus)
      ? (statusRaw as ProductStatus)
      : "draft",
  };

  return { row: rowIndex, payload };
}

/**
 * ==========================================
 * Product -> Export Row
 * ==========================================
 */

export function productToExcelRow(product: Product, sellers: Seller[]) {
  const seller = sellers.find((s) => s._id === product.seller);

  return {
    Name: product.name,
    Description: product.description,
    Brand: product.brand,
    Category: product.category,
    Group: product.group,
    Subcategory: product.subcategory,
    Collection: product.productCollection,
    Gender: product.gender,
    Tags: product.tags.join(", "),
    Seller: seller?.shopName ?? "",
    CostPrice: product.costPrice,
    SellingPrice: product.sellingPrice,
    DiscountPercent: product.discountPercent,
    Variants: formatVariants(product.variants),
    Color: product.color,
    Season: product.season,
    ...Object.fromEntries(
      ATTRIBUTE_COLUMNS.map((key) => [
        key.charAt(0).toUpperCase() + key.slice(1),
        product.attributes[key] ?? "",
      ]),
    ),
    IsFeatured: product.isFeatured,
    IsTrending: product.isTrending,
    IsNewArrival: product.isNewArrival,
    IsLimitedStock: product.isLimitedStock,
    IsBogo: product.isBogo,
    Video: product.video,
    Status: product.status,
  };
}
