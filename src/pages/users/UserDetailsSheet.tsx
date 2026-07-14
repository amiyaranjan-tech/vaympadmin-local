import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { orders as ordersMock, products } from "@/data/mock";
import { formatCurrency, formatDate } from "@/utils/format";

import { UserDetailsSheetProps } from "./types";

export function UserDetailsSheet({
  user,
  open,
  onOpenChange,
}: UserDetailsSheetProps) {
  if (!user) return null;

  const userOrders = ordersMock.filter((order) => order.customerId === user.id);

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
              <AvatarImage src={user.avatar} />

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
            <Info label="User ID" value={user.id} />

            <div className="rounded-xl bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Status</div>

              <Badge variant="outline" className="mt-1 capitalize">
                {user.status}
              </Badge>
            </div>

            <Info label="Total Spend" value={formatCurrency(user.totalSpend)} />

            <Info label="Orders" value={user.totalOrders} />

            <Info
              label="Instagram"
              value={`@${user.name.toLowerCase().replace(/\s+/g, "")}`}
            />

            <Info label="Joined On" value={formatDate(user.createdAt)} />

            <Info
              label="Subscription Start"
              value={formatDate(user.createdAt)}
            />

            <Info
              className="col-span-2"
              label="Subscription End"
              value={formatDate(
                new Date(
                  new Date(user.createdAt).getTime() +
                    365 * 24 * 60 * 60 * 1000,
                ).toISOString(),
              )}
            />
          </div>

          {/* Address */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Address
            </h4>

            <div className="rounded-xl bg-muted/40 p-3 text-sm">
              {user.address}, {user.city}
            </div>
          </section>

          {/* Orders */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Orders
            </h4>

            <div className="space-y-2">
              {userOrders.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No orders found.
                </div>
              ) : (
                userOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 p-3"
                  >
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>

                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="font-semibold">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Wishlist */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Wishlist
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {user.wishlist.map((productId) => {
                const product = products.find((item) => item.id === productId);

                if (!product) return null;

                return (
                  <div
                    key={productId}
                    className="rounded-xl border border-border/60 p-2"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-20 w-full rounded-lg object-cover"
                    />

                    <div className="mt-2 truncate text-xs font-medium">
                      {product.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(product.discountPrice)}
                    </div>
                  </div>
                );
              })}
            </div>
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
    <div className={`rounded-xl bg-muted/40 p-3 ${className}`}>
      <div className="text-xs text-muted-foreground">{label}</div>

      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
