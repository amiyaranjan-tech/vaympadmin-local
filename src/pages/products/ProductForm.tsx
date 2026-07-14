import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, CATEGORIES_LIST } from "@/data/mock";
import { toast } from "sonner";
import { Upload, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Required"),
  description: z.string().min(10, "At least 10 chars"),
  brand: z.string().min(1),
  category: z.string().min(1),
  gender: z.enum(["men", "women", "unisex", "kids"]),
  tags: z.string(),
  sellingPrice: z.coerce.number().positive("Must be > 0"),
  costPrice: z.coerce.number().positive("Must be > 0"),
  discount: z.coerce.number().min(0).max(100),
  sizes: z.array(z.object({ size: z.string(), quantity: z.coerce.number().min(0) })).min(1, "At least 1 size"),
  color: z.string().min(1),
  material: z.string().min(1),
  season: z.string().min(1),
  occasion: z.string().min(1),
  pattern: z.string().min(1),
  featured: z.boolean(),
  trending: z.boolean(),
  newArrival: z.boolean(),
  limitedStock: z.boolean(),
  bogo: z.boolean(),
});
type Form = z.infer<typeof schema>;

const STEPS = ["Basics", "Pricing", "Inventory", "Attributes", "Offers", "Media"];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = id ? products.find((p) => p.id === id) : undefined;
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>(existing?.images ?? []);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: existing ? {
      name: existing.name, description: existing.description, brand: existing.brand, category: existing.category,
      gender: existing.gender, tags: existing.tags.join(", "),
      sellingPrice: existing.sellingPrice, costPrice: existing.costPrice, discount: existing.discount,
      sizes: existing.sizes,
      color: existing.color, material: existing.material, season: existing.season, occasion: existing.occasion, pattern: existing.pattern,
      featured: existing.featured, trending: existing.trending, newArrival: existing.newArrival,
      limitedStock: existing.limitedStock, bogo: existing.bogo,
    } : {
      name: "", description: "", brand: "", category: "T-Shirts", gender: "unisex", tags: "",
      sellingPrice: 999, costPrice: 500, discount: 10,
      sizes: [{ size: "S", quantity: 10 }, { size: "M", quantity: 10 }, { size: "L", quantity: 10 }],
      color: "", material: "", season: "All", occasion: "Casual", pattern: "Solid",
      featured: false, trending: false, newArrival: false, limitedStock: false, bogo: false,
    },
  });

  const sellingPrice = form.watch("sellingPrice") ?? 0;
  const discount = form.watch("discount") ?? 0;
  const discountPrice = Math.max(0, Math.floor(sellingPrice * (1 - discount / 100)));
  const sizes = form.watch("sizes");

  const stepFields: Record<number, (keyof Form)[]> = {
    0: ["name", "description", "brand", "category", "gender"],
    1: ["sellingPrice", "costPrice", "discount"],
    2: ["sizes"],
    3: ["color", "material", "season", "occasion", "pattern"],
    4: [],
    5: [],
  };

  const next = async () => {
    const ok = await form.trigger(stepFields[step]);
    if (!ok) { toast.error("Please fix the errors"); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const onSubmit = (v: Form) => {
    void v;
    toast.success(existing ? "Product updated" : "Product created");
    navigate("/products");
  };

  const addSize = () => form.setValue("sizes", [...sizes, { size: "XL", quantity: 0 }]);
  const removeSize = (i: number) => form.setValue("sizes", sizes.filter((_, idx) => idx !== i));

  const handleFile = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
    toast.success(`${files.length} image(s) added`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={existing ? "Edit product" : "New product"} description="Six focused steps to publish a listing." />

      <div className="flex items-center gap-2 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button key={label} type="button" onClick={() => setStep(i)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition",
              i === step ? "border-primary bg-primary text-primary-foreground" :
              i < step ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"
            )}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="grid h-4 w-4 place-items-center rounded-full bg-current/20 text-[10px]">{i + 1}</span>}
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-2xl p-6 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {step === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2"><Label>Name</Label><Input {...form.register("name")} />{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
                  <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} {...form.register("description")} />{form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}</div>
                  <div className="space-y-2"><Label>Brand</Label><Input {...form.register("brand")} /></div>
                  <div className="space-y-2"><Label>Category</Label>
                    <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Gender</Label>
                    <Select value={form.watch("gender")} onValueChange={(v) => form.setValue("gender", v as Form["gender"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["men", "women", "unisex", "kids"].map((g) => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Tags (comma separated)</Label><Input {...form.register("tags")} /></div>
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label>Selling Price</Label><Input type="number" {...form.register("sellingPrice")} /></div>
                  <div className="space-y-2"><Label>Cost Price</Label><Input type="number" {...form.register("costPrice")} /></div>
                  <div className="space-y-2"><Label>Discount %</Label><Input type="number" {...form.register("discount")} /></div>
                  <div className="md:col-span-3 rounded-xl bg-muted/40 p-4 text-sm">Final price after discount: <span className="text-base font-semibold">{formatCurrency(discountPrice)}</span></div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-3">
                  <Label>Sizes and stock</Label>
                  {sizes.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={s.size} onChange={(e) => { const arr = [...sizes]; arr[i] = { ...arr[i], size: e.target.value }; form.setValue("sizes", arr); }} className="w-24" />
                      <Input type="number" value={s.quantity} onChange={(e) => { const arr = [...sizes]; arr[i] = { ...arr[i], quantity: Number(e.target.value) }; form.setValue("sizes", arr); }} className="w-32" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSize(i)}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addSize} className="rounded-xl">+ Add size</Button>
                  {form.formState.errors.sizes && <p className="text-xs text-destructive">{form.formState.errors.sizes.message as string}</p>}
                </div>
              )}
              {step === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[["color", "Color"], ["material", "Material"], ["season", "Season"], ["occasion", "Occasion"], ["pattern", "Pattern"]].map(([n, l]) => (
                    <div key={n} className="space-y-2"><Label>{l}</Label><Input {...form.register(n as keyof Form)} /></div>
                  ))}
                </div>
              )}
              {step === 4 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {[["featured", "Featured"], ["trending", "Trending"], ["newArrival", "New Arrival"], ["limitedStock", "Limited Stock"], ["bogo", "Buy One Get One"]].map(([k, l]) => (
                    <label key={k} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40">
                      <Checkbox checked={form.watch(k as keyof Form) as boolean} onCheckedChange={(v) => form.setValue(k as keyof Form, !!v as never)} />
                      <span className="text-sm font-medium">{l}</span>
                    </label>
                  ))}
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-10 hover:bg-muted/40">
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <div className="text-sm font-medium">Upload images</div>
                    <div className="text-xs text-muted-foreground">Multiple files supported</div>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((src, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                        <img src={src} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2"><Label>Video URL (optional)</Label><Input placeholder="https://…" /></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} className="rounded-xl">
            {step > 0 ? "Back" : "Cancel"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="rounded-xl">Next</Button>
          ) : (
            <Button type="submit" className="rounded-xl">{existing ? "Save changes" : "Publish product"}</Button>
          )}
        </div>
      </form>
    </div>
  );
}
