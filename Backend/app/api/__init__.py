from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.analyze import router as analyze_router
from app.api.report import router as report_router
from app.api.history import router as history_router
from app.api.settings import router as settings_router
from app.api.health import router as health_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(analyze_router)
api_router.include_router(report_router)
api_router.include_router(history_router)
api_router.include_router(settings_router)
api_router.include_router(health_router)
