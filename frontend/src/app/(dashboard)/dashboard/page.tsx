import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileStack, PlusCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  // Replace with actual data fetching in a real application
  const stats = {
    jobs_total: 0,
    jobs_pending: 0,
    mismatches_unresolved: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of reconciliation activity for your firm.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Jobs</CardTitle>
            <CardDescription>All reconciliation jobs created.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.jobs_total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Jobs</CardTitle>
            <CardDescription>Jobs awaiting processing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.jobs_pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unresolved Mismatches</CardTitle>
            <CardDescription>Items requiring manual review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {stats.mismatches_unresolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {stats.jobs_total === 0 && (
        <EmptyState
          title="No Jobs Created Yet"
          description="Get started by creating your first reconciliation job."
          icon={FileStack}
          actionLabel="Create New Job"
          actionHref="/jobs/new"
        />
      )}
    </div>
  );
}
