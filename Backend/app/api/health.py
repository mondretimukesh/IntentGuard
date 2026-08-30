from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.health import HealthStatus

router = APIRouter(prefix="/health", tags=["System Health"])


@router.get("", response_model=HealthStatus, status_code=status.HTTP_200_OK)
async def check_health():
    """
    Perform service health check and version verification.
    """
    return HealthStatus(
        status="ok",
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        api_mode="live"
    )
