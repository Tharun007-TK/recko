import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { MismatchTable } from "./_components/MismatchTable";
import { CheckCircle2, AlertCircle, FileUp, Download } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

function SummaryCard({ label, value, icon }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch job with creator profile
  const { data: job, error: jobError } = await supabase
    .from("reconciliation_jobs")
    .select(
      `
      id, firm_id, created_by, status, summary, created_at, updated_at,
      mapping_profiles (id, name),
      rule_profiles (id, name)
      `,
    )
    .eq("id", params.id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  // Fetch job files
  const { data: jobFiles = [] } = await supabase
    .from("job_files")
    .select("*")
    .eq("job_id", params.id);

  // Fetch creator profile
  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", job.created_by)
    .single();

  // Fetch mismatches
  const { data: mismatches = [] } = await supabase
    .from("mismatch_items")
    .select("*")
    .eq("job_id", params.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const tallyFile = jobFiles.find((f) => f.file_type === "tally");
  const gstFile = jobFiles.find((f) => f.file_type === "gst");
  const reportFile = jobFiles.find((f) => f.file_type === "report");

  const summary = job.summary || {
    total_records: 0,
    matched: 0,
    mismatched: 0,
    missing_in_gst: 0,
    missing_in_tally: 0,
    format_differences: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Job ${job.id.slice(0, 8)}`}
        description={`Created on ${formatDateTime(job.created_at)}`}
      >
        <div className="flex gap-2">
          {job.status === "completed" && reportFile && (
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Status and Metadata */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={job.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created By</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">
              {creatorProfile?.full_name || creatorProfile?.email || "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(job.created_at)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Mapping Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {job.mapping_profiles?.name || "None"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rule Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {job.rule_profiles?.name || "None"}
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-sm">Tally File</p>
                <p className="text-xs text-muted-foreground">
                  {tallyFile?.original_filename || "Not available"}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-sm">GST File</p>
                <p className="text-xs text-muted-foreground">
                  {gstFile?.original_filename || "Not available"}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {job.status === "completed" && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Total Records" value={summary.total_records} />
          <SummaryCard
            label="Matched"
            value={summary.matched}
            icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          />
          <SummaryCard
            label="Mismatched"
            value={summary.mismatched}
            icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          />
          <SummaryCard label="Missing in GST" value={summary.missing_in_gst} />
          <SummaryCard
            label="Missing in Tally"
            value={summary.missing_in_tally}
          />
          <SummaryCard label="Format Diff" value={summary.format_differences} />
        </div>
      )}

      {/* Mismatches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Mismatch Preview
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {mismatches.length} item{mismatches.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MismatchTable mismatches={mismatches} />
        </CardContent>
      </Card>
    </div>
  );
}
