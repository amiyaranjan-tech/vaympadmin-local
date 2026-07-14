import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notifications as notifMock, CITIES_LIST } from "@/data/mock";
import { formatDateTime } from "@/utils/format";
import { Send, Upload, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(2), message: z.string().min(5), target: z.string(),
  city: z.string().optional(), ctaLabel: z.string().optional(), ctaUrl: z.string().optional(),
  scheduledAt: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function Notifications() {
  const [list, setList] = useState(notifMock);
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { title: "", message: "", target: "platform", city: "", ctaLabel: "", ctaUrl: "", scheduledAt: "" } });

  const send = (v: Form) => {
    setList([{ id: `nt_${Date.now()}`, title: v.title, message: v.message, target: v.target as any, city: v.city, ctaLabel: v.ctaLabel, ctaUrl: v.ctaUrl, scheduledAt: v.scheduledAt, createdAt: new Date().toISOString(), status: v.scheduledAt ? "scheduled" : "sent" }, ...list]);
    toast.success(v.scheduledAt ? "Notification scheduled" : "Notification sent");
    form.reset();
  };

  const target = form.watch("target");

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Broadcast updates to the marketplace." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 text-sm font-semibold">Create notification</div>
          <form onSubmit={form.handleSubmit(send)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...form.register("title")} />{form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}</div>
            <div className="space-y-2 md:col-span-2"><Label>Message</Label><Textarea rows={3} {...form.register("message")} />{form.formState.errors.message && <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>}</div>
            <div className="space-y-2"><Label>Target</Label>
              <Select value={target} onValueChange={(v) => form.setValue("target", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Entire platform</SelectItem>
                  <SelectItem value="sellers">Sellers</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {target === "city" && (
              <div className="space-y-2"><Label>City</Label>
                <Select value={form.watch("city") ?? ""} onValueChange={(v) => form.setValue("city", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose city" /></SelectTrigger>
                  <SelectContent>{CITIES_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2"><Label>CTA Label</Label><Input {...form.register("ctaLabel")} placeholder="Explore now" /></div>
            <div className="space-y-2"><Label>CTA URL</Label><Input {...form.register("ctaUrl")} placeholder="/deals" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Schedule (optional)</Label><Input type="datetime-local" {...form.register("scheduledAt")} /></div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 md:col-span-2 hover:bg-muted/40">
              <Upload className="mb-1 h-4 w-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Upload image (optional)</div>
              <input type="file" className="hidden" />
            </label>
            <div className="md:col-span-2 flex justify-end"><Button type="submit" className="rounded-xl"><Send className="mr-2 h-4 w-4" />{form.watch("scheduledAt") ? "Schedule" : "Send now"}</Button></div>
          </form>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Notification center</div>
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {list.map((n) => (
              <div key={n.id} className="rounded-xl border border-border/60 p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-primary" /><div className="text-sm font-medium">{n.title}</div></div>
                  <Badge variant="outline" className="capitalize text-[10px]">{n.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="capitalize">{n.target}{n.city ? ` · ${n.city}` : ""}</span>
                  <span>{formatDateTime(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
