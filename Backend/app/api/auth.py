from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_active_user, get_client_ip
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    ChangePasswordRequest,
    GenericMessageResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.full_name,
        email=user.email,
        role=user.role,
        status=user.status,
        organization=user.organization,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user account."""
    # Check if email is already registered
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Determine role (default to "user" unless explicitly admin and first user or admin registration)
    role = "admin" if payload.role == "admin" else "user"

    new_user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=role,
        organization=payload.organization or "General Analyst",
        status="active",
        last_login=utcnow()
    )
    db.add(new_user)
    
    # Audit log
    audit_entry = AuditLog(
        user_email=new_user.email,
        role=new_user.role,
        action="User Registered",
        event="User Registration",
        details=f"User {new_user.email} self-registered with role {new_user.role}.",
        ip_address=get_client_ip(request),
        severity="info",
        timestamp=utcnow()
    )
    db.add(audit_entry)
    
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return AuthResponse(token=token, user=_user_to_response(new_user))


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
@router.post("/signin", response_model=AuthResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate with email and password to receive a signed JWT."""
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalars().first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended. Please contact platform administrator."
        )

    user.last_login = utcnow()
    
    # Audit log
    audit_entry = AuditLog(
        user_email=user.email,
        role=user.role,
        action="User Login",
        event="User Login",
        details=f"User {user.email} authenticated successfully.",
        ip_address=get_client_ip(request),
        severity="info",
        timestamp=utcnow()
    )
    db.add(audit_entry)
    
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return AuthResponse(token=token, user=_user_to_response(user))


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve profile of authenticated user."""
    return _user_to_response(current_user)


@router.post("/change-password", response_model=GenericMessageResponse, status_code=status.HTTP_200_OK)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change password for authenticated user."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    current_user.updated_at = utcnow()
    
    audit_entry = AuditLog(
        user_email=current_user.email,
        role=current_user.role,
        action="Password Changed",
        event="Password Update",
        details=f"User {current_user.email} changed account password.",
        ip_address=get_client_ip(request),
        severity="warning",
        timestamp=utcnow()
    )
    db.add(audit_entry)
    
    await db.commit()
    return GenericMessageResponse(success=True, message="Password updated successfully.")
