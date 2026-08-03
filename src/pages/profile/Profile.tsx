import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Profile() {
  const { admin } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your admin account overview." />
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="h-32 bg-gradient-to-r from-primary via-primary/70 to-secondary" />
        <div className="p-6">
          <div className="-mt-16 flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-card"><AvatarImage src={admin?.avatar} /><AvatarFallback>AD</AvatarFallback></Avatar>
            <div className="pb-2">
              <div className="text-2xl font-bold">{admin?.username}</div>
              <div className="text-sm text-muted-foreground">{admin?.email} · Marketplace administrator</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline">Super Admin</Badge>
            <Badge variant="outline">2FA enabled</Badge>
            <Badge variant="outline">Since 2024</Badge>
          </div>
          <div className="mt-6 flex gap-2">
            <Button asChild className="rounded-xl"><Link to="/settings">Edit profile</Link></Button>
            <Button asChild variant="outline" className="rounded-xl"><Link to="/settings">Security</Link></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
