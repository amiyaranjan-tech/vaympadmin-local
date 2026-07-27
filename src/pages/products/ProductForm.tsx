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
import useDropdownOptions from "@/hooks/useDropdownOptions";
import { sortSizes } from "@/utils/sortSizes";
import type { DropdownOptions } from "@/types/option";
import type { ProductImage } from "@/types/product";

import { productSchema, ProductFormValues as Form } from "./product.schema";
import { createProductPayload, updateProductPayload } from "./product.mapper";
import { DEAL_TYPES, DEAL_TYPE_LABELS } from "./productMeta";

const STEPS = [
  "Basics",
  "Pricing",
  "Inventory",
  "Attributes",
  "Offers",
  "Media",
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
  const { options, addOption } = useDropdownOptions();

  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<ProductImage[]>([]);

  const form = useForm<Form>({
    resolver: zodResolver(productSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "Clothes",
      group: [],
      subcategory: "",
      gender: "unisex",
      tags: "",
      productCollection: "",
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
      tryAndBuy: false,
      dealType: "none",
      video: "",
    },
  });

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
          group: product.group,
          subcategory: product.subcategory,
          gender: product.gender,
          tags: product.tags.join(", "),
          productCollection: product.productCollection,
          seller: product.seller ?? "",
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          discountPercent: product.discountPercent,
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
          dealType: product.dealType,
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
  const finalPrice = Math.max(
    0,
    Math.floor(sellingPrice * (1 - discountPercent / 100)),
  );
  const variants = form.watch("variants");
  const category = form.watch("category");
  const group = form.watch("group");
  const subcategory = form.watch("subcategory");
  const attributes = form.watch("attributes") ?? {};
  const dealType = form.watch("dealType");

  const groupOptions = options.groupsByCategory[category] ?? [];
  // Union of subcategories valid for any of the product's selected
  // groups — subcategory only needs to fit at least one group, not all.
  const subcategoryOptions = Array.from(
    new Set(
      group.flatMap((g) => options.subcategoriesByGroup[`${category}::${g}`] ?? []),
    ),
  );
  const sizeOptions =
    options.sizesBySubcategory[subcategory ?? ""] ??
    sortSizes(Array.from(new Set(Object.values(options.sizesBySubcategory).flat())));
  const visibleAttributeKeys = options.attributeTemplatesBySubcategory[subcategory ?? ""] ?? [];

  const stepFields: Record<number, (keyof Form)[]> = {
    0: ["name", "description", "brand", "category", "group", "subcategory", "gender", "seller"],
    1: ["sellingPrice", "costPrice", "discountPercent"],
    2: ["variants"],
    3: ["color", "season"],
    4: [],
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
        await updateProduct(id, updateProductPayload(values, images));
      } else {
        await createProduct(createProductPayload(values, images));
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

  const handleFile = (files: FileList | null) => {
    if (!files) return;
    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      publicId: "",
    }));
    setImages((prev) => [...prev, ...previews]);
    toast.success(`${files.length} image(s) added`);
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
              {step === 0 && (
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
                    <Label>Brand</Label>
                    <Combobox
                      value={form.watch("brand")}
                      onChange={(v) => form.setValue("brand", v)}
                      onCreate={(v) => addOption({ field: "brand", value: v })}
                      options={options.brands}
                      placeholder="Select or add a brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Combobox
                      value={form.watch("category")}
                      onChange={(v) => {
                        form.setValue("category", v);
                        form.setValue("group", []);
                        form.setValue("subcategory", "");
                      }}
                      onCreate={(v) => addOption({ field: "category", value: v })}
                      options={options.categories}
                      placeholder="Select or add a category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <MultiCombobox
                      values={group}
                      onChange={(vals) => {
                        form.setValue("group", vals);
                        form.setValue("subcategory", "");
                      }}
                      onCreate={(v) => addOption({ field: "group", value: v, scope: category })}
                      options={groupOptions}
                      placeholder="Select or add group(s)"
                    />
                    {form.formState.errors.group && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.group.message}
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
                          scope: `${category}::${group}`,
                        })
                      }
                      options={subcategoryOptions}
                      placeholder="Select or add a subcategory"
                    />
                    {form.formState.errors.subcategory && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.subcategory.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={form.watch("gender")}
                      onValueChange={(v) =>
                        form.setValue("gender", v as Form["gender"])
                      }
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
                  <div className="space-y-2">
                    <Label>Collection</Label>
                    <Combobox
                      value={form.watch("productCollection") ?? ""}
                      onChange={(v) => form.setValue("productCollection", v)}
                      onCreate={(v) =>
                        addOption({ field: "productCollection", value: v })
                      }
                      options={options.productCollections}
                      placeholder="Select or add a collection"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
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
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Selling Price</Label>
                    <Input type="number" {...form.register("sellingPrice")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Price</Label>
                    <Input type="number" {...form.register("costPrice")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      {...form.register("discountPercent")}
                    />
                  </div>
                  <div className="md:col-span-3 rounded-xl bg-muted/40 p-4 text-sm">
                    Final price after discount:{" "}
                    <span className="text-base font-semibold">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                </div>
              )}
              {step === 2 && (
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
              {step === 3 && (
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
              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {(
                      [
                        ["isFeatured", "Featured"],
                        ["isTrending", "Trending"],
                        ["isNewArrival", "New Arrival"],
                        ["isLimitedStock", "Limited Stock"],
                        ["isBogo", "Buy One Get One"],
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

                    <label className="flex max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40">
                      <Checkbox
                        checked={form.watch("tryAndBuy")}
                        onCheckedChange={(v) => form.setValue("tryAndBuy", !!v)}
                      />
                      <span className="text-sm font-medium">Try & Buy</span>
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Deal Type</Label>
                        <Select
                          value={dealType}
                          onValueChange={(v) =>
                            form.setValue("dealType", v as Form["dealType"])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEAL_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {DEAL_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {dealType !== "none" && (
                      <p className="max-w-sm rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                        The deal badge shown in the app is generated
                        automatically from the deal type above — no image
                        needed.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-10 hover:bg-muted/40">
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <div className="text-sm font-medium">Upload images</div>
                    <div className="text-xs text-muted-foreground">
                      Multiple files supported
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files)}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((image, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                      >
                        <img
                          src={image.url}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Image upload will be connected after Cloudinary
                    integration.
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
                "Save as draft"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
