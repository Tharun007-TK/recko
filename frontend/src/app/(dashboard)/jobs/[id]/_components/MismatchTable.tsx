"use client";

import type { MismatchItem } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { truncate } from "@/lib/utils";

interface MismatchTableProps {
  mismatches: MismatchItem[];
}

const categoryLabels: Record<MismatchItem["category"], string> = {
  field_mismatch: "Field Mismatch",
  missing_in_gst: "Missing in GST",
  missing_in_tally: "Missing in Tally",
  format_difference: "Format Difference",
};

const categoryVariants: Record<
  MismatchItem["category"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  field_mismatch: "default",
  missing_in_gst: "secondary",
  missing_in_tally: "outline",
  format_difference: "destructive",
};

export function MismatchTable({ mismatches }: MismatchTableProps) {
  if (mismatches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No mismatches found. ✓</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match Key</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Tally Value</TableHead>
            <TableHead>GST Value</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mismatches.map((mismatch) => (
            <TableRow key={mismatch.id}>
              <TableCell className="font-medium">
                {truncate(mismatch.match_key, 20)}
              </TableCell>
              <TableCell>
                <Badge variant={categoryVariants[mismatch.category]}>
                  {categoryLabels[mismatch.category]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {mismatch.field_name || "—"}
              </TableCell>
              <TableCell className="text-sm max-w-xs">
                {truncate(mismatch.tally_value || "—", 30)}
              </TableCell>
              <TableCell className="text-sm max-w-xs">
                {truncate(mismatch.gst_value || "—", 30)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {mismatch.reason ? truncate(mismatch.reason, 30) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
