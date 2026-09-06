/**
 * WaterQualityCard – displays a single water quality parameter
 *
 * Shows the current value, unit, status label, and a subtle
 * colour indicator based on whether the value is within limits.
 */

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface WaterQualityCardProps {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  status: "normal" | "warning" | "critical";
  statusLabel: string;
  className?: string;
}

const statusStyles = {
  normal: {
    bg: "bg-emerald-50 border-emerald-200",
    darkBg: "dark:bg-emerald-950/30 dark:border-emerald-900/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    darkBg: "dark:bg-amber-950/30 dark:border-amber-900/50",
    icon: "text-amber-600 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  critical: {
    bg: "bg-red-50 border-red-200",
    darkBg: "dark:bg-red-950/30 dark:border-red-900/50",
    icon: "text-red-600 dark:text-red-400",
    value: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export default function WaterQualityCard({
  label,
  value,
  unit,
  icon: Icon,
  status,
  statusLabel,
  className,
}: WaterQualityCardProps) {
  const s = statusStyles[status];

  return (
    <div
      className={cn(
        "relative rounded-xl border p-5 transition-all hover:shadow-md",
        s.bg,
        s.darkBg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex size-10 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20", s.icon)}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", s.value)}>
              {value}
              {unit && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {unit}
                </span>
              )}
            </p>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.badge)}>
          <span className={cn("size-1.5 rounded-full", s.dot)} />
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
