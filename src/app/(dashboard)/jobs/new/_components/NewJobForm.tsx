"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createJob } from "@/actions/jobs";
import { formatFileSize } from "@/lib/utils";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MappingProfile {
  id: string;
  name: string;
}

interface RuleProfile {
  id: string;
  name: string;
}

interface NewJobFormProps {
  mappingProfiles: MappingProfile[];
  ruleProfiles: RuleProfile[];
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

export function NewJobForm({ mappingProfiles, ruleProfiles }: NewJobFormProps) {
  const [state, formAction] = useFormState(createJob, initialState);
  const [tallyFile, setTallyFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract error for specific field
  const getFieldError = (field: string): string | undefined => {
    return state.errors?.find((e) => e.field === field)?.message;
  };

  const handleFormAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleFormAction} className="space-y-6">
      {/* Display general errors */}
      {!state.success && state.message && state.errors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Job Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="font-medium">
          Job Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., GST Reconciliation - June 2026"
          required
          disabled={isSubmitting}
          className={getFieldError("jobName") ? "border-red-500" : ""}
        />
        {getFieldError("jobName") && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {getFieldError("jobName")}
          </p>
        )}
      </div>

      {/* File Uploads */}
      <div className="space-y-6 bg-muted/40 p-4 rounded-lg border border-dashed">
        {/* Tally File */}
        <div className="space-y-2">
          <Label
            htmlFor="tally-file"
            className="font-medium flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            Tally File
          </Label>
          <div className="relative">
            <Input
              id="tally-file"
              name="tally-file"
              type="file"
              accept=".xlsx,.xls"
              required
              disabled={isSubmitting}
              onChange={(e) => setTallyFile(e.target.files?.[0] || null)}
              className={`file:text-xs file:font-medium file:mr-3 ${
                getFieldError("tallyFile") ? "border-red-500" : ""
              }`}
            />
          </div>
          {tallyFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {tallyFile.name} ({formatFileSize(tallyFile.size)})
            </div>
          )}
          {getFieldError("tallyFile") && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {getFieldError("tallyFile")}
            </p>
          )}
        </div>

        {/* GST File */}
        <div className="space-y-2">
          <Label
            htmlFor="gst-file"
            className="font-medium flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            GST File
          </Label>
          <div className="relative">
            <Input
              id="gst-file"
              name="gst-file"
              type="file"
              accept=".xlsx,.xls"
              required
              disabled={isSubmitting}
              onChange={(e) => setGstFile(e.target.files?.[0] || null)}
              className={`file:text-xs file:font-medium file:mr-3 ${
                getFieldError("gstFile") ? "border-red-500" : ""
              }`}
            />
          </div>
          {gstFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {gstFile.name} ({formatFileSize(gstFile.size)})
            </div>
          )}
          {getFieldError("gstFile") && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {getFieldError("gstFile")}
            </p>
          )}
        </div>
      </div>

      {/* Profiles */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mapping-profile" className="font-medium">
            Mapping Profile (Optional)
          </Label>
          <Select
            name="mapping-profile"
            disabled={isSubmitting || mappingProfiles.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {mappingProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mappingProfiles.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No profiles available. Create one in settings.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rule-profile" className="font-medium">
            Rule Profile (Optional)
          </Label>
          <Select
            name="rule-profile"
            disabled={isSubmitting || ruleProfiles.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {ruleProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ruleProfiles.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No profiles available. Create one in settings.
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating Job..." : "Create Reconciliation Job"}
      </Button>
    </form>
  );
}
