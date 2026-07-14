import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tint?: "primary" | "secondary" | "warning" | "destructive" | "success";
}

const TINT: Record<NonNullable<Props["tint"]>, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/20 text-secondary-foreground",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/15 text-success-foreground",
};

export function StatCard({ label, value, delta, icon: Icon, tint = "primary" }: Props) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="rounded-2xl border-border/50 p-5 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
            {delta && <div className="mt-1 text-xs font-medium text-success-foreground">{delta}</div>}
          </div>
          <div className={cn("grid h-11 w-11 place-items-center rounded-xl", TINT[tint])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
