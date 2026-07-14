import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import { products as productsMock } from "@/data/mock";

import { Product } from "./types";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { ProductDetailsSheet } from "./ProductDetailsSheet";

import { useExcel } from "./hooks/useExcel";
import { useProductState } from "./hooks/useProductState";
import { useProductFilters } from "./hooks/useProductFilters";

export default function Products() {
  const [products, setProducts] = useState(productsMock);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const {
    productId,
    search,
    category,
    subcategory,
    sellerId,
    brand,
    size,
    gender,
    stockStatus,
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
    setSubcategory,
    setSellerId,
    setBrand,
    setSize,
    setGender,
    setStockStatus,
    setColor,
    setMaterial,
    setNewArrival,
    setDiscount,
    setMinPrice,
    setMaxPrice,
    setDateAdded,
  } = useProductState();

  const filteredProducts = useProductFilters({
    products,
    productId,
    search,
    category,
    subcategory,
    sellerId,
    brand,
    size,
    gender,
    stockStatus,
    color,
    material,
    newArrival,
    discount,
    minPrice,
    maxPrice,
    dateAdded,
  });

  const { fileInputRef, handleImport, handleExport } = useExcel(products);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    toast.success("Product deleted");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`Showing ${filteredProducts.length} of ${products.length} products`}
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
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
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
          subcategory={subcategory}
          sellerId={sellerId}
          brand={brand}
          size={size}
          gender={gender}
          stockStatus={stockStatus}
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
          onSubcategoryChange={setSubcategory}
          onSellerChange={setSellerId}
          onBrandChange={setBrand}
          onSizeChange={setSize}
          onGenderChange={setGender}
          onStockStatusChange={setStockStatus}
          onColorChange={setColor}
          onMaterialChange={setMaterial}
          onNewArrivalChange={setNewArrival}
          onDiscountChange={setDiscount}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onDateAddedChange={setDateAdded}
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.slice(0, 60).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleDelete}
            onView={(product) => {
              setSelectedProduct(product);
              setOpenDetails(true);
            }}
          />
        ))}
      </div>

      <ProductDetailsSheet
        open={openDetails}
        onOpenChange={setOpenDetails}
        product={selectedProduct}
      />
    </div>
  );
}
