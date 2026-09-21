import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { uploadImage } from "@/utils/imageUpload";

import type { UploadedImage } from "@/types/upload";

interface CreateBrandDialogProps {
  // The typed brand name awaiting a logo, or null when the dialog is closed.
  brandName: string | null;
  onCancel: () => void;
  onCreated: (image: UploadedImage) => void;
}

// A new brand needs a logo before it's saved to the shared brand registry
// (see useDropdownOptions#addOption) — shown when the admin creates one
// that doesn't exist yet from the product form's Brand combobox.
export function CreateBrandDialog({
  brandName,
  onCancel,
  onCreated,
}: CreateBrandDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [image, setImage] = useState<UploadedImage | null>(null);

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      setImage(await uploadImage(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setImage(null);
    onCancel();
  };

  const handleConfirm = () => {
    if (!image) return;
    onCreated(image);
    setImage(null);
  };

  return (
    <Dialog open={!!brandName} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add brand &quot;{brandName}&quot;</DialogTitle>
          <DialogDescription>
            New brands need a logo before they&apos;re saved and reusable across products.
          </DialogDescription>
        </DialogHeader>

        <label
          tabIndex={0}
          className={cn(
            "mx-auto flex aspect-square w-32 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 text-center text-xs font-medium text-muted-foreground hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            dragging && "ring-2 ring-primary ring-inset",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!uploading) void handleFile(e.dataTransfer.files);
          }}
          onPaste={(e) => {
            if (!uploading) void handleFile(e.clipboardData.files);
          }}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : image ? (
            <img src={image.url} alt="Brand logo" className="h-full w-full object-cover" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>{dragging ? "Drop to upload" : "Upload, drag & drop, or paste"}</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => void handleFile(e.target.files)}
          />
        </label>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={!image || uploading} onClick={handleConfirm}>
            Add brand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
