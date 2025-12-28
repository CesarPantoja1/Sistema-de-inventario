"""
Schemas Pydantic para validación de datos de categorías.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Campos base de categoría."""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)


class CategoryCreate(CategoryBase):
    """Schema para crear una categoría."""
    pass


class CategoryUpdate(BaseModel):
    """Schema para actualizar una categoría."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)


class CategoryResponse(CategoryBase):
    """Schema para respuesta de categoría."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryWithProductCount(CategoryResponse):
    """Schema de categoría con conteo de productos."""
    product_count: int = 0
