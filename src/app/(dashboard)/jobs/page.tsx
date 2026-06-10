import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
};

/**
 * Jobs listing page.
 * Full implementation in Prompt 6 (jobs list + detail pages).
 */
export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reconciliation Jobs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All jobs for your firm, ordered by most recent.
          </p>
        </div>
        <a
          href="/jobs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Job
        </a>
      </div>

      {/* Table placeholder */}
      <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Job list will be fetched from Supabase in Prompt 6.
        </p>
      </div>
    </div>
  );
}
