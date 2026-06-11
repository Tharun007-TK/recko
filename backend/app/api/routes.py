"""
API routes for reconciliation service
"""

from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from typing import Optional
import logging

from app.models.schemas import (
    ReconciliationStartRequest,
    ReconciliationStatusResponse,
    HealthCheckResponse,
)
from app.utils.supabase import supabase
from app.services.reconciliation import ReconciliationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["reconciliation"])


def run_reconciliation_task(job_id: str, firm_id: str):
    """Background task to run reconciliation logic"""
    logger.info(f"Starting reconciliation background task for job {job_id}")
    try:
        # 1. Fetch job from database
        job = supabase.get_job(job_id)
        if not job:
            logger.error(f"Job {job_id} not found")
            return

        # 3. Fetch mapping and rule profiles
        mapping_profile = None
        rule_profile = None

        if job.get("mapping_profile_id"):
            mapping_profile = supabase.get_mapping_profile(
                job.get("mapping_profile_id")
            )

        if job.get("rule_profile_id"):
            rule_profile = supabase.get_rule_profile(job.get("rule_profile_id"))

        # 4. Fetch job files
        job_files = supabase.get_job_files(job_id)
        tally_file = next((f for f in job_files if f.get("file_type") == "tally_source"), None)
        gst_file = next((f for f in job_files if f.get("file_type") == "gst_source"), None)

        if not tally_file or not gst_file:
            logger.error("Missing Tally or GST file")
            supabase.update_job_status(job_id, "failed")
            return

        # 5. Download files from storage
        tally_data = supabase.download_file("job-files", tally_file.get("storage_path"))
        gst_data = supabase.download_file("job-files", gst_file.get("storage_path"))

        if not tally_data or not gst_data:
            logger.error("Failed to download files")
            supabase.update_job_status(job_id, "failed")
            return

        # 6. Create reconciliation service
        service = ReconciliationService(mapping_profile, rule_profile)

        # 7. Load Excel files
        import io
        tally_df = service.load_excel_file(io.BytesIO(tally_data))
        gst_df = service.load_gst_file(io.BytesIO(gst_data))

        if tally_df is None or gst_df is None:
            logger.error("Failed to parse Excel files")
            supabase.update_job_status(job_id, "failed")
            return

        # 8. Apply mappings
        # (Handled internally now)

        # 9. Run reconciliation
        result = service.reconcile(tally_df, gst_df, job_id, firm_id)

        # 10. Delete existing mismatches
        supabase.delete_job_mismatches(job_id)

        # 11. Insert mismatch items (non-fatal if schema not ready)
        if result.mismatches:
            success = supabase.insert_mismatch_items(result.mismatches)
            if not success:
                logger.warning("Failed to insert mismatch items (schema may need migration) - continuing to completion")

        # 12. Generate Excel Report
        report_data = service.generate_excel_report(result)
        report_path = f"{firm_id}/{job_id}/reconciliation_report.xlsx"
        upload_success = supabase.upload_file("job-files", report_path, report_data)
        
        if upload_success:
            # Create job file record for report
            supabase.insert_job_file(
                job_id=job_id,
                firm_id=firm_id,
                file_type="report_output",
                storage_path=report_path,
                original_filename="reconciliation_report.xlsx",
                file_size_bytes=len(report_data),
                created_by=job.get("created_by")
            )

        # 13. Update job summary
        summary = {
            "total_records": result.total_records,
            "matched": result.matched,
            "mismatched": result.mismatched,
            "missing_in_gst": result.missing_in_gst,
            "missing_in_tally": result.missing_in_tally,
            "format_differences": result.format_differences,
        }
        supabase.update_job_summary(job_id, summary)

        # 14. Update job status to completed
        supabase.update_job_status(job_id, "completed")

        logger.info(f"Reconciliation completed for job {job_id}")

    except Exception as e:
        logger.error(f"Error during reconciliation: {e}", exc_info=True)
        # Update job status to failed
        supabase.update_job_status(job_id, "failed")


@router.post("/reconciliation/start", response_model=ReconciliationStatusResponse)
async def start_reconciliation(request: ReconciliationStartRequest, background_tasks: BackgroundTasks):
    """
    Start reconciliation for a job
    """
    job_id = request.job_id
    firm_id = request.firm_id

    logger.info(f"Starting reconciliation for job {job_id}")

    try:
        # 1. Fetch job from database to verify access
        job = supabase.get_job(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job {job_id} not found",
            )

        if job.get("firm_id") != firm_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to job",
            )

        # 2. Update job status to processing
        supabase.update_job_status(job_id, "processing")

        # 3. Enqueue background task
        background_tasks.add_task(run_reconciliation_task, job_id, firm_id)

        return ReconciliationStatusResponse(
            job_id=job_id,
            status="processing",
            message="Reconciliation started in background",
            summary={},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting reconciliation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start reconciliation: {str(e)}",
        )


@router.get("/reconciliation/{job_id}")
async def get_reconciliation_status(job_id: str):
    """
    Get reconciliation status for a job
    """
    try:
        job = supabase.get_job(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job {job_id} not found",
            )

        return ReconciliationStatusResponse(
            job_id=job_id,
            status=job.get("status"),
            message=f"Job status: {job.get('status')}",
            summary=job.get("summary_json"),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reconciliation status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reconciliation status",
        )
