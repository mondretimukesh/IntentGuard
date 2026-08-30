from typing import Optional
from pydantic import EmailStr, Field
from app.schemas.base import CamelModel


class RegisterRequest(CamelModel):
    full_name: str = Field(..., min_length=2, max_length=100, alias="fullName")
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user"
    organization: Optional[str] = "General Analyst"


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class UserResponse(CamelModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    organization: Optional[str] = "General Analyst"
    last_login: Optional[str] = None
    created_at: Optional[str] = None


class AuthResponse(CamelModel):
    token: str
    user: UserResponse


class ChangePasswordRequest(CamelModel):
    current_password: str = Field(..., alias="currentPassword")
    new_password: str = Field(..., min_length=6, alias="newPassword")


class GenericMessageResponse(CamelModel):
    success: bool
    message: str
