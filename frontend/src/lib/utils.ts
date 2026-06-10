import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a UTC ISO string as a short date.
 * Uses deterministic UTC parts to avoid SSR/client hydration mismatches.
 * Example: "10 Jun 2026"
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate().toString().padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Format a UTC ISO string as a short datetime.
 * Uses deterministic UTC parts to avoid SSR/client hydration mismatches.
 * Example: "10 Jun 2026, 11:52 AM"
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours24 = d.getUTCHours();
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = (hours24 % 12 || 12).toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours12}:${minutes} ${ampm}`;
}

/**
 * Truncate a string to a max length, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Format bytes as a human-readable file size.
 * Example: 1572864 → "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * ─── File Validation ──────────────────────────────────────────
 */

const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export interface FileValidationError {
  field: string;
  message: string;
}

export function validateFileExtension(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function validateExcelFile(
  file: File,
  fieldName: string,
): FileValidationError | null {
  if (!file) {
    return {
      field: fieldName,
      message: "File is required",
    };
  }

  if (!validateFileExtension(file.name)) {
    return {
      field: fieldName,
      message: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  if (!validateFileSize(file)) {
    return {
      field: fieldName,
      message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit`,
    };
  }

  return null;
}

export function validateJobForm(formData: {
  jobName: string;
  tallyFile?: File;
  gstFile?: File;
  mappingProfileId?: string;
  ruleProfileId?: string;
}): FileValidationError[] {
  const errors: FileValidationError[] = [];

  if (!formData.jobName || !formData.jobName.trim()) {
    errors.push({
      field: "jobName",
      message: "Job name is required",
    });
  }

  if (formData.jobName && formData.jobName.trim().length > 255) {
    errors.push({
      field: "jobName",
      message: "Job name must not exceed 255 characters",
    });
  }

  if (formData.tallyFile) {
    const tallyError = validateExcelFile(formData.tallyFile, "tallyFile");
    if (tallyError) {
      errors.push(tallyError);
    }
  } else {
    errors.push({
      field: "tallyFile",
      message: "Tally file is required",
    });
  }

  if (formData.gstFile) {
    const gstError = validateExcelFile(formData.gstFile, "gstFile");
    if (gstError) {
      errors.push(gstError);
    }
  } else {
    errors.push({
      field: "gstFile",
      message: "GST file is required",
    });
  }

  return errors;
}
