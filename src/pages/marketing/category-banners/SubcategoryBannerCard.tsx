import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import categoryBannerService from "@/services/categoryBanner.service";
import { uploadImageLocally } from "@/utils/localImageUpload";

import type { CategoryBanner, CategoryBannerGender } from "@/types/categoryBanner";

// One subcategory tile — mirrors BannerForm's own upload dropzone
// (label+hidden input) but compact and self-contained: uploading here saves
// immediately (upsert), there's no separate form/Save step per card, since
// every card here already IS one complete record
// (gender+category+subcategory -> image). Uses uploadImageLocally
// (base64 data URI, no Cloudinary) — see localImageUpload.ts.
export function SubcategoryBannerCard({
  gender,
  category,
  subcategory,
  banner,
  onSaved,
  onRemoved,
}: {
  gender: CategoryBannerGender;
  category: string;
  subcategory: string;
  banner?: CategoryBanner;
  onSaved: (banner: CategoryBanner) => void;
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
      const image = await uploadImageLocally(file);

      const saved = await categoryBannerService.upsert({
        gender,
        category,
        subcategory,
        image,
      });

      onSaved(saved);
      toast.success(`"${subcategory}" banner saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);

    try {
      await categoryBannerService.delete({ gender, category, subcategory });
      onRemoved();
      toast.success(`"${subcategory}" banner removed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove banner");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/50 shadow-soft">
      <label
        className={cn(
          "relative flex aspect-[3/4] w-full items-center justify-center bg-muted/40",
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
      >
        {banner?.image.url ? (
          <img
            src={banner.image.url}
            alt={subcategory}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-xs font-medium">
              {dragging ? "Drop to upload" : "Upload or drag & drop"}
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
        <span className="truncate text-sm font-medium">{subcategory}</span>

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
