from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.settings import SystemSetting
from app.schemas.settings import (
    AppSettings,
    UpdateAppSettingsRequest,
    RiskWeights,
    ThreatIntelSource,
    CapabilityTuningWeights,
)

router = APIRouter(prefix="/settings", tags=["Application Settings & CTI Policies"])


async def _get_or_create_settings(db: AsyncSession) -> SystemSetting:
    result = await db.execute(select(SystemSetting).where(SystemSetting.id == 1))
    setting = result.scalars().first()
    if not setting:
        setting = SystemSetting(id=1)
        db.add(setting)
        await db.commit()
        await db.refresh(setting)
    return setting


@router.get("", response_model=AppSettings, status_code=status.HTTP_200_OK)
async def get_application_settings(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve application settings and capability tuning weights.
    """
    setting = await _get_or_create_settings(db)
    tuning = CapabilityTuningWeights(**(setting.capability_tuning or {}))
    
    return AppSettings(
        autoDeleteApks=setting.auto_delete_apks,
        retainHistory=setting.retain_history,
        capabilityTuning=tuning
    )


@router.patch("", response_model=AppSettings, status_code=status.HTTP_200_OK)
async def update_application_settings(
    payload: UpdateAppSettingsRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update application settings and capability tuning weights.
    Updated capability weights dynamically feed into future analysis runs.
    """
    setting = await _get_or_create_settings(db)

    if payload.auto_delete_apks is not None:
        setting.auto_delete_apks = payload.auto_delete_apks
    if payload.retain_history is not None:
        setting.retain_history = payload.retain_history
    if payload.capability_tuning is not None:
        setting.capability_tuning = payload.capability_tuning.model_dump(by_alias=True)

    await db.commit()
    await db.refresh(setting)

    tuning = CapabilityTuningWeights(**(setting.capability_tuning or {}))
    return AppSettings(
        autoDeleteApks=setting.auto_delete_apks,
        retainHistory=setting.retain_history,
        capabilityTuning=tuning
    )


@router.get("/risk-weights", response_model=RiskWeights, status_code=status.HTTP_200_OK)
async def get_risk_weights(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve read-only 6-Factor Risk Formula Weights (Sum = 1.00).
    """
    setting = await _get_or_create_settings(db)
    return RiskWeights(**(setting.risk_weights or {}))


@router.get("/threat-intel-sources", response_model=List[ThreatIntelSource], status_code=status.HTTP_200_OK)
async def get_threat_intel_sources(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve connected Cyber Threat Intelligence (CTI) feeds and synchronization health.
    """
    setting = await _get_or_create_settings(db)
    sources = setting.threat_intel_sources or []
    return [ThreatIntelSource(**s) for s in sources]
