import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard overview page.
 * Summary stats and quick actions will be wired to real data in Prompt 4.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of reconciliation activity for your firm.
        </p>
      </div>

      {/* Empty state placeholder */}
      <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No reconciliation jobs yet.{" "}
          <a href="/jobs/new" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Create your first job →
          </a>
        </p>
      </div>
    </div>
  );
}
