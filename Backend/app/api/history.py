import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, delete, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.report import Report
from app.models.job import Job
from app.schemas.history import PaginatedHistoryResponse, ScanRecord

router = APIRouter(prefix="/history", tags=["Scan History"])


@router.get("", response_model=PaginatedHistoryResponse, status_code=status.HTTP_200_OK)
async def get_scan_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    filter: str = Query("all"),
    search: str = Query(""),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve paginated scan history logs with risk level filtering and token searching.
    """
    query = select(Report)

    # Risk level filtering
    if filter and filter.lower() != "all":
        query = query.where(Report.risk_level == filter.lower())

    # Text search
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Report.package_name).like(search_pattern),
                func.lower(Report.app_name).like(search_pattern),
                func.lower(Report.sha256).like(search_pattern),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Pagination & Ordering
    offset = (page - 1) * limit
    paged_query = query.order_by(desc(Report.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(paged_query)
    reports = result.scalars().all()

    items = [
        ScanRecord(
            id=r.job_id or r.id,
            appName=r.app_name,
            packageName=r.package_name,
            riskScore=r.risk_score,
            riskLevel=r.risk_level,
            scanDate=r.created_at.strftime("%b %d, %Y"),
            sha256=r.sha256
        )
        for r in reports
    ]

    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1

    return PaginatedHistoryResponse(
        items=items,
        total=total,
        page=page,
        totalPages=total_pages
    )


@router.delete("/{scan_id}", status_code=status.HTTP_200_OK)
async def delete_scan_record(
    scan_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a scan report and associated job record from the platform database.
    """
    # Delete report
    report_del = delete(Report).where(
        (Report.id == scan_id) | (Report.job_id == scan_id) | (Report.sha256 == scan_id)
    )
    await db.execute(report_del)

    # Delete job
    job_del = delete(Job).where(
        (Job.id == scan_id) | (Job.sha256 == scan_id)
    )
    await db.execute(job_del)

    await db.commit()
    return {"success": True, "message": f"Scan record '{scan_id}' removed."}
