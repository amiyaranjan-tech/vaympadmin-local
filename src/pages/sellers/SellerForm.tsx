import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import useSellers from "@/hooks/useSellers";

import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import SellerBasicForm from "./SellerBasicForm";
import { SellerFormValues, sellerSchema } from "./seller.schema";
import { createSellerPayload, updateSellerPayload } from "./seller.mapper";

export default function SellerForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const { getSeller, createSeller, updateSeller } = useSellers();

  const [loadingSeller, setLoadingSeller] = useState(isEdit);

  /**
   * ==========================================
   * React Hook Form
   * ==========================================
   */

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),

    defaultValues: {
      shopName: "",
      ownerName: "",
      shopCategory: "",
      email: "",
      password: "",

      phone: "",

      address: "",
      city: "",

      gstNumber: "",
      businessRegistration: "",

      description: "",

      workingDays: "Mon,Tue,Wed,Thu,Fri",

      workingOpen: "09:00",
      workingClose: "18:00",

      accountName: "",
      accountNumber: "",
      ifsc: "",

      commissionRate: "",
    },
  });

  /**
   * ==========================================
   * Load Seller (Edit)
   * ==========================================
   */

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadSeller = async () => {
      try {
        setLoadingSeller(true);

        const seller = await getSeller(id);

        form.reset({
          shopName: seller.shopName,

          ownerName: seller.ownerName,

          shopCategory: seller.shopCategory ?? "",

          email: seller.email,

          password: "",

          phone: seller.phone,

          address: seller.address,

          city: seller.city,

          gstNumber: seller.gstNumber,

          businessRegistration: seller.businessRegistration,

          description: seller.description ?? "",

          workingDays: seller.workingDays.join(","),

          workingOpen: seller.workingHours.open,

          workingClose: seller.workingHours.close,

          accountName: seller.bank.accountName,

          accountNumber: seller.bank.accountNumber,

          ifsc: seller.bank.ifsc,

          commissionRate:
            seller.commissionRate === null ? "" : String(seller.commissionRate),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load seller",
        );

        navigate("/sellers");
      } finally {
        setLoadingSeller(false);
      }
    };

    void loadSeller();
  }, [id, form, getSeller, navigate]);

  /**
   * ==========================================
   * Loading Screen
   * ==========================================
   */

  if (loadingSeller) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /**
   * ==========================================
   * Submit Handler
   * (Continue in Part 2)
   * ==========================================
   */
const onSubmit = async (values: SellerFormValues) => {
  try {
    if (isEdit && id) {
      await updateSeller(id, updateSellerPayload(values));
    } else {
      await createSeller(createSellerPayload(values));
    }

    navigate("/sellers");
  } catch {
    // useSellers already surfaces a toast for create/update failures.
  }
};

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Seller" : "Add Seller"}
        description={
          isEdit
            ? "Manage seller information. Verification and status are managed from the seller list or details page."
            : "Manage seller information. The seller starts as pending and must be verified before it goes live."
        }
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-3"
      >
        <SellerBasicForm form={form} existing={isEdit} />

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Brand Assets</div>

          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 transition hover:bg-muted/40">
              <Upload className="mb-2 h-5 w-5 text-muted-foreground" />

              <div className="text-sm font-medium">Upload Logo</div>

              <div className="text-xs text-muted-foreground">
                PNG / JPG (Coming Soon)
              </div>

              <input type="file" className="hidden" disabled />
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 transition hover:bg-muted/40">
              <Upload className="mb-2 h-5 w-5 text-muted-foreground" />

              <div className="text-sm font-medium">Upload Cover</div>

              <div className="text-xs text-muted-foreground">
                Wide Banner (Coming Soon)
              </div>

              <input type="file" className="hidden" disabled />
            </label>
          </div>

          <div className="mt-6 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
            Image upload will be connected after Cloudinary integration.
          </div>
        </Card>

        <div className="flex justify-end gap-3 lg:col-span-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate("/sellers")}
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
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Seller"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}