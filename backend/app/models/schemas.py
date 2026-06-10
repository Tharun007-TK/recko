"""
Pydantic models for request/response schemas
"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ReconciliationStartRequest(BaseModel):
    """Request to start reconciliation on a job"""

    job_id: str
    firm_id: str


class ReconciliationStatusResponse(BaseModel):
    """Response with reconciliation status"""

    job_id: str
    status: str
    message: str
    summary: Optional[dict] = None


class MismatchItemResponse(BaseModel):
    """Response model for a mismatch item"""

    id: str
    job_id: str
    firm_id: str
    category: str
    match_key: str
    field_name: Optional[str]
    tally_value: Optional[str]
    gst_value: Optional[str]
    normalized_tally: Optional[str]
    normalized_gst: Optional[str]
    reason: Optional[str]


class HealthCheckResponse(BaseModel):
    """Response for health check"""

    status: str
    service: str
    version: str


class ErrorResponse(BaseModel):
    """Error response"""

    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
