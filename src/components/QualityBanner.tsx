/**
 * QualityBanner – displays overall water quality status
 *
 * Shows a large banner at the top of the dashboard indicating whether
 * the water quality is within monitored limits or if there's an alert.
 */

import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface QualityBannerProps {
  isNormal: boolean;
  affectedParameter?: string;
  systemResponse?: string;
  className?: string;
}

export default function QualityBanner({
  isNormal,
  affectedParameter,
  systemResponse,
  className,
}: QualityBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border px-6 py-5",
        isNormal
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/30"
          : "border-red-200 bg-gradient-to-r from-red-50 to-amber-50 dark:border-red-900/50 dark:from-red-950/30 dark:to-amber-950/30",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            isNormal
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
          )}
        >
          {isNormal ? (
            <ShieldCheck className="size-6" />
          ) : (
            <ShieldAlert className="size-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-lg font-bold",
              isNormal
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-red-800 dark:text-red-200"
            )}
          >
            {isNormal
              ? "Quality Within Monitored Limits"
              : "Quality Alert"}
          </h3>
          {!isNormal && affectedParameter && (
            <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
              {affectedParameter.charAt(0).toUpperCase() +
                affectedParameter.slice(1)}{" "}
              exceeded monitored limit.
            </p>
          )}
          {!isNormal && systemResponse && (
            <p className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">
              System response: {systemResponse}
            </p>
          )}
          {isNormal && (
            <p className="mt-1 text-sm text-emerald-600/70 dark:text-emerald-400/70">
              All water quality parameters are within acceptable ranges.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
