# Prompt File to Build Reconciliation SaaS Phase 1 Step by Step

Use these prompts one by one with GitHub Copilot Chat or an agentic coding workflow. Do not paste everything at once. Each prompt is designed to move the project forward in a controlled order.

## Prompt 1: initialize the web app

Create a production-style Next.js App Router project in TypeScript for a B2B reconciliation SaaS called `ReconFlow`.

Requirements:
- use Tailwind CSS
- use shadcn/ui
- create a clean dashboard-style layout
- include route groups for auth and dashboard areas
- set up folders for components, lib, types, hooks, and actions
- create a top-level app shell suitable for authenticated business software
- do not build fake demo charts or marketing sections
- this is an internal operations-style SaaS for audit firms

Output the initial folder structure and all setup files needed.

## Prompt 2: integrate Supabase auth

Integrate Supabase Auth into this Next.js App Router project.

Requirements:
- email/password login for Phase 1
- login page and reset password page
- middleware or route protection for authenticated dashboard routes
- server-side session handling where appropriate
- create utility files for browser and server Supabase clients
- redirect unauthenticated users to `/login`
- do not use Clerk

Generate the necessary files and explain where environment variables are needed.

## Prompt 3: create the multi-tenant schema

Generate the SQL schema for a multi-tenant reconciliation SaaS in Supabase.

Create these tables:
- profiles
- firms
- firm_members
- reconciliation_jobs
- job_files
- mismatch_items
- mapping_profiles
- rule_profiles

Requirements:
- use UUID primary keys
- include `firm_id` on all business tables
- include `created_at` timestamps
- add useful foreign keys and indexes
- write Row Level Security policies so users can only access rows belonging to firms they are members of
- keep the schema production-oriented and explicit

Output clean SQL migration files.

## Prompt 4: build the authenticated dashboard shell

Build the authenticated dashboard shell for the reconciliation SaaS.

Requirements:
- sidebar navigation with Dashboard, New Job, Jobs, Mappings, Rules
- top bar with current user and sign out action
- clean enterprise SaaS styling using shadcn/ui
- responsive but desktop-first layout
- no fake data hardcoded into final components
- create reusable layout components

Also build the `/dashboard` page with an empty state and placeholders wired for real data integration.

## Prompt 5: create the new reconciliation job flow

Build the `/jobs/new` page for creating a reconciliation job.

Requirements:
- form to upload one Tally file and one GST file
- validate `.xlsx` and `.xls`
- allow selecting a mapping profile and rule profile
- create a reconciliation job record in Supabase
- upload files to Supabase Storage
- create linked `job_files` records
- set initial job status to `uploaded`
- design the page for clarity and operational use, not consumer aesthetics

Generate the frontend code, validation logic, and storage integration helpers.

## Prompt 6: create jobs listing and detail pages

Build the jobs list and job detail pages.

Requirements:
- `/jobs` page should list reconciliation jobs for the current firm
- show status, created date, created by, and report availability
- `/jobs/[id]` page should show job metadata, uploaded files, summary cards, mismatch preview table, and download action
- use reusable status badges and summary cards
- fetch only rows allowed by Supabase policies
- do not use dummy mismatch items in the final implementation

Generate all required files.

## Prompt 7: build settings for mappings and rules

Build the settings pages for mapping profiles and rule profiles.

Requirements:
- `/settings/mappings` page to create and edit mapping profiles
- `/settings/rules` page to create and edit rule profiles
- store mapping data and rules in JSON fields in Supabase
- include a practical UI for field mapping between Tally and GST columns
- support rule toggles such as trim spaces, ignore case, normalize dates, remove separators, numeric rounding
- design for auditors/admin users, simple and clear

Generate schema assumptions, forms, validations, and CRUD logic.

## Prompt 8: create the FastAPI reconciliation service

Create a FastAPI service for Excel reconciliation.

Requirements:
- production-oriented Python project structure
- route for starting reconciliation on a given job id
- health check route
- service layer for reading source files, applying mappings, normalizing fields, comparing records, and generating mismatch outputs
- use pandas for Excel reading
- use openpyxl for report writing and formatting
- support job status updates: processing, completed, failed
- write code that can work with Supabase Storage and database records
- no fake placeholder logic

Output the backend file structure and full implementation.

## Prompt 9: implement normalization and comparison engine

Implement the reconciliation engine in Python.

Requirements:
- load Tally and GST source files
- standardize headers
- apply mapping profile
- derive a configurable match key
- normalize values by rule profile
- compare field by field
- classify records into matched, mismatched, missing in GST, missing in Tally, and format difference where applicable
- persist mismatch items back to the database
- compute summary counts

Be explicit about how date normalization, separator removal, string cleanup, and numeric normalization work.

## Prompt 10: generate Excel output reports

Implement Excel report generation for reconciliation results.

Requirements:
- create a workbook with at least these sheets: Summary, Field Mismatches, Missing in GST, Missing in Tally
- include audit-friendly columns such as GST number, match key, field name, raw values, normalized values, status, and reason
- apply basic formatting for readability
- save the output to storage and create a `job_files` entry for the generated report
- make the report downloadable from the web app

Generate the full Python implementation and any frontend download integration needed.

## Prompt 11: wire frontend to backend processing

Connect the Next.js app to the FastAPI reconciliation backend.

Requirements:
- after job creation and file upload, trigger backend reconciliation for that job
- support asynchronous status updates
- poll or refresh job detail page until processing completes
- show clear loading, success, and error states
- avoid blocking the UI during processing

Generate the API integration code and state handling.

## Prompt 12: harden the app for pilot testing

Perform a Phase 1 hardening pass across the entire app.

Requirements:
- improve error handling for auth, uploads, storage, and reconciliation failures
- add empty states and retry states where needed
- add validation messages
- ensure tenant isolation assumptions are respected everywhere
- clean up types and duplicated logic
- improve dashboard readability for audit-firm users
- keep styling sober and professional

Return a file-by-file improvement plan and then implement the changes.

## Prompt 13: generate seed and test utilities

Create development utilities for testing the app.

Requirements:
- create seed scripts for firm, membership, mapping profile, and rule profile data
- create a few safe sample records for local development only
- create helper utilities to simulate a reconciliation job lifecycle
- do not pollute production logic with test-only shortcuts

Generate the files and explain how to run them.

## Prompt 14: final review

Review the entire codebase as a senior engineer.

Requirements:
- identify architecture flaws
- identify security issues
- identify missing RLS assumptions
- identify code smells and overcoupling
- identify UI gaps in operational workflow
- suggest improvements before pilot rollout

Then apply the highest-priority fixes directly in code.
