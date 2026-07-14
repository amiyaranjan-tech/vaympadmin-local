import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events as eventsMock, sellers } from "@/data/mock";
import { formatDate } from "@/utils/format";
import { Plus, Pencil, Trash2, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(2), description: z.string().min(5),
  startDate: z.string(), endDate: z.string(), location: z.string().min(2), sellerId: z.string(), status: z.string(),
});
type Form = z.infer<typeof schema>;

export default function Events() {
  const [list, setList] = useState(eventsMock);
  const [open, setOpen] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { title: "", description: "", startDate: "", endDate: "", location: "", sellerId: sellers[0].id, status: "upcoming" } });

  const create = (v: Form) => {
    setList([{ id: `ev_${Date.now()}`, ...v, status: v.status as any, banner: "https://picsum.photos/seed/newe/900/400" }, ...list]);
    toast.success("Event created"); setOpen(false); form.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="In-store and pop-up experiences from marketplace shops."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Create event</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New event</DialogTitle></DialogHeader>
              <form onSubmit={form.handleSubmit(create)} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input {...form.register("title")} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={3} {...form.register("description")} /></div>
                <div className="space-y-2"><Label>Start</Label><Input type="date" {...form.register("startDate")} /></div>
                <div className="space-y-2"><Label>End</Label><Input type="date" {...form.register("endDate")} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Location</Label><Input {...form.register("location")} /></div>
                <div className="space-y-2"><Label>Shop</Label>
                  <Select value={form.watch("sellerId")} onValueChange={(v) => form.setValue("sellerId", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{sellers.map((s) => <SelectItem key={s.id} value={s.id}>{s.shopName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["upcoming", "live", "ended"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 md:col-span-2 hover:bg-muted/40">
                  <Upload className="mb-1 h-4 w-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">Upload event banner</div>
                  <input type="file" className="hidden" />
                </label>
                <DialogFooter className="md:col-span-2"><Button type="submit" className="rounded-xl">Create event</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => (
          <Card key={e.id} className="overflow-hidden rounded-2xl p-0 shadow-soft">
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${e.banner})` }} />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{e.location}</div>
                </div>
                <Badge variant="outline" className="capitalize">{e.status}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">{formatDate(e.startDate)} → {formatDate(e.endDate)}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Event updated")}><Pencil className="mr-1 h-3 w-3" />Edit</Button>
                <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => { setList(list.filter(x => x.id !== e.id)); toast.success("Event deleted"); }}><Trash2 className="mr-1 h-3 w-3" />Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
