from typing import List
from app.schemas.base import CamelModel


class ScanRecord(CamelModel):
    id: str
    app_name: str
    package_name: str
    risk_score: int
    risk_level: str
    scan_date: str
    sha256: str


class PaginatedHistoryResponse(CamelModel):
    items: List[ScanRecord]
    total: int
    page: int
    total_pages: int
