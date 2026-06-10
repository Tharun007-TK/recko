# Reconciliation SaaS Phase 1 PRD

## Product overview

This product is a web-based reconciliation system for audit firms that compares Tally-exported Excel files with GST portal Excel files, identifies exact field-level mismatches, and produces downloadable mismatch reports. The Phase 1 product should be a pilot-grade SaaS focused on one core job: upload two files, reconcile them reliably, and return an actionable output report rather than a useless binary mismatch status.[cite:124][cite:64][cite:126]

The initial product should be built as a multi-tenant web app using Next.js for the frontend, Supabase for auth, Postgres, and storage, and a Python service for Excel processing. This architecture aligns with Supabase's B2B SaaS guidance for tenant isolation via RLS and with FastAPI's support for background task patterns when work must continue after request response cycles.[cite:124][cite:102][cite:108][cite:64]

## Problem statement

Audit firms receive two spreadsheet-based datasets from different systems, typically Tally and the GST portal, and current tools often indicate only whether a mismatch exists without specifying which fields differ. That forces manual inspection, slows audits, increases error risk, and reduces trust in the software output.[cite:1][cite:3][cite:7]

The product must solve that by producing record-level and field-level reconciliation results, including exact mismatch attribution, normalized comparison logic, and downloadable Excel outputs. The tool should also distinguish between true value mismatches and formatting-only differences when configured to do so.[cite:1][cite:3][cite:4]

## Goals

### Primary goals

- Allow a firm user to upload one Tally Excel file and one GST Excel file.[cite:125][cite:131]
- Normalize and compare mapped fields record by record.
- Detect exact mismatched fields instead of giving only a pass/fail result.[cite:1][cite:3]
- Generate a downloadable Excel report containing mismatches and summary classifications.
- Store reconciliation history per firm for repeat monthly usage.[cite:124][cite:127]

### Phase 1 validation goals

- Prove that the upload-to-report workflow works reliably for pilot users.
- Prove that auditors understand and trust the mismatch output.
- Prove that the reporting format is valuable enough for later monetization.
- Prove that a firm-based multi-tenant architecture is sufficient for early customers.[cite:124][cite:127][cite:132]

## Non-goals

The following are explicitly out of scope for Phase 1:

- Annual billing and subscription collection.
- License key activation flows.
- Desktop packaging.
- Advanced enterprise permission systems.
- AI-generated reconciliation advice.
- Full self-serve rule-builder UI.
- Highly customized client workflows.
- Native mobile application.

These are deferred because the Phase 1 objective is workflow validation, not platform sprawl.[cite:28][cite:30]

## Users

### Primary users

- Audit firm owners.
- Audit managers.
- Staff accountants or reconciliation operators.

### User characteristics

Users are spreadsheet-heavy, results-driven, and care more about trust, speed, and export quality than visual novelty. The product should reduce manual reconciliation effort and make it obvious which field caused a mismatch.[cite:1][cite:7]

## Core user stories

- As a firm user, I can sign in and access only my firm's data.[cite:102][cite:108][cite:120]
- As a firm user, I can upload a Tally file and a GST file for reconciliation.[cite:125][cite:131]
- As a firm user, I can start a reconciliation job and track its status until completion.[cite:64][cite:126]
- As a firm user, I can view summary counts such as matched, mismatched, missing in GST, and missing in Tally.
- As a firm user, I can inspect exact mismatched fields for each affected record.
- As a firm user, I can download an Excel output report for audit work.
- As a firm admin, I can define column mapping and field comparison rules for my workflow.

## Phase 1 features

### 1. Authentication

Use Supabase Auth with Next.js App Router for login, logout, password reset, and session handling. Supabase provides documented Next.js integration and aligns well with RLS-secured multi-tenant SaaS architecture.[cite:102][cite:108][cite:124]

### 2. Firm workspace

Each user belongs to one firm in Phase 1. Firm membership must be enforced at the data layer using `firm_id` and Row Level Security to prevent cross-tenant data leakage.[cite:124][cite:127][cite:132]

### 3. File upload

Users can upload source Excel files and store them in Supabase Storage. Signed uploads or controlled upload flows can be used, and Supabase Storage supports scalable file workflows including larger upload patterns.[cite:125][cite:128][cite:131]

### 4. Reconciliation jobs

Each comparison run creates a job record in the database. The system should support job states such as `uploaded`, `processing`, `completed`, and `failed`, and the backend should continue processing outside the immediate request cycle.[cite:64][cite:126]

### 5. Comparison engine

The engine must:

- Read Excel files.
- Standardize headers.
- Apply column mappings.
- Normalize values before comparison.
- Match records using a configurable key.
- Compare field by field.
- Classify matched, mismatched, missing, duplicate, and format-difference outcomes.

