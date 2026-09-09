import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, Eye, Rocket, X } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/Skeletons";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  onApproveAndPublish: (id: string) => void;
  onReject: (product: Product) => void;
  onView: (product: Product) => void;
  pending: boolean;
}

function ApprovalRow({
  product,
  shopName,
  onApproveAndPublish,
  onReject,
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
          variant="outline"
          size="sm"
          className="rounded-lg text-destructive hover:text-destructive"
          disabled={pending}
          onClick={() => onReject(product)}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>

        <Button
          size="sm"
          className="rounded-lg"
          disabled={pending}
          onClick={() => onApproveAndPublish(product._id)}
        >
          <Rocket className="mr-2 h-4 w-4" />
          Approve &amp; Publish
        </Button>
      </div>
    </Card>
  );
}

export default function ProductApprovals() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingReview = useProducts({ status: "pending_review", limit: 100 });
  const { sellers } = useSellers(SELLERS_LIST_PARAMS);

  const shopName = (sellerId: string | null) =>
    sellers.find((seller) => seller._id === sellerId)?.shopName ?? "Unassigned";

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setOpenDetails(true);
  };

  // One admin action, two backend calls — the "approved" status is
  // transient here, never surfaced as its own queue (see productStatus.ts).
  const handleApproveAndPublish = async (id: string) => {
    setProcessingId(id);

    try {
      await pendingReview.updateStatus(id, "approved");
      await pendingReview.updateStatus(id, "published");
      await pendingReview.refresh();
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (product: Product) => {
    setRejectTarget(product);
    setRejectReason("");
  };

  // The backend requires a rejectionReason on this transition (it gets
  // surfaced to the seller via a product_rejected notification — see
  // services/product.service.js#updateStatus), so Reject always goes
  // through this dialog rather than firing immediately.
  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;

    setProcessingId(rejectTarget._id);

    try {
      await pendingReview.updateStatus(rejectTarget._id, "rejected", rejectReason.trim());
      await pendingReview.refresh();
      setRejectTarget(null);
      setRejectReason("");
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

      <div className="space-y-3">
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
              onApproveAndPublish={handleApproveAndPublish}
              onReject={openRejectDialog}
              onView={handleView}
              pending={processingId === product._id}
            />
          ))
        )}
      </div>

      <ProductDetailsSheet
        open={openDetails}
        onOpenChange={setOpenDetails}
        product={selectedProduct}
      />

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject "{rejectTarget?.name}"</DialogTitle>
            <DialogDescription>
              This is sent to the seller as a notification so they know what to fix before
              resubmitting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Product images are blurry, please re-upload clearer photos."
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={!rejectReason.trim() || processingId === rejectTarget?._id}
              onClick={confirmReject}
            >
              Reject product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
