// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Firm {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface FirmMember {
  id: string;
  firm_id: string;
  user_id: string;
  role: "admin" | "member" | "viewer";
  created_at: string;
}

// ─── Reconciliation Jobs ──────────────────────────────────────────────────────

export type JobStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";

export interface ReconciliationJob {
  id: string;
  firm_id: string;
  created_by: string;
  status: JobStatus;
  mapping_profile_id: string | null;
  rule_profile_id: string | null;
  summary: JobSummary | null;
  created_at: string;
  updated_at: string;
}

export interface JobSummary {
  total_records: number;
  matched: number;
  mismatched: number;
  missing_in_gst: number;
  missing_in_tally: number;
  format_differences: number;
}

export type JobFileType = "tally_source" | "gst_source" | "report_output";

export interface JobFile {
  id: string;
  job_id: string;
  firm_id: string;
  file_type: JobFileType;
  storage_path: string;
  original_filename: string;
  created_at: string;
}

// ─── Mismatch Items ───────────────────────────────────────────────────────────

export type MismatchCategory =
  | "field_mismatch"
  | "missing_in_gst"
  | "missing_in_tally"
  | "format_difference";

export interface MismatchItem {
  id: string;
  job_id: string;
  firm_id: string;
  category: MismatchCategory;
  match_key: string;
  field_name: string | null;
  tally_value: string | null;
  gst_value: string | null;
  normalized_tally: string | null;
  normalized_gst: string | null;
  reason: string | null;
  created_at: string;
}

// ─── Mapping & Rule Profiles ──────────────────────────────────────────────────

export interface FieldMapping {
  tally_column: string;
  gst_column: string;
  is_match_key: boolean;
}

export interface MappingProfile {
  id: string;
  firm_id: string;
  name: string;
  description: string | null;
  mappings: FieldMapping[];
  created_at: string;
}

export interface RuleSet {
  trim_spaces: boolean;
  ignore_case: boolean;
  normalize_dates: boolean;
  remove_separators: boolean;
  numeric_rounding: number | null; // decimal places, null = disabled
}

export interface RuleProfile {
  id: string;
  firm_id: string;
  name: string;
  description: string | null;
  rules: RuleSet;
  created_at: string;
}

// ─── API / Server ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
}
