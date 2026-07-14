import { Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { formatCurrency } from "@/utils/format";

import { UserTableProps } from "./types";

export function UserTable({ users, onView }: UserTableProps) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">User</th>

              <th className="px-4 py-3 text-left font-medium">User ID</th>

              <th className="px-4 py-3 text-left font-medium">City</th>

              <th className="px-4 py-3 text-center font-medium">Orders</th>

              <th className="px-4 py-3 text-right font-medium">Total Spend</th>

              <th className="px-4 py-3 text-center font-medium">Wishlist</th>

              <th className="px-4 py-3 text-center font-medium">
                Customer Type
              </th>

              <th className="px-4 py-3 text-left font-medium">Joined</th>

              <th className="px-4 py-3 text-center font-medium">Status</th>

              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const customerType =
                  user.totalOrders >= 20
                    ? "VIP"
                    : user.totalOrders >= 5
                      ? "Returning"
                      : "New";

                return (
                  <tr
                    key={user.id}
                    className="border-t border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />

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

                    <td className="px-4 py-3 font-mono text-xs">{user.id}</td>

                    <td className="px-4 py-3">{user.city}</td>

                    <td className="px-4 py-3 text-center">
                      {user.totalOrders}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(user.totalSpend)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">{user.wishlist.length}</Badge>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          customerType === "VIP"
                            ? "default"
                            : customerType === "Returning"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {customerType}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "destructive"
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
