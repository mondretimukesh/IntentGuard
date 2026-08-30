import os
import hashlib
import asyncio
import logging
import traceback
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_optional_current_user
from app.models.job import Job
from app.models.user import User
from app.schemas.analyze import AnalyzeResponse, JobStatusResponse, LogMessage
from app.services.storage import storage_service
from app.workers.tasks import analyze_apk_task, run_analysis_pipeline_async

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["APK Analysis Pipeline"])


async def _safe_run_pipeline(job_id: str, file_path: str):
    try:
        await run_analysis_pipeline_async(job_id, file_path)
    except Exception as e:
        logger.error("Unhandled pipeline exception for job %s: %s", job_id, e)
        traceback.print_exc()


@router.post("", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
async def upload_and_analyze_apk(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    """
    Upload an Android APK file for static security and financial risk analysis.
    Computes SHA-256 hash, persists file in storage, creates queued job,
    dispatches asynchronous background worker task, and returns immediately.
    """
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Compute SHA-256
    sha256_hash = hashlib.sha256(content).hexdigest()
    filename = file.filename or "uploaded_app.apk"
    file_size = len(content)

    # Store file
    saved_path = storage_service.save_apk_file(filename=f"{sha256_hash[:12]}_{filename}", content=content)

    initial_logs = [
        {
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
            "level": "INFO",
            "message": f"Received package '{filename}' ({file_size / (1024*1024):.1f} MB).",
            "color": "#06B6D4"
        },
        {
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
            "level": "INFO",
            "message": "Enqueued in analysis pipeline. Worker allocated.",
            "color": "#06B6D4"
        }
    ]

    # Create Job row in DB
    new_job = Job(
        sha256=sha256_hash,
        original_filename=filename,
        file_size_bytes=file_size,
        file_path=saved_path,
        status="queued",
        current_step="Job Queued in Worker Pipeline",
        estimated_time_remaining=15,
        logs=initial_logs,
        user_id=current_user.id if current_user else None
    )
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)

    # Launch pipeline task asynchronously in the background event loop
    asyncio.create_task(_safe_run_pipeline(new_job.id, saved_path))

    return AnalyzeResponse(
        jobId=new_job.id,
        sha256=sha256_hash
    )


@router.get("/{job_id}", response_model=JobStatusResponse, status_code=status.HTTP_200_OK)
async def get_job_status(
    job_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Poll live execution status and terminal streaming logs for an APK analysis job.
    """
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{job_id}' not found."
        )

    log_models = [LogMessage(**entry) for entry in (job.logs or [])]

    return JobStatusResponse(
        jobId=job.id,
        status=job.status,
        currentStep=job.current_step,
        logs=log_models,
        estimatedTimeRemaining=job.estimated_time_remaining,
        sha256=job.sha256,
        reportId=job.report_id,
        error=job.error
    )
