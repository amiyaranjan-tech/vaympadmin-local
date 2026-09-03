import { Copy, Eye } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TableRowSkeleton } from "@/components/common/Skeletons";

import { formatDate } from "@/utils/format";

import { UserTableProps } from "./types";

function copyUserId(id: string) {
  void navigator.clipboard.writeText(id).then(() => toast.success("User ID copied"));
}

export function UserTable({ users, onView, loading }: UserTableProps & { loading?: boolean }) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>

              <th className="px-4 py-3 text-left font-medium">User ID</th>

              <th className="px-4 py-3 text-left font-medium">Phone</th>

              <th className="px-4 py-3 text-left font-medium">City</th>

              <th className="px-4 py-3 text-center font-medium">Verified</th>

              <th className="px-4 py-3 text-left font-medium">Joined</th>

              <th className="px-4 py-3 text-center font-medium">Status</th>

              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableRowSkeleton rows={6} cols={8} />
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const defaultAddress =
                  user.addresses.find((address) => address.isDefault) ??
                  user.addresses[0];

                return (
                  <tr
                    key={user._id}
                    className="border-t border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar?.url} />

                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-medium">{user.name}</div>

                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyUserId(user._id)}
                        className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                        title="Copy user ID"
                      >
                        {user._id}
                        <Copy className="h-3 w-3 shrink-0" />
                      </button>
                    </td>

                    <td className="px-4 py-3">{user.phone}</td>

                    <td className="px-4 py-3">
                      {defaultAddress?.city ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge variant={user.isVerified ? "default" : "outline"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "suspended"
                              ? "secondary"
                              : "destructive"
                        }
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