This design reflects practical reconciliation patterns used in GST-related workflows, where value mismatches, missing records, and field-specific discrepancies matter more than a single mismatch flag.[cite:1][cite:7][cite:10]

### 6. Downloadable report

The system must generate an Excel workbook containing mismatch results and summary outputs. The report should be readable by auditors and suitable for direct download after job completion.[cite:1][cite:12][cite:15]

### 7. Job history

Users can see recent and previous reconciliation jobs in a dashboard list with status, upload date, source filenames, and output availability.

### 8. Settings

The app should include a basic settings area for:

- Column mapping.
- Match key definition.
- Field normalization options.
- Comparison rule toggles for format-sensitive or normalized comparisons.

## Functional requirements

### Authentication and tenancy

- Users must authenticate through Supabase Auth.[cite:102][cite:108]
- Users must only access rows belonging to their firm through RLS policies.[cite:120][cite:124][cite:132]
- Each reconciliation job, file, report, and mismatch item must carry `firm_id`.

### Uploads

- Accept `.xlsx` and `.xls` for Phase 1.
- Validate file type and size before processing.
- Store uploads in a source-files bucket.
- Associate uploaded files with a reconciliation job record.[cite:125][cite:131]

### Job orchestration

- Creating a reconciliation job should trigger backend processing.
- Processing should not block the user interface while the request is open.[cite:64][cite:126]
- Job status should be queryable from the frontend.
- Failures should be logged with an error message.

### Reconciliation logic

- Support column mapping between Tally and GST headers.
- Support configurable key fields for record matching.
- Normalize values using field-level rules.
- Persist field-level mismatch details.
- Store summary counts.

### Reporting

- Generate downloadable Excel report files.
- Include mismatch rows with exact field name, source values, and result type.
- Include summary sheets or summary sections for matched and mismatched counts.

## Data normalization rules

The Phase 1 engine should support the following normalization options per field:

- Trim leading and trailing spaces.
- Collapse repeated spaces.
- Case-insensitive comparison.
- Date parsing into canonical date values.
- Numeric cleanup and rounding rules.
- Removal of formatting characters such as `/`, `-`, and spaces when configured.
- Distinction between normalized match and raw-format difference.

This matters because two values can be logically equivalent after normalization while still differing in formatting. Treating all formatting differences as full mismatches would make the system noisy and less useful for auditors.[cite:1][cite:3]

## Output report design

The mismatch report should include these columns at minimum:

| Column | Description |
|---|---|
| Firm Name | Workspace that ran the job |
| Job ID | Reconciliation run identifier |
| GST Number | Entity identifier or mapped business key |
| Match Key | Composite key used to pair records |
| Field Name | Exact field that differs |
| Tally Value | Raw source value |
| GST Value | Raw source value |
| Tally Normalized | Compared normalized value |
| GST Normalized | Compared normalized value |
| Status | Mismatch, Format Difference, Missing in GST, Missing in Tally |
| Reason | Human-readable discrepancy reason |
| Created At | Processing timestamp |

The final workbook may additionally include sheets such as `Summary`, `Field Mismatches`, `Missing in GST`, and `Missing in Tally`, which is consistent with common reconciliation-style reporting patterns.[cite:1][cite:7]

## User interface

### Required pages

- `/login`
- `/dashboard`
- `/jobs/new`
- `/jobs/[id]`
- `/settings/mappings`
- `/settings/rules`

### Dashboard requirements

The dashboard must show recent jobs, status, created date, and a clear call to start a new reconciliation. The interface should prioritize task completion over visual complexity, since this is an operations product rather than a consumer app.

### New job page

The new job screen must include file upload, selected mapping profile, optional rule profile, and a submit action.

### Job detail page

The job detail screen must show:

- Current processing status.
- Source filenames.
- Summary metrics.
- Preview of mismatches.
- Download report action.

## Technical architecture

### Frontend

- Next.js App Router.
- Tailwind CSS.
- shadcn/ui.
- Supabase client for auth and data access.

### Backend and processing

- Supabase Auth for authentication.[cite:102][cite:108]
- Supabase Postgres for relational data and tenancy.[cite:124]
- Supabase Storage for uploaded files and generated reports.[cite:125][cite:131]
- FastAPI service for Excel parsing, reconciliation logic, and report generation.[cite:64][cite:126]

### Hosting

- Vercel for the frontend in pilot/testing phase.
- Render or Railway for FastAPI service hosting, especially when background-style processing is needed.[cite:62][cite:67][cite:71]
- Supabase managed services for auth, database, and storage.[cite:124]

## Database schema

### Core tables

#### profiles
- `id` UUID, primary key, equals auth user id.
- `full_name` text.
- `email` text.
- `created_at` timestamptz.

