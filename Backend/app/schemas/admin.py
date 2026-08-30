from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.base import CamelModel


class AdminUserItem(CamelModel):
    id: str
    name: str
    email: str
    role: str
    organization: str
    status: str
    last_active: Optional[str] = None
    last_login: Optional[str] = None
    created_at: Optional[str] = None


class AdminCreateUserRequest(CamelModel):
    name: Optional[str] = None
    full_name: Optional[str] = Field(None, alias="fullName")
    email: EmailStr
    role: str = "user"
    organization: Optional[str] = "General Analyst"
    temp_password: Optional[str] = Field(None, alias="tempPassword")


class AdminCreateUserResponse(CamelModel):
    user: AdminUserItem
    temp_password: str


class UserRoleUpdateRequest(CamelModel):
    role: str = Field(..., pattern="^(user|admin)$")


class UserStatusUpdateRequest(CamelModel):
    status: str = Field(..., pattern="^(active|suspended)$")


class AuditLogResponse(CamelModel):
    id: str
    timestamp: str
    time: str
    user: str
    role: str
    event: str
    action: str
    ip: str
    severity: str
    details: Optional[str] = None
