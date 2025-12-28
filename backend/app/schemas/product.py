"""
Schemas Pydantic para validación de datos de productos.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator

from app.schemas.category import CategoryResponse
from app.schemas.supplier import SupplierResponse


class ProductBase(BaseModel):
    """Campos base de producto."""
    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    stock_min: int = Field(default=0, ge=0)
    cost: Decimal = Field(..., ge=0, decimal_places=2)
    price: Decimal = Field(..., ge=0, decimal_places=2)

    @field_validator('sku')
    @classmethod
    def sku_uppercase(cls, v: str) -> str:
        """Convertir SKU a mayúsculas."""
        return v.upper().strip()


class ProductCreate(ProductBase):
    """Schema para crear un producto."""
    stock_current: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    """Schema para actualizar un producto."""
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    stock_min: Optional[int] = Field(default=None, ge=0)
    cost: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    is_active: Optional[bool] = None

    @field_validator('sku')
    @classmethod
    def sku_uppercase(cls, v: Optional[str]) -> Optional[str]:
        """Convertir SKU a mayúsculas."""
        if v is not None:
            return v.upper().strip()
        return v


class ProductResponse(BaseModel):
    """Schema para respuesta de producto."""
    id: int
    sku: str
    name: str
    description: Optional[str]
    category_id: Optional[int]
    supplier_id: Optional[int]
    stock_current: int
    stock_min: int
    cost: Decimal
    price: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductWithRelations(ProductResponse):
    """Schema de producto con relaciones cargadas."""
    category: Optional[CategoryResponse] = None
    supplier: Optional[SupplierResponse] = None
    is_low_stock: bool = False
    profit_margin: float = 0.0


class ProductListResponse(BaseModel):
    """Schema para listado paginado de productos."""
    items: list[ProductWithRelations]
    total: int
    page: int
    page_size: int
    pages: int


class ProductFilter(BaseModel):
    """Schema para filtrar productos."""
    search: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    is_active: Optional[bool] = None
    low_stock_only: bool = False
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
