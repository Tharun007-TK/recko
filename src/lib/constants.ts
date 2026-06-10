import { NavItem, JobStatus } from "@/types";
import {
  LayoutDashboard,
  Briefcase,
  SlidersHorizontal,
  BookMarked,
} from "lucide-react";

// ─── App meta ─────────────────────────────────────────────────────────────────

export const APP_NAME = "ReconFlow";
export const APP_VERSION = "0.1.0";

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: "Briefcase",
  },
  {
    label: "Mappings",
    href: "/settings/mappings",
    icon: "SlidersHorizontal",
  },
  {
    label: "Rules",
    href: "/settings/rules",
    icon: "BookMarked",
  },
];

// ─── Job statuses ─────────────────────────────────────────────────────────────

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export const JOB_STATUS_VARIANTS: Record<
  JobStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  uploaded: "secondary",
  processing: "default",
  completed: "outline",
  failed: "destructive",
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;

// ─── File validation ──────────────────────────────────────────────────────────

export const ACCEPTED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
export const ACCEPTED_EXCEL_EXTENSIONS = [".xlsx", ".xls"];
export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
