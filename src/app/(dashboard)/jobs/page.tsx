import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { JobsTable } from "./_components/JobsTable";

export const metadata: Metadata = {
  title: "Jobs",
};

export default async function JobsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
  const { data: jobs = [] } = await supabase
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

  // Fetch creator profiles for all jobs
  const creatorIds = [...new Set(jobs.map((j) => j.created_by))];
  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", creatorIds);

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const jobsWithCreators = jobs.map((job) => ({
    ...job,
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

      <JobsTable jobs={jobsWithCreators} />
    </div>
  );
}
