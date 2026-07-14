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
import { sellers } from "@/data/mock";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const schema = z.object({
  shopName: z.string().min(2, "Required"),
  ownerName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters").optional().or(z.literal("")),
  phone: z.string().min(10, "Invalid phone"),
  address: z.string().min(3, "Required"),
  gst: z.string().min(5, "Required"),
  businessReg: z.string().min(3, "Required"),
  workingDays: z.string().min(2),
  workingHours: z.string().min(2),
  accountName: z.string().min(2),
  accountNumber: z.string().min(6),
  ifsc: z.string().min(5),
});
type Form = z.infer<typeof schema>;

export default function SellerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = id ? sellers.find((s) => s.id === id) : undefined;

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: existing ? {
      shopName: existing.shopName, ownerName: existing.ownerName, email: existing.email, password: "",
      phone: existing.phone, address: existing.address, gst: existing.gst, businessReg: existing.businessReg,
      workingDays: existing.workingDays.join(", "), workingHours: existing.workingHours,
      accountName: existing.bank.accountName, accountNumber: existing.bank.accountNumber, ifsc: existing.bank.ifsc,
    } : {
      shopName: "", ownerName: "", email: "", password: "", phone: "", address: "",
      gst: "", businessReg: "", workingDays: "Mon, Tue, Wed, Thu, Fri, Sat", workingHours: "10:00 AM – 9:00 PM",
      accountName: "", accountNumber: "", ifsc: "",
    },
  });

  const onSubmit = (v: Form) => {
    void v;
    toast.success(existing ? "Seller updated" : "Seller created");
    navigate("/sellers");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={existing ? "Edit seller" : "Add seller"}
        description="Onboard a new hyperlocal fashion shop to Vaymp."
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 text-sm font-semibold">Shop information</div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["shopName", "Shop Name"],
              ["ownerName", "Owner Name"],
              ["email", "Email"],
              ["password", existing ? "Password (leave blank to keep)" : "Password"],
              ["phone", "Phone"],
              ["gst", "GST Number"],
              ["businessReg", "Business Registration"],
              ["workingDays", "Working Days"],
              ["workingHours", "Working Hours"],
            ].map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label>{label}</Label>
                <Input {...form.register(name as keyof Form)} />
                {form.formState.errors[name as keyof Form] && <p className="text-xs text-destructive">{form.formState.errors[name as keyof Form]?.message as string}</p>}
              </div>
            ))}
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea rows={3} {...form.register("address")} />
            </div>
          </div>

          <div className="mt-8 mb-4 text-sm font-semibold">Bank details</div>
          <div className="grid gap-4 md:grid-cols-3">
            {[["accountName", "Account Name"], ["accountNumber", "Account Number"], ["ifsc", "IFSC"]].map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label>{label}</Label>
                <Input {...form.register(name as keyof Form)} />
                {form.formState.errors[name as keyof Form] && <p className="text-xs text-destructive">{form.formState.errors[name as keyof Form]?.message as string}</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Brand assets</div>
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:bg-muted/40">
              <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">Upload logo</div>
              <div className="text-xs text-muted-foreground">PNG / JPG, square recommended</div>
              <input type="file" className="hidden" onChange={() => toast.success("Logo selected")} />
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:bg-muted/40">
              <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">Upload cover</div>
              <div className="text-xs text-muted-foreground">Wide banner, 3:1 ratio</div>
              <input type="file" className="hidden" onChange={() => toast.success("Cover selected")} />
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-2 lg:col-span-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-xl">Cancel</Button>
          <Button type="submit" className="rounded-xl">{existing ? "Save changes" : "Create seller"}</Button>
        </div>
      </form>
    </div>
  );
}
