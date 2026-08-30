from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.report import Report
from app.schemas.report import AnalysisReport
from app.services.pdf_exporter import generate_report_pdf

router = APIRouter(prefix="/report", tags=["Analysis Reports"])


@router.get("/{report_id}", response_model=AnalysisReport, status_code=status.HTTP_200_OK)
async def get_analysis_report(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve full multi-dimensional security and financial-risk intelligence report.
    Lookup supports report ID, job ID, or SHA-256 hash.
    """
    query = select(Report).where(
        (Report.id == report_id) | (Report.job_id == report_id) | (Report.sha256 == report_id)
    )
    result = await db.execute(query)
    report = result.scalars().first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Security analysis report '{report_id}' not found."
        )

    # Return full parsed report JSON
    return AnalysisReport.model_validate(report.full_report_json)


@router.get("/{report_id}/export", status_code=status.HTTP_200_OK)
async def export_report_pdf(
    report_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Export full security analysis report as a formatted, executive PDF binary document.
    """
    query = select(Report).where(
        (Report.id == report_id) | (Report.job_id == report_id) | (Report.sha256 == report_id)
    )
    result = await db.execute(query)
    report = result.scalars().first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Security report '{report_id}' not found for PDF export."
        )

    report_schema = AnalysisReport.model_validate(report.full_report_json)
    pdf_bytes = generate_report_pdf(report_schema)

    filename = f"IntentShield_Report_{report.package_name}_{report.job_id[:8]}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
