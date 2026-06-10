"""
ReconFlow: FastAPI Backend for Excel Reconciliation
Production-oriented service for reconciling Tally and GST files.
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.api import routes

# Create app instance
app = FastAPI(
    title="ReconFlow Reconciliation Service",
    description="Backend service for Excel file reconciliation",
    version="0.1.0",
)

# Mount routes
app.include_router(routes.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "reconflow-reconciliation",
        "version": "0.1.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ReconFlow Reconciliation Service",
        "docs": "/docs",
        "health": "/health",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
