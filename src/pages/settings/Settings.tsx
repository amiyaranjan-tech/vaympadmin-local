import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import useAuth from "@/hooks/useAuth";
import useSettings from "@/hooks/useSettings";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({ name: z.string().min(2), email: z.string().email() });
const passwordSchema = z.object({
  current: z.string().min(1, "Required"),
  next: z.string().min(6, "Min 6 chars"),
  confirm: z.string().min(6),
}).refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
const bizSchema = z.object({ companyName: z.string().min(2), supportEmail: z.string().email(), commissionRate: z.coerce.number().min(0).max(100), address: z.string().min(3) });

export default function Settings() {
  const { admin } = useAuth();
  const { theme, toggle } = useTheme();
  const { settings, updateSettings } = useSettings();

  const pForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: admin?.username ?? "", email: admin?.email ?? "" } });
  const pwForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { current: "", next: "", confirm: "" } });
  const bForm = useForm<z.infer<typeof bizSchema>>({ resolver: zodResolver(bizSchema), defaultValues: { companyName: "Vaymp", supportEmail: "", commissionRate: 10, address: "" } });

  useEffect(() => {
    if (settings) {
      bForm.reset({
        companyName: settings.companyName,
        supportEmail: settings.supportEmail,
        commissionRate: settings.commissionRate,
        address: settings.address,
      });
    }
  }, [settings, bForm]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, security, and business preferences." />

      <Tabs defaultValue="profile">
        <TabsList className="rounded-xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft">
            <form onSubmit={pForm.handleSubmit(() => toast.success("Profile updated"))} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input {...pForm.register("name")} /></div>
              <div className="space-y-2"><Label>Email</Label><Input {...pForm.register("email")} /></div>
              <div className="md:col-span-2 flex justify-end"><Button type="submit" className="rounded-xl">Save changes</Button></div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft">
            <form onSubmit={pwForm.handleSubmit(() => { toast.success("Password updated"); pwForm.reset(); })} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label>Current</Label><Input type="password" {...pwForm.register("current")} /></div>
              <div className="space-y-2"><Label>New</Label><Input type="password" {...pwForm.register("next")} />{pwForm.formState.errors.next && <p className="text-xs text-destructive">{pwForm.formState.errors.next.message}</p>}</div>
              <div className="space-y-2"><Label>Confirm</Label><Input type="password" {...pwForm.register("confirm")} />{pwForm.formState.errors.confirm && <p className="text-xs text-destructive">{pwForm.formState.errors.confirm.message}</p>}</div>
              <div className="md:col-span-3 flex justify-end"><Button type="submit" className="rounded-xl">Update password</Button></div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div><div className="text-sm font-semibold">Dark mode</div><div className="text-xs text-muted-foreground">Switch between light and dark appearance.</div></div>
              <Switch checked={theme === "dark"} onCheckedChange={toggle} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft space-y-4">
            {[["Order updates", "Get notified when orders change status."], ["New sellers", "When a new seller signs up."], ["Refund requests", "Alert on new refund tickets."]].map(([t, d]) => (
              <div key={t} className="flex items-center justify-between border-b border-border/60 pb-4 last:border-0">
                <div><div className="text-sm font-medium">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                <Switch defaultChecked onCheckedChange={() => toast.success("Preference saved")} />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="business" className="mt-4">
          <Card className="rounded-2xl p-6 shadow-soft">
            <form onSubmit={bForm.handleSubmit((v) => updateSettings(v))} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Company name</Label><Input {...bForm.register("companyName")} /></div>
              <div className="space-y-2"><Label>Support email</Label><Input {...bForm.register("supportEmail")} /></div>
              <div className="space-y-2">
                <Label>Default commission %</Label>
                <Input type="number" {...bForm.register("commissionRate")} />
                <p className="text-xs text-muted-foreground">
                  Applied to any seller without their own commission rate override.
                </p>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea rows={3} {...bForm.register("address")} /></div>
              <div className="md:col-span-2 flex justify-end"><Button type="submit" className="rounded-xl" disabled={bForm.formState.isSubmitting}>Save business settings</Button></div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
