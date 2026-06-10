"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobWithCreator {
  id: string;
  created_by: string;
  status: string;
  created_at: string;
  summary: any;
  mapping_profiles: { name: string } | null;
  rule_profiles: { name: string } | null;
  creator?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export function JobsTable({ jobs }: { jobs: JobWithCreator[] }) {
  const router = useRouter();

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Mapping</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Report</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No jobs yet. Create one to get started.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs">
                  {job.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={job.status as any} />
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(job.created_at)}
                </TableCell>
                <TableCell className="text-sm">
                  {job.creator?.full_name || job.creator?.email || "Unknown"}
                </TableCell>
                <TableCell className="text-sm">
                  {job.mapping_profiles?.name || "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {job.rule_profiles?.name || "—"}
                </TableCell>
                <TableCell>
                  {job.status === "completed" ? (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {job.status === "processing" ? "Generating..." : "—"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
