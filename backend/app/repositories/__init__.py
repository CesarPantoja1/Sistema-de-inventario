"""
Repositories del sistema.
"""
from app.repositories.user_repository import UserRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.supplier_repository import SupplierRepository
from app.repositories.product_repository import ProductRepository

__all__ = [
    "UserRepository",
    "CategoryRepository",
    "SupplierRepository",
    "ProductRepository",
]
