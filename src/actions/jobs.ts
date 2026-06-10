"use server";

import { createClient } from "@/lib/supabase/server";
import { generateStoragePath, getBucketName } from "@/lib/storage-helpers";
import { validateJobForm } from "@/lib/utils";
import { cookies } from "next/headers";
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
    .eq("profile_id", userId)
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
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
  const firmId = await getUserFirmId(supabase, session.user.id);
  if (!firmId) {
    return { success: false, message: "User is not a member of any firm" };
  }

  // 1. Create the reconciliation job
  const { data: job, error: jobError } = await supabase
    .from("reconciliation_jobs")
    .insert({
      firm_id: firmId,
      created_by: session.user.id,
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
    session.user.id,
    job.id,
    "tally",
    tallyFile.name,
  );
  const { error: tallyError } = await supabase.storage
    .from(getBucketName())
    .upload(tallyPath, tallyFile);

  if (tallyError) {
    console.error("Error uploading Tally file:", tallyError);
    // Clean up job record on upload failure
    await supabase.from("reconciliation_jobs").delete().eq("id", job.id);
    return { success: false, message: "Failed to upload Tally file" };
  }

  const gstPath = generateStoragePath(
    session.user.id,
    job.id,
    "gst",
    gstFile.name,
  );
  const { error: gstError } = await supabase.storage
    .from(getBucketName())
    .upload(gstPath, gstFile);

  if (gstError) {
    console.error("Error uploading GST file:", gstError);
    // Clean up previous uploads
    await supabase.storage.from(getBucketName()).remove([tallyPath]);
    await supabase.from("reconciliation_jobs").delete().eq("id", job.id);
    return { success: false, message: "Failed to upload GST file" };
  }

  // 3. Create job_files records
  const { error: filesError } = await supabase.from("job_files").insert([
    {
      job_id: job.id,
      firm_id: firmId,
      file_type: "tally",
      storage_path: tallyPath,
      original_filename: tallyFile.name,
    },
    {
      job_id: job.id,
      firm_id: firmId,
      file_type: "gst",
      storage_path: gstPath,
      original_filename: gstFile.name,
    },
  ]);

  if (filesError) {
    console.error("Error creating job files records:", filesError);
    // Clean up uploads and job
    await supabase.storage.from(getBucketName()).remove([tallyPath, gstPath]);
    await supabase.from("reconciliation_jobs").delete().eq("id", job.id);
    return { success: false, message: "Failed to create job file records" };
  }

  redirect(`/jobs/${job.id}`);
}
