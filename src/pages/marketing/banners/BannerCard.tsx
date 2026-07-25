import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Copy,
  Eye,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  EyeOff,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatDate, formatNumber } from "@/utils/format";
import { Banner } from "./types";
import { BANNER_TYPE_LABELS, POSITION_LABELS } from "./bannerMeta";
import { EFFECTIVE_STATUS_BADGE_VARIANT, EFFECTIVE_STATUS_LABELS } from "./bannerStatus";

interface BannerCardProps {
  banner: Banner;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onTogglePublish: (banner: Banner) => void;
}

export function BannerCard({
  banner,
  onDelete,
  onDuplicate,
  onTogglePublish,
}: BannerCardProps) {
  const isPublished = banner.status === "published";

  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={banner.image.url}
            alt={banner.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
            <Badge variant={EFFECTIVE_STATUS_BADGE_VARIANT[banner.effectiveStatus]}>
              {EFFECTIVE_STATUS_LABELS[banner.effectiveStatus]}
            </Badge>
          </div>

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <Badge className="bg-background/90 text-foreground">
              Priority {banner.priority}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{banner.name}</div>

              <div className="truncate text-xs text-muted-foreground">
                {BANNER_TYPE_LABELS[banner.type]} · {POSITION_LABELS[banner.position]}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/marketing/banners/${banner._id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => onTogglePublish(banner)}>
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Quick Hide
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Quick Publish
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => onDuplicate(banner._id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => onDelete(banner._id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatDate(banner.startDate)} → {formatDate(banner.endDate)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(banner.views)}
            </span>

            <span className="flex items-center gap-1">
              <MousePointerClick className="h-3.5 w-3.5" />
              {formatNumber(banner.clicks)}
            </span>

            <span className="font-medium text-foreground">
              {banner.ctr.toFixed(1)}% CTR
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
