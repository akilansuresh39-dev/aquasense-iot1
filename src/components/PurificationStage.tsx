/**
 * PurificationStage – displays a single stage of the purification workflow
 *
 * Shows stage name, status (ON/OFF), icon, and current condition.
 */

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PurificationStageProps {
  name: string;
  status: "active" | "inactive" | "warning";
  icon: LucideIcon;
  description: string;
  className?: string;
}

const statusConfig = {
  active: {
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    label: "Active",
  },
  inactive: {
    bg: "bg-muted/50 border-border",
    icon: "bg-muted text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    label: "Inactive",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    label: "Warning",
  },
};

export default function PurificationStage({
  name,
  status,
  icon: Icon,
  description,
  className,
}: PurificationStageProps) {
  const s = statusConfig[status];

  return (
    <div className={cn("rounded-xl border p-4 transition-all hover:shadow-sm", s.bg, className)}>
      <div className="flex items-start gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", s.icon)}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{name}</h4>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.badge)}>
              {s.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
