from typing import Optional
from fastapi import Depends, HTTPException, Security, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


def get_client_ip(request: Request) -> str:
    """Extract real client IP address considering proxy headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Authenticate and retrieve current user from JWT Bearer token or API key header."""
    token = None
    
    # Check Bearer token
    if credentials:
        token = credentials.credentials
    
    # Check X-API-Key or fallback query
    if not token:
        token = request.headers.get("X-API-Key") or request.query_params.get("token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Lookup by user id (or email if sub is email)
    query = select(User).where((User.id == user_id) | (User.email == user_id))
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verify that current user account is active and not suspended."""
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is suspended. Please contact platform administrator."
        )
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require user to hold 'admin' role for privileged operations."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required for this operation."
        )
    return current_user


async def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Optionally authenticate user without raising exception if unauthenticated."""
    try:
        return await get_current_user(request, credentials, db)
    except HTTPException:
        return None
