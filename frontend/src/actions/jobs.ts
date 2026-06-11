"use server";

import { createClient } from "@/lib/supabase/server";
import { generateStoragePath, getBucketName } from "@/lib/storage-helpers";
import { validateJobForm } from "@/lib/utils";
import { redirect } from "next/navigation";

export interface CreateJobResult {
  success: boolean;
  message: string;
  errors?: { field: string; message: string }[];
}

/**
 * Get the user's firm ID from the database.
 * Assumes user has exactly one firm membership (for now).
 */
async function getUserFirmId(
  supabase: any,
  userId: string,
): Promise<string | null> {
  const { data: firmMembers, error } = await supabase
    .from("firm_members")
    .select("firm_id")
    .eq("user_id", userId)
    .limit(1);

  if (error || !firmMembers || firmMembers.length === 0) {
    return null;
  }

  return firmMembers[0].firm_id;
}

export async function createJob(
  prevState: any,
  formData: FormData,
): Promise<CreateJobResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const jobName = formData.get("name") as string;
  const tallyFile = formData.get("tally-file") as File;
  const gstFile = formData.get("gst-file") as File;
  const mappingProfileId = (formData.get("mapping-profile") as string) || null;
  const ruleProfileId = (formData.get("rule-profile") as string) || null;

  // Validate form inputs
  const validationErrors = validateJobForm({
    jobName,
    tallyFile,
    gstFile,
    mappingProfileId: mappingProfileId || undefined,
    ruleProfileId: ruleProfileId || undefined,
  });

  if (validationErrors.length > 0) {
    return {
      success: false,
      message: "Validation errors",
      errors: validationErrors,
    };
  }

  // Get user's firm ID
  const firmId = await getUserFirmId(supabase, user.id);
  if (!firmId) {
    return { success: false, message: "User is not a member of any firm" };
  }

  // 1. Create the reconciliation job
  const { data: job, error: jobError } = await supabase
    .from("reconciliation_jobs")
    .insert({
      firm_id: firmId,
      created_by: user.id,
      status: "uploaded",
      mapping_profile_id: mappingProfileId,
      rule_profile_id: ruleProfileId,
    })
    .select()
    .single();

  if (jobError) {
    console.error("Error creating job:", jobError);
    return { success: false, message: "Failed to create job record" };
  }

  // 2. Upload files to Supabase Storage
  const tallyPath = generateStoragePath(
    user.id,
    job.id,
    "tally",
    tallyFile.name,
  );
  // Create admin client for storage operations
  const adminClient = require("@supabase/supabase-js").createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: tallyError } = await adminClient.storage
    .from(getBucketName())
    .upload(tallyPath, tallyFile);

  if (tallyError) {
    console.error("Error uploading Tally file:", tallyError);
    // Clean up job record on upload failure
    await supabase.from("reconciliation_jobs").delete().eq("id", job.id);
    return { success: false, message: "Failed to upload Tally file" };
  }

  const gstPath = generateStoragePath(
    user.id,
    job.id,
    "gst",
    gstFile.name,
  );
  const { error: gstError } = await adminClient.storage
    .from(getBucketName())
    .upload(gstPath, gstFile);

  if (gstError) {
    console.error("Error uploading GST file:", gstError);
    // Clean up previous uploads
    await adminClient.storage.from(getBucketName()).remove([tallyPath]);
    await supabase.from("reconciliation_jobs").delete().eq("id", job.id);
    return { success: false, message: "Failed to upload GST file" };
  }

  // 3. Create job_files records
  const bucketName = getBucketName();
  const { error: filesError } = await supabase.from("job_files").insert([
    {
      job_id: job.id,
      firm_id: firmId,
      created_by: user.id,
      file_type: "tally_source",
      storage_bucket: bucketName,
      storage_path: tallyPath,
      original_filename: tallyFile.name,
      file_size_bytes: tallyFile.size,
      mime_type: tallyFile.type,
    },
    {
      job_id: job.id,
      firm_id: firmId,
      created_by: user.id,
      file_type: "gst_source",
      storage_bucket: bucketName,
      storage_path: gstPath,
      original_filename: gstFile.name,
      file_size_bytes: gstFile.size,
      mime_type: gstFile.type,
    },
  ]);

  if (filesError) {
    console.error("Error creating job files records:", filesError);
    // Clean up uploads and job
    await adminClient.storage.from(getBucketName()).remove([tallyPath, gstPath]);
    await supabase.from("reconciliation_jobs").delete().eq("id", job.id);
    return { success: false, message: "Failed to create job file records" };
  }

  // 4. Trigger backend reconciliation (fire-and-forget with short timeout)
  // We don't wait for reconciliation to finish - the job detail page polls for status.
  const apiUrl = process.env.RECON_API_URL || "http://localhost:8000";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s max wait
  try {
    const response = await fetch(`${apiUrl}/api/reconciliation/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: job.id, firm_id: firmId }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("Backend returned error:", response.status);
    }
  } catch (error: any) {
    // AbortError = timeout (expected), other errors = backend unreachable
    if (error?.name !== "AbortError") {
      console.error("Error calling backend API:", error?.message);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  redirect(`/jobs/${job.id}`);
}

export async function getReportDownloadUrl(storagePath: string): Promise<string | null> {
  const adminClient = require("@supabase/supabase-js").createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.storage
    .from(getBucketName())
    .createSignedUrl(storagePath, 60 * 60); // 1 hour

  if (error || !data) {
    console.error("Error generating signed URL:", error);
    return null;
  }

  return data.signedUrl;
}
