# ReconFlow — GST Reconciliation SaaS

> **Phase 1 · Pilot Release**  
> A multi-tenant, audit-grade web application that compares Tally-exported Excel files with GST portal files, identifies exact field-level mismatches, and produces downloadable Excel reports — purpose-built for Indian audit firms.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Clone the Repository](#clone-the-repository)
   - [Supabase Setup](#supabase-setup)
   - [Frontend Setup](#frontend-setup)
   - [Backend Setup](#backend-setup)
8. [Environment Variables](#environment-variables)
9. [Running Locally](#running-locally)
10. [Seed Data](#seed-data)
11. [API Reference](#api-reference)
12. [Reconciliation Engine](#reconciliation-engine)
13. [Excel Report Format](#excel-report-format)
14. [Deployment](#deployment)
15. [Roadmap](#roadmap)

---

## Overview

ReconFlow solves a critical pain point for Indian audit firms: traditional tools only tell you *whether* a mismatch exists, not *which field* caused it. This forces hours of manual inspection per client, per month.

ReconFlow automates the entire workflow:

```
Upload Tally .xlsx  +  Upload GST .xlsx
           ↓
   Apply Column Mappings
           ↓
   Normalize Fields (case, dates, numeric rounding)
           ↓
   Match Records by Configurable Key (e.g. Invoice No)
           ↓
   Compare Field-by-Field
           ↓
   Classify: Matched / Mismatched / Missing in GST / Missing in Tally / Format Difference
           ↓
   Generate Downloadable Excel Report
```

All data is strictly tenant-isolated using Supabase Row Level Security — one firm can never see another firm's data.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-tenant Auth** | Email/password login via Supabase Auth. Each user belongs to exactly one firm. All data is isolated by `firm_id`. |
| **File Upload** | Upload `.xlsx` / `.xls` files up to 50 MB. Files are stored in private Supabase Storage buckets. |
| **Column Mapping Profiles** | Configurable profiles that define how Tally column names map to GST column names (e.g. `Invoice No` → `Invoice Number`). |
| **Rule Profiles** | Toggle-based normalization rules: trim spaces, case-insensitive, normalize dates, remove separators, numeric rounding. |
| **Async Reconciliation** | FastAPI processes jobs in the background. The frontend polls for status updates without blocking the UI. |
| **Field-Level Mismatches** | Every mismatch is attributed to the exact field name, with both raw and normalized values recorded. |
| **Excel Output Report** | 4-sheet workbook: Summary, Field Mismatches, Missing in GST, Missing in Tally. Downloadable via signed URL. |
| **Job History** | Full history of reconciliation runs per firm with status tracking (uploaded → processing → completed / failed). |
| **Settings** | Manage mapping profiles and rule profiles per firm from within the app. |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.x (App Router) | React framework with SSR and Server Actions |
| TypeScript | 5.x | Type safety across the entire frontend |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Radix UI-based component system |
| Supabase JS | 2.x | Auth, database queries, and storage |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12+ | Runtime |
| FastAPI | Latest | Async REST API framework |
| Uvicorn | Latest | ASGI server |
| Pandas | 2.x | Excel parsing and data manipulation |
| OpenPyXL | Latest | Excel report generation |
| Supabase Python | Latest | Database and storage access |
| Pydantic | 2.x | Settings and request/response validation |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | Postgres DB, Auth, Storage (all-in-one) |
| Vercel | Frontend hosting (recommended) |
| Render / Railway | Backend hosting (recommended) |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  Browser (User)                  │
└─────────────────────┬────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼────────────────────────────┐
│         Next.js Frontend (Vercel)                │
│  ┌──────────────┐   ┌───────────────────────┐    │
│  │  App Router  │   │   Server Actions       │    │
│  │  (RSC + SSR) │   │   (createJob, etc.)    │    │
│  └──────┬───────┘   └──────────┬────────────┘    │
└─────────┼──────────────────────┼─────────────────┘
          │ Supabase Client      │ fetch()
┌─────────▼──────────┐  ┌───────▼────────────────┐
│   Supabase Platform │  │  FastAPI Backend        │
│  ┌────────────────┐ │  │  (Render / Railway)     │
│  │  Postgres DB   │ │  │  ┌─────────────────┐   │
│  │  (RLS enabled) │ │  │  │ ReconciliationSvc│   │
│  ├────────────────┤ │  │  │ - Load files     │   │
│  │  Auth (JWT)    │ │  │  │ - Apply mappings │   │
│  ├────────────────┤ │  │  │ - Normalize      │   │
│  │  Storage       │ │  │  │ - Compare        │   │
│  │  (private      │ │  │  │ - Persist items  │   │
│  │   buckets)     │ │  │  │ - Generate XLSX  │   │
│  └────────────────┘ │  │  └─────────────────┘   │
└─────────────────────┘  └────────────────────────┘
```

**Key design decisions:**
- **Server Components** handle all data fetching from Supabase — no sensitive keys are exposed to the browser.
- **Server Actions** handle mutations (creating jobs, uploading files) — no separate REST layer needed on the Next.js side.
- **FastAPI BackgroundTasks** handle heavy Excel processing so the HTTP response returns immediately and the UI can poll for progress.
- **Signed URLs** are generated server-side for every report download — raw storage paths are never exposed to the client.

---

## Project Structure

```
recko/
├── frontend/                    # Next.js 16 App Router application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Unauthenticated routes
│   │   │   │   └── login/       # Login page
│   │   │   ├── (dashboard)/     # Authenticated routes (protected by layout)
│   │   │   │   ├── dashboard/   # Overview page
│   │   │   │   ├── jobs/        # Job list, new job, job detail
│   │   │   │   │   ├── [id]/    # Job detail page + status poller
│   │   │   │   │   └── new/     # New job form
│   │   │   │   └── settings/
│   │   │   │       ├── mappings/  # Mapping profile CRUD
│   │   │   │       └── rules/     # Rule profile CRUD
│   │   │   └── auth/
│   │   │       └── callback/    # Supabase auth redirect handler
│   │   ├── actions/             # Next.js Server Actions
│   │   │   ├── auth.ts          # signIn, signOut
│   │   │   ├── jobs.ts          # createJob, getReportDownloadUrl
│   │   │   ├── mapping-profiles.ts
│   │   │   └── rule-profiles.ts
│   │   ├── components/
│   │   │   ├── layout/          # AppSidebar, TopBar, PageHeader
│   │   │   ├── shared/          # EmptyState, StatusBadge, FieldMappingEditor
│   │   │   └── ui/              # shadcn/ui components (Button, Card, Table, etc.)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/
│   │   │   ├── supabase/        # Browser, server, and middleware Supabase clients
│   │   │   ├── constants.ts     # App-wide constants (APP_NAME, bucket names)
│   │   │   ├── storage-helpers.ts  # Storage path generation
│   │   │   └── utils.ts         # formatDate, formatDateTime, validateExcelFile, etc.
│   │   ├── types/
│   │   │   └── index.ts         # Shared TypeScript types (MismatchItem, RuleSet, etc.)
│   │   └── proxy.ts             # Next.js 16 session proxy (replaces middleware.ts)
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                     # FastAPI reconciliation service
│   ├── main.py                  # App entry point, health check route
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py        # POST /api/reconciliation/start
│   │   ├── services/
│   │   │   ├── reconciliation.py  # Core ReconciliationService class
│   │   │   └── excel_report.py    # generate_excel_report()
│   │   ├── models/              # Pydantic request/response models
│   │   ├── utils/               # Normalization helpers
│   │   └── config.py            # Pydantic settings (reads from .env)
│   ├── scripts/
│   │   ├── seeds.py             # Seed test firm, profiles, and mappings
│   │   └── generate_sample_data.py  # Generate sample Tally/GST XLSX files
│   ├── requirements.txt
│   └── .env                     # Backend environment variables (never commit)
│
├── supabase/
│   └── migrations/
│       └── 0000_initial_schema.sql  # Full DB schema with RLS policies
│
├── recon-phase1-prd.md          # Product Requirements Document
├── phase1-build-prompts.md      # Build prompt guide
└── README.md                    # This file
```

---

## Database Schema

All tables use UUID primary keys and carry a `firm_id` column. Row Level Security (RLS) ensures users can only access rows belonging to firms they are members of.

```sql
-- Core user profile (mirrors Supabase auth.users)
profiles          (id, full_name, email, created_at)

-- Multi-tenant firm workspace
firms             (id, name, slug, created_by, created_at, updated_at)

-- Firm membership + role
firm_members      (id, firm_id, profile_id, role, created_at, updated_at)
                  role ∈ {owner, manager, staff}

-- One reconciliation run = one job
reconciliation_jobs (id, firm_id, created_by, status, summary_json,
                     mapping_profile_id, rule_profile_id,
                     error_message, created_at, completed_at)
                  status ∈ {uploaded, processing, completed, failed}

-- Files associated with a job (source + output)
job_files         (id, job_id, firm_id, file_type, storage_path,
                   original_filename, created_at)
                  file_type ∈ {tally, gst, report}

-- Individual mismatch records persisted per job
mismatch_items    (id, job_id, firm_id, gst_number, match_key,
                   field_name, tally_value, gst_value,
                   tally_normalized, gst_normalized,
                   status, reason, created_at)

-- Saved column mapping profiles per firm
mapping_profiles  (id, firm_id, name, description, mappings, created_at, updated_at)
                  mappings: JSONB array of {tally_column, gst_column, is_match_key}

-- Saved normalization rule profiles per firm
rule_profiles     (id, firm_id, name, description, rules, created_at, updated_at)
                  rules: JSONB {trim_spaces, ignore_case, normalize_dates,
                                remove_separators, numeric_rounding}
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **npm** or **pnpm**
- A **Supabase** project (free tier works for pilot)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/Tharun007-TK/recko.git
cd recko
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the full migration:

```bash
# Copy the contents of this file into the Supabase SQL Editor and run it
supabase/migrations/0000_initial_schema.sql
```

3. In your Supabase dashboard:
   - Go to **Storage** → Create a bucket named **`job-files`**
   - Set the bucket to **Private**
   - Enable **RLS** on the bucket

4. Collect your credentials from **Project Settings → API**:
   - `Project URL`
   - `anon` public key
   - `service_role` secret key

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RECON_API_URL=http://localhost:8000
```

---

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DEBUG=true
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase `service_role` key (server-only, never exposed to browser) |
| `RECON_API_URL` | ✅ | URL of the FastAPI backend (e.g. `http://localhost:8000` or your deployed URL) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase `service_role` key (used for admin DB operations) |
| `DEBUG` | ❌ | Set to `true` for verbose logging (default: `false`) |

> ⚠️ **Never commit `.env` or `.env.local` files.** Both are included in `.gitignore`.

---

## Running Locally

### 1. Start the Backend

```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

uvicorn main:app --reload --port 8000
```

The API will be live at:
- **`http://localhost:8000`** — Root
- **`http://localhost:8000/health`** — Health check
- **`http://localhost:8000/docs`** — Interactive Swagger UI

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The app will be live at **`http://localhost:3000`**.

### 3. Sign Up

Open `http://localhost:3000/login` and register with your email. After signup, run the seed script to set up your firm workspace.

---

## Seed Data

The seed script creates a test firm, links it to the first registered user, and inserts sample mapping and rule profiles.

```bash
cd backend
venv\Scripts\activate
python scripts/seeds.py
```

To generate sample Tally and GST Excel files for testing:

```bash
python scripts/generate_sample_data.py
```

This creates `scripts/samples/tally_sample.xlsx` and `scripts/samples/gst_sample.xlsx` with realistic mismatch data that exercises all mismatch categories.

---

## API Reference

### FastAPI Backend

#### `GET /health`
Returns service health status.

```json
{ "status": "ok", "service": "reconflow-reconciliation", "version": "0.1.0" }
```

#### `POST /api/reconciliation/start`
Starts reconciliation processing for a job. This endpoint returns immediately — processing happens in the background.

**Request body:**
```json
{
  "job_id": "uuid",
  "firm_id": "uuid"
}
```

**Response:**
```json
{ "message": "Reconciliation started", "job_id": "uuid" }
```

**Processing flow:**
1. Job status → `processing`
2. Download Tally + GST files from Supabase Storage
3. Parse files with Pandas
4. Apply mapping profile (if set)
5. Normalize fields per rule profile (if set)
6. Match records using the configured key field(s)
7. Compare field-by-field and classify each result
8. Persist `mismatch_items` rows to Supabase
9. Generate Excel report with OpenPyXL
10. Upload report to Supabase Storage
11. Create `job_files` entry for the report
12. Update `reconciliation_jobs.summary` with counts
13. Job status → `completed` (or `failed` on any error)

#### `GET /docs`
Interactive Swagger UI (available in development).

---

## Reconciliation Engine

The core logic lives in `backend/app/services/reconciliation.py`.

### Normalization Rules

| Rule | When Active | What It Does |
|------|------------|--------------|
| `trim_spaces` | Toggle | Strips leading/trailing whitespace from all string values |
| `ignore_case` | Toggle | Lowercases both sides before comparison |
| `normalize_dates` | Toggle | Parses dates in multiple formats and outputs `YYYY-MM-DD` |
| `remove_separators` | Toggle | Removes `/`, `-`, `,`, and space characters |
| `numeric_rounding` | Toggle + N | Rounds numeric values to N decimal places before comparing |

### Classification Categories

| Category | Meaning |
|----------|---------|
| `matched` | Record found in both files, all compared fields are equal after normalization |
| `field_mismatch` | Record found in both files, but one or more field values differ |
| `format_difference` | Values are equal when normalized but differ in raw format |
| `missing_in_gst` | Record present in Tally but not found in GST file |
| `missing_in_tally` | Record present in GST but not found in Tally file |

### Match Key

The match key is derived from the fields marked `is_match_key: true` in the mapping profile. Multiple key fields are concatenated with `|`. If no profile is set, the first column is used as the key.

---

## Excel Report Format

The generated workbook contains 4 sheets:

### Sheet 1: Summary
High-level counts for the reconciliation run.

| Column | Description |
|--------|-------------|
| Metric | Category name |
| Count | Number of records |

### Sheet 2: Field Mismatches
One row per mismatched field per record.

| Column | Description |
|--------|-------------|
| GST Number | Business identifier |
| Match Key | Key used to pair records |
| Field Name | The specific field that differs |
| Tally Value | Raw value from Tally file |
| GST Value | Raw value from GST file |
| Tally Normalized | Normalized value used for comparison |
| GST Normalized | Normalized value used for comparison |
| Status | `mismatch` or `format_difference` |
| Reason | Human-readable explanation |
| Created At | Timestamp of this mismatch record |

### Sheet 3: Missing in GST
Records that exist in Tally but are absent in the GST file.

### Sheet 4: Missing in Tally
Records that exist in GST but are absent in the Tally file.

---

## Deployment

### Frontend → Vercel

1. Push to GitHub (already configured).
2. Import the repository on [vercel.com](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add all environment variables from `frontend/.env.local` in the Vercel dashboard.
5. Deploy.

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all environment variables from `backend/.env` in Render's dashboard.
7. Copy the deployed URL and update `RECON_API_URL` in your Vercel frontend deployment.

> **Note:** Render's free tier spins down after inactivity. For a pilot, use the Starter plan ($7/mo) or Railway for consistent uptime.

---

## Roadmap

### Phase 1 (Current — Pilot)
- [x] Multi-tenant auth and firm isolation
- [x] File upload (Tally + GST Excel)
- [x] Configurable column mapping profiles
- [x] Configurable normalization rule profiles
- [x] Async reconciliation engine (FastAPI BackgroundTasks)
- [x] Field-level mismatch detection and classification
- [x] Excel output report generation (4-sheet workbook)
- [x] Downloadable reports via signed URLs
- [x] Job history and status tracking
- [x] Seed and test data utilities

### Phase 2 (Planned)
- [ ] Retry failed jobs from the UI
- [ ] Inline mismatch annotation (auditor comments)
- [ ] Email notifications on job completion
- [ ] Firm-level usage dashboard
- [ ] Subscription and billing integration
- [ ] Role-based access control (owner / manager / staff)
- [ ] Support for multi-sheet Excel files
- [ ] Webhook support for external integrations

---

## Contributing

This is an internal pilot product. Contributions are by invite only for Phase 1.

---

## License

Proprietary · All rights reserved · ReconFlow © 2026
