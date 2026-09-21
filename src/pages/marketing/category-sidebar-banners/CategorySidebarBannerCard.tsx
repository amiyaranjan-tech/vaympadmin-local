import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import categorySidebarBannerService from "@/services/categorySidebarBanner.service";
import { uploadImage } from "@/utils/imageUpload";

import type { CategorySidebarBanner } from "@/types/categorySidebarBanner";

// One category tile — mirrors category-banners/SubcategoryBannerCard.tsx's
// own upload dropzone (label+hidden input), just keyed by category alone
// instead of (gender, category, subcategory). Uploading here saves
// immediately (upsert), there's no separate form/Save step per card.
export function CategorySidebarBannerCard({
  category,
  banner,
  onSaved,
  onRemoved,
}: {
  category: string;
  banner?: CategorySidebarBanner;
  onSaved: (banner: CategorySidebarBanner) => void;
  onRemoved: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const busy = uploading || removing;

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const image = await uploadImage(file);

      const saved = await categorySidebarBannerService.upsert({ category, image });

      onSaved(saved);
      toast.success(`"${category}" sidebar banner saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);

    try {
      await categorySidebarBannerService.delete({ category });
      onRemoved();
      toast.success(`"${category}" sidebar banner removed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove banner");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/50 shadow-soft">
      <label
        tabIndex={0}
        className={cn(
          "relative flex aspect-[3/4] w-full items-center justify-center bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          busy ? "cursor-not-allowed" : "cursor-pointer",
          dragging && "ring-2 ring-primary ring-inset",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) void handleFile(e.dataTransfer.files);
        }}
        onPaste={(e) => {
          if (!busy) void handleFile(e.clipboardData.files);
        }}
      >
        {banner?.image.url ? (
          <img
            src={banner.image.url}
            alt={category}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-xs font-medium">
              {dragging ? "Drop to upload" : "Upload, drag & drop, or paste"}
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {!!banner?.image.url && !busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition hover:bg-black/40 hover:text-white">
            <span className="text-xs font-medium">Replace</span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => void handleFile(e.target.files)}
        />
      </label>

      <div className="flex items-center justify-between gap-2 p-3">
        <span className="truncate text-sm font-medium">{category}</span>

        {!!banner?.image.url && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
            disabled={busy}
            onClick={() => void handleRemove()}
          >
            {removing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
