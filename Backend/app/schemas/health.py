from typing import Optional
from app.schemas.base import CamelModel


class HealthStatus(CamelModel):
    status: str = "ok"
    version: str = "1.4.0"
    timestamp: str
    api_mode: Optional[str] = "live"