#### firms
- `id` UUID.
- `name` text.
- `created_by` UUID.
- `created_at` timestamptz.

#### firm_members
- `id` UUID.
- `firm_id` UUID.
- `user_id` UUID.
- `role` text, one of `owner`, `manager`, `staff`.
- `created_at` timestamptz.

#### reconciliation_jobs
- `id` UUID.
- `firm_id` UUID.
- `created_by` UUID.
- `status` text.
- `mapping_profile_id` UUID nullable.
- `rule_profile_id` UUID nullable.
- `summary_json` jsonb.
- `error_message` text nullable.
- `created_at` timestamptz.
- `completed_at` timestamptz nullable.

#### job_files
- `id` UUID.
- `job_id` UUID.
- `firm_id` UUID.
- `file_type` text, e.g. `tally_source`, `gst_source`, `report_output`.
- `storage_path` text.
- `original_filename` text.
- `created_at` timestamptz.

#### mismatch_items
- `id` UUID.
- `job_id` UUID.
- `firm_id` UUID.
- `gst_number` text nullable.
- `match_key` text.
- `field_name` text.
- `tally_value` text nullable.
- `gst_value` text nullable.
- `tally_normalized` text nullable.
- `gst_normalized` text nullable.
- `status` text.
- `reason` text.
- `created_at` timestamptz.

#### mapping_profiles
- `id` UUID.
- `firm_id` UUID.
- `name` text.
- `mapping_json` jsonb.
- `created_at` timestamptz.

#### rule_profiles
- `id` UUID.
- `firm_id` UUID.
- `name` text.
- `rules_json` jsonb.
- `created_at` timestamptz.

## API design

### Next.js app actions or API routes

- `POST /api/jobs` — create reconciliation job.
- `GET /api/jobs` — list jobs for current firm.
- `GET /api/jobs/:id` — get job detail and summary.
- `POST /api/uploads/sign` — optional signed upload flow.
- `GET /api/reports/:id/download` — download generated report.

### FastAPI routes

- `POST /reconcile` — start processing a job payload.
- `GET /health` — health check.
- `POST /internal/jobs/:id/retry` — retry failed reconciliation.

## Security requirements

- Enable RLS on every exposed business table.[cite:120][cite:124]
- Ensure all queries are scoped to current firm membership.[cite:127][cite:132]
- Store generated report files in private buckets with controlled download access.[cite:125][cite:131]
- Validate MIME type and extension for uploaded files.
- Never trust frontend-only authorization.

## Non-functional requirements

- Pilot users should be able to complete upload-to-report flow without manual backend intervention.
- The UI should remain responsive while processing occurs asynchronously.[cite:64][cite:126]
- Failures should be visible and diagnosable.
- System should support repeated monthly usage by the same firm without data leakage.
- Architecture should allow later addition of billing, licensing, and advanced roles.[cite:124][cite:127]

## Success metrics

- Percentage of jobs completed successfully.
- Average reconciliation processing time.
- Percentage of mismatches correctly attributed to exact fields during testing.
- Number of pilot firms actively using the workflow monthly.
- Report download completion rate.
- Qualitative trust score from auditors during pilot review.

## Milestones

### Milestone 1: foundation
- Next.js setup.
- Supabase project setup.
- Auth integration.
- Basic app shell.[cite:102][cite:108]

### Milestone 2: tenancy and schema
- Create firms and membership tables.
- Add RLS policies.
- Build initial dashboard data layer.[cite:124][cite:127][cite:132]

### Milestone 3: uploads and jobs
- Supabase Storage buckets.
- File upload flow.
- Job creation and status tracking.[cite:125][cite:131]

### Milestone 4: reconciliation engine
- FastAPI service.
- Excel parsing.
- Mapping and normalization.
- Mismatch persistence.[cite:64][cite:126]

### Milestone 5: reporting
- Excel output generation.
- Report preview.
- Download flow.[cite:12][cite:15]

### Milestone 6: pilot hardening
- Validation.
- Error handling.
- Retry support.
- Better summaries.

## Risks

- Messy real-world Excel exports may break naive parsing.
- Column name inconsistency can cause failed mappings.
- Poor normalization design can create false mismatches.
- Missing RLS policies can cause severe tenant data leakage.[cite:120][cite:124][cite:132]
- Long-running file jobs can fail if backend hosting is underpowered.[cite:62][cite:67]

## Phase 1 launch checklist

- Auth works end to end.
- RLS tested with multiple firm users.
- File upload works for pilot spreadsheets.
- Reconciliation job completes successfully.
- Mismatch report is downloadable.
- Summary counts are correct.
- Failures are visible and recoverable.
- Pilot users can repeat the process without admin intervention.
