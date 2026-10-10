import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { toast } from "sonner";
import { Check, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

import useProducts from "@/hooks/useProducts";
import useSellers from "@/hooks/useSellers";
import useSettings from "@/hooks/useSettings";
import offerService from "@/services/offer.service";
import type { Offer } from "@/types/offer";
import useDropdownOptions from "@/hooks/useDropdownOptions";
import { sortSizes } from "@/utils/sortSizes";
import { uploadImage } from "@/utils/imageUpload";
import type { DropdownOptions } from "@/types/option";
import type { ProductImage } from "@/types/product";

import { productSchema, ProductFormValues as Form } from "./product.schema";
import {
  createProductPayload,
  priceBreakdown,
  updateProductPayload,
} from "./product.mapper";
import { CreateBrandDialog } from "./CreateBrandDialog";

const STEPS = [
  "Media",
  "Basics",
  "Pricing",
  "Inventory",
  "Attributes",
  "Offers",
];

// Presentational labels only — which attribute keys apply to a given
// subcategory is data (options.attributeTemplatesBySubcategory), not
// hardcoded logic. This map just turns a key like "closureType" into a
// human-readable field label.
const ATTRIBUTE_LABELS: Record<string, string> = {
  material: "Material",
  occasion: "Occasion",
  pattern: "Pattern",
  styleType: "Style",
  sleeveType: "Sleeve Type",
  neckType: "Neck Type",
  fit: "Fit",
  closureType: "Closure Type",
  length: "Length",
  rise: "Rise",
  heelType: "Heel Type",
  sole: "Sole",
  sareeType: "Saree Type",
  lehengaType: "Lehenga Type",
  kurtaType: "Kurta Type",
  suitType: "Suit Type",
  sherwaniType: "Sherwani Type",
  dressType: "Dress Type",
};

function attributeOptions(key: string, options: DropdownOptions): string[] {
  switch (key) {
    case "material":
      return options.materials;
    case "occasion":
      return options.occasions;
    case "pattern":
      return options.patterns;
    case "styleType":
      return options.styleTypes;
    case "sleeveType":
      return options.sleeveTypes;
    case "neckType":
      return options.neckTypes;
    case "fit":
      return options.fits;
    case "closureType":
      return options.closureTypes;
    case "length":
      return options.lengths;
    case "rise":
      return options.rises;
    case "heelType":
      return options.heelTypes;
    case "sole":
      return options.soleTypes;
    case "sareeType":
      return options.sareeTypes;
    case "lehengaType":
      return options.lehengaTypes;
    case "kurtaType":
      return options.kurtaTypes;
    case "suitType":
      return options.suitTypes;
    case "sherwaniType":
      return options.sherwaniTypes;
    case "dressType":
      return options.dressTypes;
    default:
      return [];
  }
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { getProduct, createProduct, updateProduct } = useProducts();
  const { sellers } = useSellers({ limit: 100 });
  const { settings } = useSettings();
  const { options, addOption } = useDropdownOptions();

  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [draggingImages, setDraggingImages] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pendingBrand, setPendingBrand] = useState<string | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(productSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "",
      subcategory: "",
      gender: "unisex",
      tags: "",
      group: [],
      seller: "",
      sellingPrice: 999,
      costPrice: 500,
      discountPercent: 10,
      variants: [
        { size: "S", color: "", sku: "", stock: 10 },
        { size: "M", color: "", sku: "", stock: 10 },
        { size: "L", color: "", sku: "", stock: 10 },
      ],
      color: "",
      season: "All",
      attributes: {},
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      isLimitedStock: false,
      isBogo: false,
      tryAndBuy: true,
      isReturnable: true,
      excludeFromShopDeals: false,
      video: "",
    },
  });

  // The selected shop's running store-wide deals — the Offers step asks
  // whether this product takes part in them.
  const [shopDeals, setShopDeals] = useState<Offer[]>([]);
  const sellerId = form.watch("seller");

  useEffect(() => {
    if (!sellerId) {
      setShopDeals([]);
      return;
    }

    let cancelled = false;

    offerService
      .getAll({ seller: sellerId, limit: 50 })
      .then(({ items }) => {
        const now = Date.now();

        if (!cancelled) {
          setShopDeals(
            items.filter(
              (o) =>
                o.scope === "entire_shop" &&
                o.isEnabled &&
                !o.isDeleted &&
                (!o.startDate || new Date(o.startDate).getTime() <= now) &&
                (!o.endDate || new Date(o.endDate).getTime() >= now),
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setShopDeals([]);
      });

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  /**
   * ==========================================
   * Load Product (Edit)
   * ==========================================
   */

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoadingProduct(true);

        const product = await getProduct(id);

        form.reset({
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory,
          gender: product.gender,
          tags: product.tags.join(", "),
          group: product.group,
          seller: product.seller ?? "",
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          // discountPercent on the product is the buyer-facing one; the
          // form edits the seller's own discount, recoverable from sellerPrice.
          discountPercent:
            product.sellerPrice != null && product.sellingPrice > 0
              ? Math.round(
                  ((product.sellingPrice - product.sellerPrice) /
                    product.sellingPrice) *
                    100,
                )
              : product.discountPercent,
          variants: product.variants,
          color: product.color,
          season: product.season,
          attributes: product.attributes,
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
          isNewArrival: product.isNewArrival,
          isLimitedStock: product.isLimitedStock,
          isBogo: product.isBogo,
          tryAndBuy: product.tryAndBuy,
          isReturnable: product.isReturnable,
          excludeFromShopDeals: product.excludeFromShopDeals ?? false,
          video: product.video,
        });

        setImages(product.images);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load product",
        );

        navigate("/products");
      } finally {
        setLoadingProduct(false);
      }
    };

    void loadProduct();
  }, [id, form, getProduct, navigate]);

  const sellingPrice = form.watch("sellingPrice") ?? 0;
  const discountPercent = form.watch("discountPercent") ?? 0;
  const selectedSeller = sellers.find((s) => s._id === form.watch("seller"));
  const commissionRate =
    selectedSeller?.commissionRate ?? settings?.commissionRate ?? 0;
  const pricing = priceBreakdown(
    Number(sellingPrice) || 0,
    Number(discountPercent) || 0,
    commissionRate,
  );
  const variants = form.watch("variants");
  const gender = form.watch("gender");
  const category = form.watch("category");
  const isInnerWear = category === "Inner Wear";
  const group = form.watch("group");
  const subcategory = form.watch("subcategory");
  const attributes = form.watch("attributes") ?? {};

  // Taxonomy — Gender -> Category -> Subcategory. Category is a fixed,
  // curated list per gender (not admin-creatable); Subcategory depends on
  // both Gender and Category together.
  const categoryOptions = options.categoriesByGender[gender] ?? [];
  const subcategoryOptions = options.subcategoriesByCategory[`${gender}::${category}`] ?? [];
  const sizeOptions =
    options.sizesBySubcategory[subcategory ?? ""] ??
    sortSizes(Array.from(new Set(Object.values(options.sizesBySubcategory).flat())));
  const visibleAttributeKeys = options.attributeTemplatesBySubcategory[subcategory ?? ""] ?? [];

  const stepFields: Record<number, (keyof Form)[]> = {
    0: [],
    1: ["name", "description", "gender", "seller", "brand", "category", "subcategory"],
    2: ["sellingPrice", "discountPercent"],
    3: ["variants"],
    4: ["color", "season"],
    5: [],
  };

  const next = async () => {
    const ok = await form.trigger(stepFields[step]);
    if (!ok) {
      toast.error("Please fix the errors");
      return;
    }

    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const onSubmit = async (values: Form) => {
    try {
      if (isEdit && id) {
        await updateProduct(
          id,
          updateProductPayload({ ...values, costPrice: pricing.costPrice }, images),
        );
      } else {
        await createProduct(
          createProductPayload({ ...values, costPrice: pricing.costPrice }, images),
        );
      }

      navigate("/products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const addVariant = () => {
    const nextSize =
      sizeOptions.find(
        (opt) => !variants.some((v) => v.size.toLowerCase() === opt.toLowerCase()),
      ) ?? "";

    form.setValue("variants", [...variants, { size: nextSize, color: "", sku: "", stock: 0 }]);
  };
  const removeVariant = (i: number) =>
    form.setValue(
      "variants",
      variants.filter((_, idx) => idx !== i),
    );

  const setAttribute = (key: string, value: string) => {
    form.setValue("attributes", { ...attributes, [key]: value });
  };

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadImage(file)),
      );
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image(s) added`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit product" : "New product"}
        description="Six focused steps to publish a listing."
      />

      <div className="flex items-center gap-2 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition",
              i === step
                ? "border-primary bg-primary text-primary-foreground"
                : i < step
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
            )}
          >
            {i < step ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-current/20 text-[10px]">
                {i + 1}
              </span>
            )}
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl p-6 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Name</Label>
                    <Input {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={4} {...form.register("description")} />
                    {form.formState.errors.description && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={form.watch("gender")}
                      onValueChange={(v) => {
                        form.setValue("gender", v as Form["gender"]);
                        form.setValue("category", "");
                        form.setValue("subcategory", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["men", "women", "unisex", "kids"].map((g) => (
                          <SelectItem key={g} value={g} className="capitalize">
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <Select
                      value={form.watch("seller")}
                      onValueChange={(v) => form.setValue("seller", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shop" />
                      </SelectTrigger>
                      <SelectContent>
                        {sellers.map((seller) => (
                          <SelectItem key={seller._id} value={seller._id}>
                            {seller.shopName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.seller && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.seller.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <div className="flex items-center gap-2">
                      {options.brandImages[form.watch("brand")] && (
                        <img
                          src={options.brandImages[form.watch("brand")].url}
                          alt={form.watch("brand")}
                          className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover"
                        />
                      )}
                      <Combobox
                        value={form.watch("brand")}
                        onChange={(v) => form.setValue("brand", v)}
                        onCreate={(v) => setPendingBrand(v)}
                        options={options.brands}
                        placeholder="Select or add a brand"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Combobox
                      value={form.watch("category")}
                      onChange={(v) => {
                        form.setValue("category", v);
                        form.setValue("subcategory", "");
                      }}
                      allowCreate={false}
                      options={categoryOptions}
                      placeholder="Select a category"
                      emptyText="No matching category"
                    />
                    {form.formState.errors.category && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Combobox
                      value={form.watch("subcategory") ?? ""}
                      onChange={(v) => form.setValue("subcategory", v)}
                      onCreate={(v) =>
                        addOption({
                          field: "subcategory",
                          value: v,
                          scope: `${gender}::${category}`,
                        })
                      }
                      options={subcategoryOptions}
                      placeholder="Select or add a subcategory"
                      emptyText="Select a category first"
                    />
                    {form.formState.errors.subcategory && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.subcategory.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <MultiCombobox
                      values={form
                        .watch("tags")
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)}
                      onChange={(vals) =>
                        form.setValue("tags", vals.join(", "))
                      }
                      onCreate={(v) => addOption({ field: "tag", value: v })}
                      options={options.tags}
                      placeholder="Select or add tags"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Collections (Optional)</Label>
                    <MultiCombobox
                      values={group}
                      onChange={(vals) => form.setValue("group", vals)}
                      onCreate={(v) => addOption({ field: "group", value: v })}
                      options={options.groups}
                      placeholder="Select or add collection(s)"
                    />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>MRP (Selling Price)</Label>
                      <Input type="number" {...form.register("sellingPrice")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        {...form.register("discountPercent")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
                    {[
                      ["Discounted price", formatCurrency(pricing.sellerPrice)],
                      [
                        `Vaymp commission (${commissionRate}%)`,
                        `− ${formatCurrency(pricing.commission)}`,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">
                        Final price after all deductions (seller gets)
                      </span>
                      <span className="text-base font-semibold">
                        {formatCurrency(pricing.costPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <Label>Variants (size, stock)</Label>
                  {variants.map((variant, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Combobox
                        value={variant.size}
                        onChange={(v) => {
                          const arr = [...variants];
                          arr[i] = { ...arr[i], size: v };
                          form.setValue("variants", arr);
                        }}
                        onCreate={(v) =>
                          addOption({
                            field: "size",
                            value: v,
                            scope: subcategory,
                          })
                        }
                        options={sizeOptions}
                        placeholder="Size"
                        className="w-28"
                      />
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const arr = [...variants];
                          arr[i] = {
                            ...arr[i],
                            stock: Number(e.target.value),
                          };
                          form.setValue("variants", arr);
                        }}
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="rounded-xl"
                  >
                    + Add variant
                  </Button>
                  {form.formState.errors.variants && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.variants.message as string}
                    </p>
                  )}
                </div>
              )}
              {step === 4 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Combobox
                      value={form.watch("color")}
                      onChange={(v) => form.setValue("color", v)}
                      onCreate={(v) => addOption({ field: "color", value: v })}
                      options={options.colors}
                      placeholder="Select or add a color"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Season</Label>
                    <Combobox
                      value={form.watch("season")}
                      onChange={(v) => form.setValue("season", v)}
                      onCreate={(v) => addOption({ field: "season", value: v })}
                      options={options.seasons}
                      placeholder="Select or add a season"
                    />
                  </div>
                  {visibleAttributeKeys.length === 0 && (
                    <div className="md:col-span-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                      Select a subcategory in Basics to load its attribute
                      template.
                    </div>
                  )}
                  {visibleAttributeKeys.map((key) => {
                    const label = ATTRIBUTE_LABELS[key] ?? key;
                    const opts = attributeOptions(key, options);

                    return (
                      <div key={key} className="space-y-2">
                        <Label>{label}</Label>
                        <Combobox
                          value={attributes[key] ?? ""}
                          onChange={(v) => setAttribute(key, v)}
                          onCreate={(v) => addOption({ field: key as never, value: v })}
                          options={opts}
                          placeholder={`Select or add ${label.toLowerCase()}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {(
                      [
                        ["isFeatured", "Featured"],
                        ["isTrending", "Trending"],
                        ["isNewArrival", "New Arrival"],
                        ["isLimitedStock", "Limited Stock"],
                      ] as const
                    ).map(([k, l]) => (
                      <label
                        key={k}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={form.watch(k)}
                          onCheckedChange={(v) => form.setValue(k, !!v)}
                        />
                        <span className="text-sm font-medium">{l}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-4 border-t border-border pt-6">
                    <div>
                      <h3 className="text-sm font-semibold">Product Highlights</h3>
                      <p className="text-xs text-muted-foreground">
                        Small badges shown on the product image across the
                        app — home, search, wishlist, bag, and product
                        details.
                      </p>
                    </div>

                    <div className="max-w-sm space-y-2">
                      <Label>Returns</Label>
                      <Select
                        // Inner Wear is always non-returnable — the backend
                        // forces it too (models/Product.js pre-save).
                        disabled={isInnerWear}
                        value={form.watch("isReturnable") && !isInnerWear ? "returnable" : "non_returnable"}
                        onValueChange={(v) => {
                          const returnable = v === "returnable";
                          form.setValue("isReturnable", returnable);
                          form.setValue("tryAndBuy", returnable);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="returnable">Returnable</SelectItem>
                          <SelectItem value="non_returnable">Non-Returnable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="max-w-sm text-xs text-muted-foreground">
                      {isInnerWear
                        ? "Inner Wear is always non-returnable, so it isn't Try & Buy."
                        : form.watch("isReturnable")
                          ? "Returnable products are automatically Try & Buy."
                          : "Non-returnable products aren't eligible for Try & Buy."}
                    </p>

                    {shopDeals.length > 0 ? (
                      <div className="max-w-md space-y-2">
                        <Label>Store-wide deal</Label>
                        <Select
                          value={form.watch("excludeFromShopDeals") ? "none" : "include"}
                          onValueChange={(v) =>
                            form.setValue("excludeFromShopDeals", v === "none")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="include">
                              Include in {shopDeals.map((o) => o.title).join(", ")}
                            </SelectItem>
                            <SelectItem value="none">No deal</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {form.watch("excludeFromShopDeals")
                            ? "This product stays out of the store-wide deal. You can add it to a different deal later from the Deals section, or leave it without any deal."
                            : "This shop has a store-wide deal running — this product will be part of it."}
                        </p>
                      </div>
                    ) : (
                      <p className="max-w-sm rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                        Deal type (BOGO/Tiered/Free Shipping) is set by linking
                        this product to a Deal, not here — see the Deals
                        section.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {step === 0 && (
                <div className="space-y-4">
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-10 hover:bg-muted/40",
                      uploadingImages ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                      draggingImages && "ring-2 ring-primary ring-inset",
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!uploadingImages) setDraggingImages(true);
                    }}
                    onDragLeave={() => setDraggingImages(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggingImages(false);
                      if (!uploadingImages) void handleFile(e.dataTransfer.files);
                    }}
                  >
                    {uploadingImages ? (
                      <Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    )}
                    <div className="text-sm font-medium">
                      {uploadingImages
                        ? "Uploading…"
                        : draggingImages
                          ? "Drop to upload"
                          : "Upload images"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Drag & drop or click — multiple files supported. Drag
                      thumbnails to reorder; the first is the cover.
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImages}
                      onChange={(e) => void handleFile(e.target.files)}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((image, i) => (
                      <div
                        key={image.publicId || image.url}
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragEnd={() => setDragIndex(null)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragIndex === null || dragIndex === i) return;
                          setImages((prev) => {
                            const next = [...prev];
                            const [moved] = next.splice(dragIndex, 1);
                            next.splice(i, 0, moved);
                            return next;
                          });
                          setDragIndex(i);
                        }}
                        className={cn(
                          "relative aspect-square cursor-grab overflow-hidden rounded-xl bg-muted active:cursor-grabbing",
                          dragIndex === i && "opacity-40 ring-2 ring-primary",
                        )}
                      >
                        <img
                          src={image.url}
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                          onClick={() =>
                            setImages((prev) => prev.filter((_, idx) => idx !== i))
                          }
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL (optional)</Label>
                    <Input placeholder="https://…" {...form.register("video")} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
            className="rounded-xl"
          >
            {step > 0 ? "Back" : "Cancel"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="rounded-xl">
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="rounded-xl"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Publish product"
              )}
            </Button>
          )}
        </div>
      </form>

      <CreateBrandDialog
        brandName={pendingBrand}
        onCancel={() => {
          if (form.watch("brand") === pendingBrand) form.setValue("brand", "");
          setPendingBrand(null);
        }}
        onCreated={(image) => {
          if (pendingBrand) addOption({ field: "brand", value: pendingBrand, image });
          setPendingBrand(null);
        }}
      />
    </div>
  );
}
