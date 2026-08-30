import secrets
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin, get_client_ip
from app.core.security import get_password_hash
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.admin import (
    AdminUserItem,
    AdminCreateUserRequest,
    AdminCreateUserResponse,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    AuditLogResponse,
)

router = APIRouter(prefix="/admin", tags=["Admin Management"])


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _format_time_relative(dt: datetime) -> str:
    """Format datetime into a readable relative string."""
    diff = datetime.now(timezone.utc) - dt.replace(tzinfo=timezone.utc if dt.tzinfo is None else dt.tzinfo)
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} mins ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hours ago"
    days = hours // 24
    if days == 1:
        return "Yesterday"
    return f"{days} days ago"


def _format_user_to_admin_item(u: User) -> AdminUserItem:
    last_active = "Never"
    if u.last_login:
        last_active = _format_time_relative(u.last_login)

    return AdminUserItem(
        id=u.id,
        name=u.full_name,
        email=u.email,
        role=u.role,
        organization=u.organization,
        status=u.status,
        last_active=last_active,
        last_login=u.last_login.isoformat() if u.last_login else None,
        created_at=u.created_at.isoformat() if u.created_at else None,
    )


@router.get("/users", response_model=List[AdminUserItem])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all registered system users (Requires role=admin)."""
    result = await db.execute(select(User).order_by(desc(User.created_at)))
    users = result.scalars().all()
    return [_format_user_to_admin_item(u) for u in users]


@router.post("/users", response_model=AdminCreateUserResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    payload: AdminCreateUserRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Admin-provision a new user account with temporary credentials (Requires role=admin)."""
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Use provided name or fullName
    full_name = payload.full_name or payload.name or "New Analyst"
    temp_password = payload.temp_password or f"Temp@{secrets.token_hex(4)}!"

    new_user = User(
        email=payload.email.lower(),
        full_name=full_name,
        hashed_password=get_password_hash(temp_password),
        role=payload.role,
        organization=payload.organization or "General Analyst",
        status="active",
        last_login=None,
    )
    db.add(new_user)

    # Write audit log in same transaction
    audit_entry = AuditLog(
        user_email=admin.email,
        role=admin.role,
        action="Admin Created User",
        event="User Provisioning",
        details=f"Admin {admin.email} created user {new_user.email} with role {new_user.role}.",
        ip_address=get_client_ip(request),
        severity="info",
        timestamp=utcnow()
    )
    db.add(audit_entry)

    await db.commit()
    await db.refresh(new_user)

    return AdminCreateUserResponse(
        user=_format_user_to_admin_item(new_user),
        temp_password=temp_password
    )


@router.patch("/users/{user_id}/role", response_model=AdminUserItem)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update role for a specific user (Requires role=admin). Writes audit log in same transaction."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    old_role = user.role
    user.role = payload.role
    user.updated_at = utcnow()

    # Atomic audit log write
    audit_entry = AuditLog(
        user_email=admin.email,
        role=admin.role,
        action="User Role Updated",
        event="Role Mutation",
        details=f"Admin {admin.email} changed role of {user.email} from '{old_role}' to '{user.role}'.",
        ip_address=get_client_ip(request),
        severity="warning",
        timestamp=utcnow()
    )
    db.add(audit_entry)

    await db.commit()
    await db.refresh(user)
    return _format_user_to_admin_item(user)


@router.patch("/users/{user_id}/status", response_model=AdminUserItem)
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Suspend or reactivate a specific user account (Requires role=admin). Writes audit log in same transaction."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    old_status = user.status
    user.status = payload.status
    user.updated_at = utcnow()

    # Atomic audit log write
    severity = "critical" if payload.status == "suspended" else "info"
    action_text = "User Suspended" if payload.status == "suspended" else "User Reactivated"

    audit_entry = AuditLog(
        user_email=admin.email,
        role=admin.role,
        action=action_text,
        event=f"Status Change ({payload.status})",
        details=f"Admin {admin.email} modified account status of {user.email} from '{old_status}' to '{user.status}'.",
        ip_address=get_client_ip(request),
        severity=severity,
        timestamp=utcnow()
    )
    db.add(audit_entry)

    await db.commit()
    await db.refresh(user)
    return _format_user_to_admin_item(user)


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve immutable security audit trail (Requires role=admin)."""
    result = await db.execute(select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit))
    logs = result.scalars().all()

    return [
        AuditLogResponse(
            id=log.id,
            timestamp=log.timestamp.isoformat(),
            time=log.timestamp.strftime("%H:%M:%S"),
            user=log.user_email,
            role=log.role,
            event=log.event or log.action,
            action=log.action,
            ip=log.ip_address,
            severity=log.severity,
            details=log.details,
        )
        for log in logs
    ]
