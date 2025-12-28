"""
Schemas Pydantic para validación de datos de usuarios.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# Schema base compartido
class UserBase(BaseModel):
    """Campos base de usuario."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


# Schema para crear usuario (registro)
class UserCreate(UserBase):
    """Schema para crear un nuevo usuario."""
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = Field(default="seller", pattern="^(admin|seller|warehouse_keeper)$")


# Schema para login
class UserLogin(BaseModel):
    """Schema para login de usuario."""
    email: EmailStr
    password: str


# Schema para respuesta (sin password)
class UserResponse(UserBase):
    """Schema para respuesta de usuario (sin datos sensibles)."""
    id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Schema para token de acceso
class Token(BaseModel):
    """Schema para token JWT."""
    access_token: str
    token_type: str = "bearer"


# Schema para datos dentro del token
class TokenData(BaseModel):
    """Schema para datos decodificados del token."""
    email: Optional[str] = None
    user_id: Optional[int] = None
