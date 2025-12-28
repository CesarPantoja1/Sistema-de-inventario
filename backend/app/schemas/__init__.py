"""
Schemas Pydantic del sistema.
"""
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TokenData,
)
from app.schemas.category import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithProductCount,
)
from app.schemas.supplier import (
    SupplierBase,
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierWithProductCount,
)
from app.schemas.product import (
    ProductBase,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductWithRelations,
    ProductListResponse,
    ProductFilter,
)
from app.schemas.inventory import (
    MovementTypeEnum,
    MovementReasonEnum,
    InventoryMovementBase,
    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryMovementList,
    InventoryMovementFilter,
    StockAdjustment,
    BatchStockEntry,
    BatchStockEntryRequest,
    LowStockProduct,
    LowStockAlert,
    InventoryStats,
)

__all__ = [
    # User
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    # Category
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "CategoryWithProductCount",
    # Supplier
    "SupplierBase",
    "SupplierCreate",
    "SupplierUpdate",
    "SupplierResponse",
    "SupplierWithProductCount",
    # Product
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "ProductWithRelations",
    "ProductListResponse",
    "ProductFilter",
    # Inventory
    "MovementTypeEnum",
    "MovementReasonEnum",
    "InventoryMovementBase",
    "InventoryMovementCreate",
    "InventoryMovementResponse",
    "InventoryMovementList",
    "InventoryMovementFilter",
    "StockAdjustment",
    "BatchStockEntry",
    "BatchStockEntryRequest",
    "LowStockProduct",
    "LowStockAlert",
    "InventoryStats",
]
