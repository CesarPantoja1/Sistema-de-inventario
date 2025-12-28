"""
Schemas Pydantic para validación de datos de proveedores.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SupplierBase(BaseModel):
    """Campos base de proveedor."""
    name: str = Field(..., min_length=2, max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=500)


class SupplierCreate(SupplierBase):
    """Schema para crear un proveedor."""
    pass


class SupplierUpdate(BaseModel):
    """Schema para actualizar un proveedor."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = None


class SupplierResponse(SupplierBase):
    """Schema para respuesta de proveedor."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupplierWithProductCount(SupplierResponse):
    """Schema de proveedor con conteo de productos."""
    product_count: int = 0
