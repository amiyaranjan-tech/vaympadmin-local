import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ClipboardCheck, Eye, PackageCheck, Rocket } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import useProducts from "@/hooks/useProducts";
import useSellers from "@/hooks/useSellers";
import { formatCurrency, formatDate } from "@/utils/format";

import { Product } from "./types";
import { ProductDetailsSheet } from "./ProductDetailsSheet";

// Every currently-active seller, once — same low-volume-admin-list
// reasoning as Products.tsx's own useSellers({ limit: 100 }) call, used
// here purely to resolve each product's `seller` id to a shop name.
const SELLERS_LIST_PARAMS = { limit: 100 };

interface ApprovalRowProps {
  product: Product;
  shopName: string;
  actionLabel: string;
  actionIcon: typeof Check;
  onAction: (id: string) => void;
  onView: (product: Product) => void;
  pending: boolean;
}

function ApprovalRow({
  product,
  shopName,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  onView,
  pending,
}: ApprovalRowProps) {
  return (
    <Card className="flex flex-col gap-4 rounded-2xl p-4 shadow-soft sm:flex-row sm:items-center">
      <img
        src={product.images[0]?.url}
        alt={product.name}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{product.name}</div>

        <div className="truncate text-xs text-muted-foreground">
          {product.brand} · {product.category} · {shopName}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{formatCurrency(product.finalPrice)}</Badge>
          <span>Submitted {formatDate(product.updatedAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => onView(product)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>

        <Button
          size="sm"
          className="rounded-lg"
          disabled={pending}
          onClick={() => onAction(product._id)}
        >
          <ActionIcon className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

export default function ProductApprovals() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingReview = useProducts({ status: "pending_review", limit: 100 });
  const approved = useProducts({ status: "approved", limit: 100 });
  const { sellers } = useSellers(SELLERS_LIST_PARAMS);

  const shopName = (sellerId: string | null) =>
    sellers.find((seller) => seller._id === sellerId)?.shopName ?? "Unassigned";

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setOpenDetails(true);
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);

    try {
      await pendingReview.updateStatus(id, "approved");
      await pendingReview.refresh();
      await approved.refresh();
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublish = async (id: string) => {
    setProcessingId(id);

    try {
      await approved.updateStatus(id, "published");
      await approved.refresh();
    } finally {
      setProcessingId(null);
    }
  };

  // The details sheet's own "Move to..." selector (driven by
  // STATUS_TRANSITIONS) already covers reject/send-back-to-draft — no
  // need to duplicate that here, just refresh whichever queue the
  // product just left.
  const handleSheetStatusChange = async (id: string, status: string) => {
    setProcessingId(id);

    try {
      const updated =
        selectedProduct?.status === "pending_review"
          ? await pendingReview.updateStatus(id, status as never)
          : await approved.updateStatus(id, status as never);

      setSelectedProduct(updated);
      await pendingReview.refresh();
      await approved.refresh();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Approvals"
        description="Review products submitted by sellers, then approve and publish them to the marketplace."
        actions={
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/products">Back to Catalog</Link>
          </Button>
        }
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingReview.total > 0 && (
              <Badge className="ml-2" variant="secondary">
                {pendingReview.total}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="approved">
            Ready to Publish
            {approved.total > 0 && (
              <Badge className="ml-2" variant="secondary">
                {approved.total}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingReview.loading ? (
            <CardGridSkeleton count={3} className="space-y-3" />
          ) : pendingReview.products.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Nothing waiting for review"
              description="Products a seller submits for review will show up here."
            />
          ) : (
            pendingReview.products.map((product) => (
              <ApprovalRow
                key={product._id}
                product={product}
                shopName={shopName(product.seller)}
                actionLabel="Approve"
                actionIcon={Check}
                onAction={handleApprove}
                onView={handleView}
                pending={processingId === product._id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-3">
          {approved.loading ? (
            <CardGridSkeleton count={3} className="space-y-3" />
          ) : approved.products.length === 0 ? (
            <EmptyState
              icon={PackageCheck}
              title="Nothing waiting to publish"
              description="Products you approve will show up here until they're published."
            />
          ) : (
            approved.products.map((product) => (
              <ApprovalRow
                key={product._id}
                product={product}
                shopName={shopName(product.seller)}
                actionLabel="Publish"
                actionIcon={Rocket}
                onAction={handlePublish}
                onView={handleView}
                pending={processingId === product._id}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <ProductDetailsSheet
        open={openDetails}
        onOpenChange={setOpenDetails}
        product={selectedProduct}
        onStatusChange={handleSheetStatusChange}
      />
    </div>
  );
}
