"""
Servicios del sistema.
"""
from app.services.auth_service import AuthService
from app.services.category_service import CategoryService
from app.services.supplier_service import SupplierService
from app.services.product_service import ProductService
from app.services.inventory_service import InventoryService

__all__ = [
    "AuthService",
    "CategoryService",
    "SupplierService",
    "ProductService",
    "InventoryService",
]
