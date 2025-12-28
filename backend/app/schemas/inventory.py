"""
Schemas Pydantic para movimientos de inventario.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


# ==================== ENUMS ====================

class MovementTypeEnum(str, Enum):
    """Tipos de movimiento de inventario."""
    ENTRY = "entry"
    EXIT = "exit"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"


class MovementReasonEnum(str, Enum):
    """Razones específicas del movimiento."""
    # Entradas
    PURCHASE = "purchase"
    CUSTOMER_RETURN = "customer_return"
    INITIAL_STOCK = "initial_stock"
    
    # Salidas
    SALE = "sale"
    SUPPLIER_RETURN = "supplier_return"
    DAMAGED = "damaged"
    EXPIRED = "expired"
    THEFT = "theft"
    
    # Ajustes
    PHYSICAL_COUNT = "physical_count"
    CORRECTION = "correction"
    OTHER = "other"


# ==================== BASE SCHEMAS ====================

class InventoryMovementBase(BaseModel):
    """Schema base para movimientos de inventario."""
    product_id: int = Field(..., description="ID del producto")
    movement_type: MovementTypeEnum = Field(..., description="Tipo de movimiento")
    reason: MovementReasonEnum = Field(..., description="Razón del movimiento")
    quantity: int = Field(..., gt=0, description="Cantidad del movimiento (siempre positivo)")
    reference: Optional[str] = Field(None, max_length=100, description="Referencia externa")
    notes: Optional[str] = Field(None, description="Notas adicionales")


# ==================== CREATE SCHEMAS ====================

class InventoryMovementCreate(BaseModel):
    """Schema para crear un movimiento de inventario."""
    product_id: int = Field(..., description="ID del producto")
    movement_type: MovementTypeEnum = Field(..., description="Tipo de movimiento")
    reason: MovementReasonEnum = Field(..., description="Razón del movimiento")
    quantity: int = Field(..., gt=0, description="Cantidad del movimiento")
    reference: Optional[str] = Field(None, max_length=100, description="Referencia externa")
    notes: Optional[str] = Field(None, description="Notas adicionales")


class StockAdjustment(BaseModel):
    """Schema para ajuste rápido de stock."""
    product_id: int = Field(..., description="ID del producto")
    new_stock: int = Field(..., ge=0, description="Nuevo valor de stock")
    reason: MovementReasonEnum = Field(
        default=MovementReasonEnum.PHYSICAL_COUNT,
        description="Razón del ajuste"
    )
    notes: Optional[str] = Field(None, description="Notas del ajuste")


class BatchStockEntry(BaseModel):
    """Schema para entrada masiva de stock (compra)."""
    product_id: int = Field(..., description="ID del producto")
    quantity: int = Field(..., gt=0, description="Cantidad a agregar")
    reference: Optional[str] = Field(None, description="Número de factura/orden")
    notes: Optional[str] = Field(None, description="Notas")


class BatchStockEntryRequest(BaseModel):
    """Request para entrada masiva de productos."""
    items: List[BatchStockEntry] = Field(..., min_length=1, description="Lista de productos")
    reference: Optional[str] = Field(None, description="Referencia general de la compra")


# ==================== RESPONSE SCHEMAS ====================

class ProductMinimal(BaseModel):
    """Schema mínimo de producto para respuestas."""
    id: int
    sku: str
    name: str
    
    model_config = ConfigDict(from_attributes=True)


class UserMinimal(BaseModel):
    """Schema mínimo de usuario para respuestas."""
    id: int
    full_name: str
    
    model_config = ConfigDict(from_attributes=True)


class InventoryMovementResponse(BaseModel):
    """Schema de respuesta para un movimiento de inventario."""
    id: int
    product_id: int
    movement_type: MovementTypeEnum
    reason: MovementReasonEnum
    quantity: int
    stock_before: int
    stock_after: int
    reference: Optional[str]
    notes: Optional[str]
    user_id: Optional[int]
    created_at: datetime
    
    # Relaciones
    product: Optional[ProductMinimal] = None
    user: Optional[UserMinimal] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryMovementList(BaseModel):
    """Schema para lista paginada de movimientos."""
    items: List[InventoryMovementResponse]
    total: int
    page: int
    page_size: int
    pages: int


# ==================== ALERT SCHEMAS ====================

class LowStockProduct(BaseModel):
    """Schema para producto con bajo stock."""
    id: int
    sku: str
    name: str
    stock_current: int
    stock_min: int
    stock_deficit: int = Field(..., description="Cuántas unidades faltan")
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LowStockAlert(BaseModel):
    """Schema para alertas de bajo stock."""
    total_products: int
    critical_count: int = Field(..., description="Sin stock")
    warning_count: int = Field(..., description="Bajo stock mínimo")
    products: List[LowStockProduct]


# ==================== FILTER SCHEMAS ====================

class InventoryMovementFilter(BaseModel):
    """Filtros para búsqueda de movimientos."""
    product_id: Optional[int] = None
    movement_type: Optional[MovementTypeEnum] = None
    reason: Optional[MovementReasonEnum] = None
    user_id: Optional[int] = None
    reference: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


# ==================== STATS SCHEMAS ====================

class InventoryStats(BaseModel):
    """Estadísticas generales de inventario."""
    total_products: int
    total_stock_value: float
    low_stock_count: int
    out_of_stock_count: int
    movements_today: int
    movements_this_week: int
    movements_this_month: int
