import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, PackageSearch, Plus, SearchX, Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";

import useProducts from "@/hooks/useProducts";
import useSellers from "@/hooks/useSellers";
import useOffers from "@/hooks/useOffers";
import type { ProductQueryParams, ProductStockStatus } from "@/types/product";

import { Product } from "./types";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { ProductDetailsSheet } from "./ProductDetailsSheet";

import { useExcel } from "./hooks/useExcel";
import { useProductState } from "./hooks/useProductState";

const STOCK_STATUS_MAP: Record<string, ProductStockStatus> = {
  "in-stock": "in_stock",
  "low-stock": "low_stock",
  "out-of-stock": "out_of_stock",
};

// Stable reference — see Deals.tsx's own LIST_PARAMS for why a fresh
// literal every render would re-fire useOffers' initial-load effect in a
// loop. Every active offer across every shop, so each card can filter
// down to just the ones that apply to its own product (see
// dealMatching.ts#activeOffersForProduct) — same low-volume-admin-list
// reasoning as Deals.tsx's own single unfiltered fetch.
const OFFERS_LIST_PARAMS = { limit: 100 };

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const {
    productId,
    search,
    category,
    group,
    subcategory,
    sellerId,
    brand,
    size,
    gender,
    stockStatus,
    status,
    color,
    material,
    newArrival,
    discount,
    minPrice,
    maxPrice,
    dateAdded,

    setProductId,
    setSearch,
    setCategory,
    setGroup,
    setSubcategory,
    setSellerId,
    setBrand,
    setSize,
    setGender,
    setStockStatus,
    setStatus,
    setColor,
    setMaterial,
    setNewArrival,
    setDiscount,
    setMinPrice,
    setMaxPrice,
    setDateAdded,
  } = useProductState();

  const queryParams = useMemo<ProductQueryParams>(() => {
    const params: ProductQueryParams = {
      limit: 60,
    };

    const search_ = (productId || search).trim();
    if (search_) params.search = search_;

    if (category !== "all") params.category = category;
    if (group !== "all") params.group = group;
    if (subcategory !== "all") params.subcategory = subcategory;
    if (sellerId !== "all") params.seller = sellerId;
    if (brand !== "all") params.brand = brand;
    if (size !== "all") params.size = size;
    if (gender !== "all")
      params.gender = gender as ProductQueryParams["gender"];
    if (color !== "all") params.color = color;
    if (material !== "all") params.material = material;
    if (stockStatus !== "all") params.stockStatus = STOCK_STATUS_MAP[stockStatus];
    if (status !== "all")
      params.status = status as ProductQueryParams["status"];

    if (newArrival === "yes") params.isNewArrival = true;
    if (newArrival === "no") params.isNewArrival = false;

    if (discount !== "all") params.minDiscount = Number(discount);

    if (minPrice) params.minPrice = Number(minPrice);
    if (maxPrice) params.maxPrice = Number(maxPrice);

    if (dateAdded !== "all")
      params.dateAdded = dateAdded as ProductQueryParams["dateAdded"];

    return params;
  }, [
    productId,
    search,
    category,
    group,
    subcategory,
    sellerId,
    brand,
    size,
    gender,
    stockStatus,
    status,
    color,
    material,
    newArrival,
    discount,
    minPrice,
    maxPrice,
    dateAdded,
  ]);

  const { products, total, loading, fetchProducts, deleteProduct, updateStatus } =
    useProducts();

  const { sellers } = useSellers({ limit: 100 });
  const { offers } = useOffers(OFFERS_LIST_PARAMS);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchProducts(queryParams, false);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const { fileInputRef, importing, handleImport, handleExport } = useExcel(
    products,
    sellers,
    () => void fetchProducts(queryParams, false),
  );

  const handleDelete = (id: string) => {
    void deleteProduct(id);
  };

  const handleStatusChange = (id: string, status: Parameters<typeof updateStatus>[1]) => {
    void updateStatus(id, status).then((updated) => {
      setSelectedProduct((prev) => (prev && prev._id === id ? updated : prev));
    });
  };

  const hasActiveFilters = Object.keys(queryParams).some(
    (key) => key !== "limit",
  );

  const clearFilters = () => {
    setProductId("");
    setSearch("");
    setCategory("all");
    setGroup("all");
    setSubcategory("all");
    setSellerId("all");
    setBrand("all");
    setSize("all");
    setGender("all");
    setStockStatus("all");
    setStatus("all");
    setColor("all");
    setMaterial("all");
    setNewArrival("all");
    setDiscount("all");
    setMinPrice("");
    setMaxPrice("");
    setDateAdded("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`Showing ${products.length} of ${total} products`}
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleImport}
            />

            <Button
              variant="outline"
              className="rounded-xl"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {importing ? "Importing..." : "Import"}
            </Button>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button asChild className="rounded-xl">
              <Link to="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </>
        }
      />

      <Card className="rounded-2xl p-4 shadow-soft">
        <ProductFilters
          productId={productId}
          search={search}
          category={category}
          group={group}
          subcategory={subcategory}
          sellerId={sellerId}
          brand={brand}
          size={size}
          gender={gender}
          stockStatus={stockStatus}
          status={status}
          color={color}
          material={material}
          newArrival={newArrival}
          discount={discount}
          minPrice={minPrice}
          maxPrice={maxPrice}
          dateAdded={dateAdded}
          onProductIdChange={setProductId}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onGroupChange={setGroup}
          onSubcategoryChange={setSubcategory}
          onSellerChange={setSellerId}
          onBrandChange={setBrand}
          onSizeChange={setSize}
          onGenderChange={setGender}
          onStockStatusChange={setStockStatus}
          onStatusChange={setStatus}
          onColorChange={setColor}
          onMaterialChange={setMaterial}
          onNewArrivalChange={setNewArrival}
          onDiscountChange={setDiscount}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onDateAddedChange={setDateAdded}
        />
      </Card>

      {loading ? (
        <CardGridSkeleton
          count={8}
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        />
      ) : products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={SearchX}
            title="No products match your filters"
            description="Try adjusting or clearing the filters to see more results."
            action={
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No products yet"
            description="Add your first product to start building the catalog."
            action={
              <Button asChild className="rounded-xl">
                <Link to="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              offers={offers}
              onDelete={handleDelete}
              onView={(product) => {
                setSelectedProduct(product);
                setOpenDetails(true);
              }}
              onApprove={(id) => handleStatusChange(id, "approved")}
            />
          ))}
        </div>
      )}

      <ProductDetailsSheet
        open={openDetails}
        onOpenChange={setOpenDetails}
        product={selectedProduct}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
