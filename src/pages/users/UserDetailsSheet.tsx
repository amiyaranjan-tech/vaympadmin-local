import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { formatDate } from "@/utils/format";

import { UserDetailsSheetProps } from "./types";

export function UserDetailsSheet({
  user,
  open,
  onOpenChange,
}: UserDetailsSheetProps) {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{user.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.avatar?.url} />

              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            <div>
              <div className="font-semibold">{user.name}</div>

              <div className="text-xs text-muted-foreground">
                {user.email} • {user.phone}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Status</div>

              <Badge variant="outline" className="mt-1 capitalize">
                {user.status}
              </Badge>
            </div>

            <div className="rounded-xl bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Verified</div>

              <Badge
                variant={user.isVerified ? "default" : "outline"}
                className="mt-1"
              >
                {user.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>

            <Info label="Gender" value={user.gender} className="capitalize" />

            <Info
              label="Date of Birth"
              value={user.dob ? formatDate(user.dob) : "—"}
            />

            <Info label="Joined On" value={formatDate(user.createdAt)} />

            <Info
              label="Last Login"
              value={user.lastLogin ? formatDate(user.lastLogin) : "Never"}
            />
          </div>

          {/* Addresses */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Addresses
            </h4>

            {user.addresses.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No addresses saved.
              </div>
            ) : (
              <div className="space-y-2">
                {user.addresses.map((address, index) => (
                  <div
                    key={address._id ?? index}
                    className="rounded-xl bg-muted/40 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{address.label}</span>

                      {address.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                      {address.state} {address.pincode}, {address.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface InfoProps {
  label: string;
  value: string | number;
  className?: string;
}

function Info({ label, value, className = "" }: InfoProps) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>

      <div className={`mt-1 font-semibold ${className}`}>{value}</div>
    </div>
  );
}
