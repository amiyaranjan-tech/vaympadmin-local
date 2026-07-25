import type { UseFormReturn } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { SellerFormValues } from "./seller.schema";

interface Props {
  form: UseFormReturn<SellerFormValues>;
}

export default function SellerVerificationCard({ form }: Props) {
  return (
    <Card className="rounded-2xl p-6 shadow-soft">
      <div className="mb-6">
        <h3 className="text-sm font-semibold">Seller Verification</h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Verify this seller. Verified sellers receive the verified badge
          throughout the admin panel and marketplace.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="seller-verified" className="text-sm font-medium">
            Verified Seller
          </Label>

          <p className="mt-1 text-xs text-muted-foreground">
            Enable once the seller's documents have been reviewed.
          </p>
        </div>

        <Switch
          id="seller-verified"
          checked={form.watch("isVerified")}
          onCheckedChange={(checked) =>
            form.setValue("isVerified", checked, {
              shouldDirty: true,
            })
          }
        />
      </div>
    </Card>
  );
}
