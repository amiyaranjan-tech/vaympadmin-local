import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import useRiders from "@/hooks/useRiders";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RiderFormValues, riderSchema } from "./rider.schema";
import { createRiderPayload } from "./rider.mapper";

const VEHICLE_TYPES = [
  { value: "bike", label: "Bike" },
  { value: "scooter", label: "Scooter" },
  { value: "cycle", label: "Cycle" },
] as const;

export default function RiderForm() {
  const navigate = useNavigate();

  const { createRider } = useRiders();

  const form = useForm<RiderFormValues>({
    resolver: zodResolver(riderSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      vehicleType: "bike",
      vehicleNumber: "",
    },
  });

  const onSubmit = async (values: RiderFormValues) => {
    try {
      await createRider(createRiderPayload(values));

      navigate("/riders");
    } catch {
      // useRiders already surfaces a toast on failure.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Rider"
        description="Create a rider account. The rider starts as pending and must be verified before they can go online."
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-3"
      >
        <Card className="rounded-2xl p-6 shadow-soft lg:col-span-2">
          <div className="mb-5 text-sm font-semibold">Rider Information</div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>

              <Input {...form.register("name")} />

              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
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
              <Label>Email</Label>

              <Input type="email" {...form.register("email")} />

              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Password</Label>

              <Input type="password" {...form.register("password")} />

              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vehicle Type</Label>

              <Select
                value={form.watch("vehicleType")}
                onValueChange={(v) =>
                  form.setValue("vehicleType", v as RiderFormValues["vehicleType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>

                <SelectContent>
                  {VEHICLE_TYPES.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.formState.errors.vehicleType && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.vehicleType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vehicle Number</Label>

              <Input
                placeholder="e.g. MH12AB1234"
                className="uppercase"
                {...form.register("vehicleNumber")}
              />

              {form.formState.errors.vehicleNumber && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.vehicleNumber.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 lg:col-span-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate("/riders")}
          >
            Cancel
          </Button>

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
            ) : (
              "Create Rider"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
