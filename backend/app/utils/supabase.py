"""
Supabase client utilities for database and storage access
"""

from supabase import create_client
from app.config import settings
from typing import Optional, List, Dict, Any
import io


class SupabaseClient:
    """Wrapper for Supabase client"""

    def __init__(self):
        self.client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )

    # ─── Database Operations ──────────────────────────────────────────────

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a reconciliation job"""
        try:
            response = (
                self.client.table("reconciliation_jobs")
                .select("*")
                .eq("id", job_id)
                .single()
                .execute()
            )
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching job: {e}")
            return None

    def update_job_status(self, job_id: str, status: str) -> bool:
        """Update job status"""
        try:
            self.client.table("reconciliation_jobs").update(
                {"status": status, "updated_at": "now()"}
            ).eq("id", job_id).execute()
            return True
        except Exception as e:
            print(f"Error updating job status: {e}")
            return False

    def update_job_summary(self, job_id: str, summary: Dict[str, Any]) -> bool:
        """Update job summary"""
        try:
            self.client.table("reconciliation_jobs").update(
                {"summary": summary, "updated_at": "now()"}
            ).eq("id", job_id).execute()
            return True
        except Exception as e:
            print(f"Error updating job summary: {e}")
            return False

    def get_job_files(self, job_id: str) -> List[Dict[str, Any]]:
        """Fetch job files"""
        try:
            response = (
                self.client.table("job_files")
                .select("*")
                .eq("job_id", job_id)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            print(f"Error fetching job files: {e}")
            return []

    def get_mapping_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """Fetch mapping profile"""
        try:
            response = (
                self.client.table("mapping_profiles")
                .select("*")
                .eq("id", profile_id)
                .single()
                .execute()
            )
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching mapping profile: {e}")
            return None

    def get_rule_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """Fetch rule profile"""
        try:
            response = (
                self.client.table("rule_profiles")
                .select("*")
                .eq("id", profile_id)
                .single()
                .execute()
            )
            return response.data if response.data else None
        except Exception as e:
            print(f"Error fetching rule profile: {e}")
            return None

    def insert_mismatch_items(self, items: List[Dict[str, Any]]) -> bool:
        """Insert mismatch items"""
        try:
            if items:
                self.client.table("mismatch_items").insert(items).execute()
            return True
        except Exception as e:
            print(f"Error inserting mismatch items: {e}")
            return False

    def delete_job_mismatches(self, job_id: str) -> bool:
        """Delete existing mismatches for a job"""
        try:
            self.client.table("mismatch_items").delete().eq(
                "job_id", job_id
            ).execute()
            return True
        except Exception as e:
            print(f"Error deleting mismatches: {e}")
            return False

    def insert_job_file(
        self,
        job_id: str,
        firm_id: str,
        file_type: str,
        storage_path: str,
        original_filename: str,
        storage_bucket: str = "job-files",
        file_size_bytes: int = 0,
        mime_type: str = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        created_by: str = None,
    ) -> bool:
        """Insert a job file record"""
        try:
            self.client.table("job_files").insert(
                {
                    "job_id": job_id,
                    "firm_id": firm_id,
                    "file_type": file_type,
                    "storage_path": storage_path,
                    "original_filename": original_filename,
                    "storage_bucket": storage_bucket,
                    "file_size_bytes": file_size_bytes,
                    "mime_type": mime_type,
                    "created_by": created_by,
                }
            ).execute()
            return True
        except Exception as e:
            print(f"Error inserting job file: {e}")
            return False

    # ─── Storage Operations ───────────────────────────────────────────────

    def download_file(self, bucket: str, path: str) -> Optional[bytes]:
        """Download file from storage"""
        try:
            response = self.client.storage.from_(bucket).download(path)
            return response
        except Exception as e:
            print(f"Error downloading file: {e}")
            return None

    def upload_file(
        self, bucket: str, path: str, file_data: bytes
    ) -> bool:
        """Upload file to storage"""
        try:
            self.client.storage.from_(bucket).upload(path, file_data)
            return True
        except Exception as e:
            print(f"Error uploading file: {e}")
            return False


# Global instance
supabase = SupabaseClient()
