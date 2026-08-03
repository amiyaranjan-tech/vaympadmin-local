import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TierRowsFormValues } from "./offer.schema";

const TIER_TYPE_LABELS: Record<TierRowsFormValues["tiers"][number]["type"], string> = {
  tier_amount: "Flat Amount Off",
  tier_percentage: "Percentage Off",
  free_shipping: "Free Shipping",
};

const EMPTY_ROW: TierRowsFormValues["tiers"][number] = {
  title: "",
  description: "",
  type: "tier_amount",
  minSpend: 999,
  discountAmount: 0,
  discountPercent: 0,
  maximumDiscount: "",
  maxUses: "",
  isEnabled: true,
  priority: 0,
  startDate: "",
  endDate: "",
};

interface TierRowsFieldProps {
  form: UseFormReturn<TierRowsFormValues>;
}

/**
 * Repeatable tier-row builder for one shop's Tiered Deals — first
 * useFieldArray usage in this codebase. Each row is an independent
 * tier_amount/tier_percentage/free_shipping Offer; the whole array is
 * submitted as one bulk replace-by-seller upsert (see
 * offer.service.ts#bulkUpsertTiered) — a row without `_id` creates a new
 * Offer, one with `_id` updates in place, and any of the seller's
 * existing tiers left out entirely get soft-deleted server-side.
 */
export function TierRowsField({ form }: TierRowsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const type = form.watch(`tiers.${index}.type`);
        const errors = form.formState.errors.tiers?.[index];

        return (
          <Card key={field.id} className="space-y-4 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Tier {index + 1}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input placeholder="Spend ₹999, Get Free Shipping" {...form.register(`tiers.${index}.title`)} />
                {errors?.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reward Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) =>
                    form.setValue(
                      `tiers.${index}.type`,
                      v as TierRowsFormValues["tiers"][number]["type"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Minimum Spend (₹)</Label>
                <Input type="number" min={0} {...form.register(`tiers.${index}.minSpend`)} />
              </div>

              {type === "tier_amount" && (
                <div className="space-y-2">
                  <Label>Discount Amount (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    {...form.register(`tiers.${index}.discountAmount`)}
                  />
                  {errors?.discountAmount && (
                    <p className="text-xs text-destructive">{errors.discountAmount.message}</p>
                  )}
                </div>
              )}

              {type === "tier_percentage" && (
                <>
                  <div className="space-y-2">
                    <Label>Discount Percent</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...form.register(`tiers.${index}.discountPercent`)}
                    />
                    {errors?.discountPercent && (
                      <p className="text-xs text-destructive">
                        {errors.discountPercent.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Max Discount Cap (optional)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Uncapped"
                      {...form.register(`tiers.${index}.maximumDiscount`)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Usage Cap (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Uncapped"
                  {...form.register(`tiers.${index}.maxUses`)}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Input type="number" {...form.register(`tiers.${index}.priority`)} />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" {...form.register(`tiers.${index}.startDate`)} />
                {errors?.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" {...form.register(`tiers.${index}.endDate`)} />
                {errors?.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 md:col-span-2">
                <Label>Enabled</Label>
                <Switch
                  checked={form.watch(`tiers.${index}.isEnabled`)}
                  onCheckedChange={(v) => form.setValue(`tiers.${index}.isEnabled`, v)}
                />
              </div>
            </div>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        onClick={() => append(EMPTY_ROW)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add another tier
      </Button>
    </div>
  );
}
