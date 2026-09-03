import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/utils/format";
import { Send, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import useNotificationBroadcasts from "@/hooks/useNotificationBroadcasts";
import useNotifications from "@/hooks/useNotifications";
import { BROADCAST_TYPES } from "@/types/notification";
import type { AudienceType } from "@/types/notification";

const schema = z.object({
  type: z.string().min(1, "Choose a type"),
  title: z.string().min(2),
  body: z.string().min(5),
  audienceType: z.enum(["ALL_CONSUMERS", "SPECIFIC_CONSUMER", "SELECTED_CONSUMERS"]),
  userId: z.string().optional(),
  userIds: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const STATUS_VARIANT: Record<string, "default" | "outline" | "secondary" | "destructive"> = {
  SENT: "default",
  PARTIAL: "secondary",
  FAILED: "destructive",
  SENDING: "outline",
  PENDING: "outline",
};

export default function Notifications() {
  const { items, loading, sending, send } = useNotificationBroadcasts();
  const {
    items: alerts,
    unreadCount: alertsUnread,
    loading: alertsLoading,
    markRead: markAlertRead,
    markAllRead: markAllAlertsRead,
  } = useNotifications();

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: BROADCAST_TYPES[0],
      title: "",
      body: "",
      audienceType: "ALL_CONSUMERS",
      userId: "",
      userIds: "",
    },
  });

  const audienceType = form.watch("audienceType") as AudienceType;

  const onSubmit = async (v: Form) => {
    const audience =
      v.audienceType === "ALL_CONSUMERS"
        ? { type: "ALL_CONSUMERS" as const }
        : v.audienceType === "SPECIFIC_CONSUMER"
          ? { type: "SPECIFIC_CONSUMER" as const, userId: v.userId?.trim() }
          : {
              type: "SELECTED_CONSUMERS" as const,
              userIds: (v.userIds ?? "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
            };

    await send({ type: v.type, title: v.title, body: v.body, audience });
    form.reset({ ...form.getValues(), title: "", body: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Send push notifications to consumers." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 text-sm font-semibold">Create notification</div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BROADCAST_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={audienceType}
                onValueChange={(v) => form.setValue("audienceType", v as AudienceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_CONSUMERS">All consumers</SelectItem>
                  <SelectItem value="SPECIFIC_CONSUMER">One consumer (by id)</SelectItem>
                  <SelectItem value="SELECTED_CONSUMERS">Selected consumers (by id)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Message</Label>
              <Textarea rows={3} {...form.register("body")} />
              {form.formState.errors.body && (
                <p className="text-xs text-destructive">{form.formState.errors.body.message}</p>
              )}
            </div>

            {audienceType === "SPECIFIC_CONSUMER" && (
              <div className="space-y-2 md:col-span-2">
                <Label>User id</Label>
                <Input {...form.register("userId")} placeholder="Mongo user _id" />
              </div>
            )}

            {audienceType === "SELECTED_CONSUMERS" && (
              <div className="space-y-2 md:col-span-2">
                <Label>User ids (comma-separated)</Label>
                <Textarea rows={2} {...form.register("userIds")} placeholder="id1, id2, id3" />
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="rounded-xl" disabled={sending}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send now"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="rounded-2xl p-6 shadow-soft">
          <div className="mb-4 text-sm font-semibold">Notification history</div>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications sent yet.
            </div>
          ) : (
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {items.map((n) => (
                <div key={n._id} className="rounded-xl border border-border/60 p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-primary" />
                      <div className="text-sm font-medium">{n.title}</div>
                    </div>
                    <Badge variant={STATUS_VARIANT[n.status] ?? "outline"} className="text-[10px]">
                      {n.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">{n.body}</div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {n.successCount}/{n.targetCount} delivered
                      {n.failureCount > 0 ? ` · ${n.failureCount} failed` : ""}
                    </span>
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="rounded-2xl p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">
            Your alerts{alertsUnread > 0 ? ` (${alertsUnread} unread)` : ""}
          </div>

          {alertsUnread > 0 && (
            <Button variant="ghost" size="sm" onClick={() => void markAllAlertsRead()}>
              Mark all read
            </Button>
          )}
        </div>

        {alertsLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
        ) : alerts.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No operational alerts yet.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {alerts.map((alert) => (
              <button
                key={alert._id}
                onClick={() => !alert.readAt && void markAlertRead(alert._id)}
                className={`rounded-xl border p-3 text-left text-sm ${
                  alert.readAt ? "border-border/60" : "border-primary/40 bg-primary/5"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{alert.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {alert.type.replaceAll("_", " ")}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{alert.body}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {formatDateTime(alert.createdAt)}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
