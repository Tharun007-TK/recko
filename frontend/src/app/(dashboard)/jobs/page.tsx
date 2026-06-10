import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { JobsTable } from "./_components/JobsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileStack } from "lucide-react";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function JobsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <div>Authentication required</div>;
  }

  // Get user's firm ID
  const { data: firmMembers } = await supabase
    .from("firm_members")
    .select("firm_id")
    .eq("profile_id", session.user.id)
    .limit(1);

  const firmId = firmMembers?.[0]?.firm_id;

  // Fetch all jobs for the firm
  const { data: jobsData } = await supabase
    .from("reconciliation_jobs")
    .select(
      `
      id, firm_id, created_by, status, summary, created_at,
      mapping_profiles (name),
      rule_profiles (name)
      `,
    )
    .eq("firm_id", firmId)
    .order("created_at", { ascending: false });
  const jobs = jobsData || [];

  // Fetch creator profiles for all jobs
  const creatorIds = [...new Set(jobs.map((j) => j.created_by))];
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", creatorIds);
  const profiles = profilesData || [];

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const jobsWithCreators = jobs.map((job) => ({
    ...job,
    mapping_profiles: Array.isArray(job.mapping_profiles) ? job.mapping_profiles[0] : job.mapping_profiles,
    rule_profiles: Array.isArray(job.rule_profiles) ? job.rule_profiles[0] : job.rule_profiles,
    creator: profileMap[job.created_by],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation Jobs"
        description="All jobs for your firm"
      >
        <Button asChild>
          <Link href="/jobs/new">New Job</Link>
        </Button>
      </PageHeader>

      {jobsWithCreators.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="You haven't created any reconciliation jobs yet. Start by creating a new job."
          icon={FileStack}
          actionLabel="Create New Job"
          actionHref="/jobs/new"
        />
      ) : (
        <JobsTable jobs={jobsWithCreators} />
      )}
    </div>
  );
}
