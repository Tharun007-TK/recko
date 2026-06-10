/**
 * Storage utilities for uploading job files to Supabase
 */

export interface StorageUploadResult {
  path: string;
  error: string | null;
}

/**
 * Generate a storage path for a job file
 */
export function generateStoragePath(
  userId: string,
  jobId: string,
  fileType: "tally" | "gst",
  originalFilename: string,
): string {
  const ext = originalFilename.substring(originalFilename.lastIndexOf("."));
  return `jobs/${userId}/${jobId}/${fileType}${ext}`;
}

/**
 * Extract bucket name from file type
 */
export function getBucketName(): string {
  return "job-files";
}
