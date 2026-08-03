import type { UseFormReturn } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";

import useDropdownOptions from "@/hooks/useDropdownOptions";
import useSettings from "@/hooks/useSettings";
import { WEEKDAYS_LIST } from "@/data/mock";

import type { SellerFormValues } from "./seller.schema";

interface Props {
  form: UseFormReturn<SellerFormValues>;
  existing: boolean;
}

export default function SellerBasicForm({ form, existing }: Props) {
  const { options, addOption } = useDropdownOptions();
  const { settings } = useSettings();

  return (
    <Card className="rounded-2xl p-6 shadow-soft lg:col-span-2">
      <div className="mb-5 text-sm font-semibold">Shop Information</div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Shop Name</Label>

          <Input {...form.register("shopName")} />

          {form.formState.errors.shopName && (
            <p className="text-xs text-destructive">
              {form.formState.errors.shopName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Owner Name</Label>

          <Input {...form.register("ownerName")} />

          {form.formState.errors.ownerName && (
            <p className="text-xs text-destructive">
              {form.formState.errors.ownerName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Shop Category</Label>

          <Input
            placeholder="e.g. Clothing & Fashion, Footwear, Accessories"
            {...form.register("shopCategory")}
          />

          {form.formState.errors.shopCategory && (
            <p className="text-xs text-destructive">
              {form.formState.errors.shopCategory.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>

          <Input type="email" {...form.register("email")} />

          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            {existing ? "Password (Leave blank to keep current)" : "Password"}
          </Label>

          <Input type="password" {...form.register("password")} />

          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>

          <Input {...form.register("phone")} />

          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>City</Label>

          <Combobox
            value={form.watch("city")}
            onChange={(v) => form.setValue("city", v)}
            onCreate={(v) => addOption({ field: "city", value: v })}
            options={options.cities}
            placeholder="Select or add a city"
          />

          {form.formState.errors.city && (
            <p className="text-xs text-destructive">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>GST Number</Label>

          <Input {...form.register("gstNumber")} />

          {form.formState.errors.gstNumber && (
            <p className="text-xs text-destructive">
              {form.formState.errors.gstNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Business Registration</Label>

          <Input {...form.register("businessRegistration")} />

          {form.formState.errors.businessRegistration && (
            <p className="text-xs text-destructive">
              {form.formState.errors.businessRegistration.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Working Days</Label>

          <MultiCombobox
            values={form
              .watch("workingDays")
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)}
            onChange={(vals) => form.setValue("workingDays", vals.join(","))}
            options={WEEKDAYS_LIST}
            allowCreate={false}
            placeholder="Select working days"
          />

          {form.formState.errors.workingDays && (
            <p className="text-xs text-destructive">
              {form.formState.errors.workingDays.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Opening Time</Label>

          <Input type="time" {...form.register("workingOpen")} />

          {form.formState.errors.workingOpen && (
            <p className="text-xs text-destructive">
              {form.formState.errors.workingOpen.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Closing Time</Label>

          <Input type="time" {...form.register("workingClose")} />

          {form.formState.errors.workingClose && (
            <p className="text-xs text-destructive">
              {form.formState.errors.workingClose.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Address</Label>

          <Textarea rows={4} {...form.register("address")} />

          {form.formState.errors.address && (
            <p className="text-xs text-destructive">
              {form.formState.errors.address.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Shop Description</Label>

          <Textarea
            rows={4}
            placeholder="Shown to customers on the shop's About section"
            {...form.register("description")}
          />

          {form.formState.errors.description && (
            <p className="text-xs text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 mt-8 text-sm font-semibold">Commission</div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Commission Rate Override (%)</Label>

          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            placeholder={
              settings
                ? `Leave blank to use platform default (${settings.commissionRate}%)`
                : "Leave blank to use platform default"
            }
            {...form.register("commissionRate")}
          />

          {form.formState.errors.commissionRate && (
            <p className="text-xs text-destructive">
              {form.formState.errors.commissionRate.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 mt-8 text-sm font-semibold">Bank Details</div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Account Name</Label>

          <Input {...form.register("accountName")} />

          {form.formState.errors.accountName && (
            <p className="text-xs text-destructive">
              {form.formState.errors.accountName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Account Number</Label>

          <Input {...form.register("accountNumber")} />

          {form.formState.errors.accountNumber && (
            <p className="text-xs text-destructive">
              {form.formState.errors.accountNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>IFSC</Label>

          <Input className="uppercase" {...form.register("ifsc")} />

          {form.formState.errors.ifsc && (
            <p className="text-xs text-destructive">
              {form.formState.errors.ifsc.message}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
