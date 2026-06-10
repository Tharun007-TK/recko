import { cn } from "@/lib/utils";
import { JOB_STATUS_LABELS, JOB_STATUS_VARIANTS } from "@/lib/constants";
import type { JobStatus } from "@/types";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

/**
 * Pill badge for reconciliation job statuses.
 * Uses a fixed color map for consistency throughout the app.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        {
          // uploaded
          "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-800":
            status === "uploaded",
          // processing
          "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800":
            status === "processing",
          // completed
          "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800":
            status === "completed",
          // failed
          "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800":
            status === "failed",
        },
        className
      )}
    >
      {/* Status dot */}
      <span
        aria-hidden="true"
        className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
          "bg-slate-400": status === "uploaded",
          "bg-blue-500 animate-pulse": status === "processing",
          "bg-emerald-500": status === "completed",
          "bg-red-500": status === "failed",
        })}
      />
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
