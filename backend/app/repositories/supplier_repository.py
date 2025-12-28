"""
Repository para acceso a datos de proveedores.
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.supplier import Supplier
from app.models.product import Product


class SupplierRepository:
    """Repository para operaciones CRUD de proveedores."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, supplier_id: int) -> Optional[Supplier]:
        """Obtener proveedor por ID."""
        return self.db.query(Supplier).filter(Supplier.id == supplier_id).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> list[Supplier]:
        """Obtener todos los proveedores con paginación y filtros."""
        query = self.db.query(Supplier)

        if is_active is not None:
            query = query.filter(Supplier.is_active == is_active)

        return query.order_by(Supplier.name).offset(skip).limit(limit).all()

    def get_all_with_product_count(
        self,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> list[tuple[Supplier, int]]:
        """Obtener proveedores con conteo de productos."""
        query = (
            self.db.query(Supplier, func.count(Product.id).label("product_count"))
            .outerjoin(Product, Supplier.id == Product.supplier_id)
        )

        if is_active is not None:
            query = query.filter(Supplier.is_active == is_active)

        return (
            query.group_by(Supplier.id)
            .order_by(Supplier.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(self, is_active: Optional[bool] = None) -> int:
        """Contar total de proveedores."""
        query = self.db.query(func.count(Supplier.id))
        if is_active is not None:
            query = query.filter(Supplier.is_active == is_active)
        return query.scalar()

    def create(self, supplier_data: dict) -> Supplier:
        """Crear un nuevo proveedor."""
        supplier = Supplier(**supplier_data)
        self.db.add(supplier)
        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def update(self, supplier_id: int, supplier_data: dict) -> Optional[Supplier]:
        """Actualizar un proveedor existente."""
        supplier = self.get_by_id(supplier_id)
        if not supplier:
            return None

        for key, value in supplier_data.items():
            if value is not None:
                setattr(supplier, key, value)

        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def delete(self, supplier_id: int, soft: bool = True) -> bool:
        """Eliminar un proveedor (soft delete por defecto)."""
        supplier = self.get_by_id(supplier_id)
        if not supplier:
            return False

        if soft:
            supplier.is_active = False
            self.db.commit()
        else:
            self.db.delete(supplier)
            self.db.commit()

        return True

    def has_products(self, supplier_id: int) -> bool:
        """Verificar si el proveedor tiene productos asociados."""
        return (
            self.db.query(Product)
            .filter(Product.supplier_id == supplier_id)
            .first() is not None
        )

    def search(self, query: str, skip: int = 0, limit: int = 100) -> list[Supplier]:
        """Buscar proveedores por nombre o email."""
        search_term = f"%{query}%"
        return (
            self.db.query(Supplier)
            .filter(
                (Supplier.name.ilike(search_term)) |
                (Supplier.email.ilike(search_term)) |
                (Supplier.contact_person.ilike(search_term))
            )
            .order_by(Supplier.name)
            .offset(skip)
            .limit(limit)
            .all()
        )
