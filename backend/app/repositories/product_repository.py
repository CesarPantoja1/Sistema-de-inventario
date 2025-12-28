"""
Repository para acceso a datos de productos.
"""
from typing import Optional
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from app.models.product import Product


class ProductRepository:
    """Repository para operaciones CRUD de productos."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: int, with_relations: bool = False) -> Optional[Product]:
        """Obtener producto por ID."""
        query = self.db.query(Product)
        if with_relations:
            query = query.options(
                joinedload(Product.category),
                joinedload(Product.supplier)
            )
        return query.filter(Product.id == product_id).first()

    def get_by_sku(self, sku: str) -> Optional[Product]:
        """Obtener producto por SKU."""
        return self.db.query(Product).filter(Product.sku == sku.upper()).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        low_stock_only: bool = False,
        search: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        with_relations: bool = False
    ) -> list[Product]:
        """Obtener todos los productos con filtros y paginación."""
        query = self.db.query(Product)

        if with_relations:
            query = query.options(
                joinedload(Product.category),
                joinedload(Product.supplier)
            )

        # Aplicar filtros
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)

        if supplier_id is not None:
            query = query.filter(Product.supplier_id == supplier_id)

        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        if low_stock_only:
            query = query.filter(Product.stock_current < Product.stock_min)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        return query.order_by(Product.name).offset(skip).limit(limit).all()

    def count(
        self,
        category_id: Optional[int] = None,
        supplier_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        low_stock_only: bool = False,
        search: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None
    ) -> int:
        """Contar productos con filtros."""
        query = self.db.query(func.count(Product.id))

        if category_id is not None:
            query = query.filter(Product.category_id == category_id)

        if supplier_id is not None:
            query = query.filter(Product.supplier_id == supplier_id)

        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        if low_stock_only:
            query = query.filter(Product.stock_current < Product.stock_min)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        return query.scalar()

    def create(self, product_data: dict) -> Product:
        """Crear un nuevo producto."""
        product = Product(**product_data)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product_id: int, product_data: dict) -> Optional[Product]:
        """Actualizar un producto existente."""
        product = self.get_by_id(product_id)
        if not product:
            return None

        for key, value in product_data.items():
            if value is not None:
                setattr(product, key, value)

        self.db.commit()
        self.db.refresh(product)
        return product

    def update_stock(self, product_id: int, new_stock: int) -> Optional[Product]:
        """Establecer el stock de un producto a un valor específico."""
        product = self.get_by_id(product_id)
        if not product:
            return None

        if new_stock < 0:
            return None  # No permitir stock negativo

        product.stock_current = new_stock
        self.db.commit()
        self.db.refresh(product)
        return product

    def add_stock(self, product_id: int, quantity: int) -> Optional[Product]:
        """Agregar cantidad al stock de un producto."""
        product = self.get_by_id(product_id)
        if not product:
            return None

        new_stock = product.stock_current + quantity
        if new_stock < 0:
            return None  # No permitir stock negativo

        product.stock_current = new_stock
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product_id: int, soft: bool = True) -> bool:
        """Eliminar un producto (soft delete por defecto)."""
        product = self.get_by_id(product_id)
        if not product:
            return False

        if soft:
            product.is_active = False
            self.db.commit()
        else:
            self.db.delete(product)
            self.db.commit()

        return True

    def exists_by_sku(self, sku: str, exclude_id: Optional[int] = None) -> bool:
        """Verificar si existe un producto con el SKU dado."""
        query = self.db.query(Product).filter(Product.sku == sku.upper())
        if exclude_id:
            query = query.filter(Product.id != exclude_id)
        return query.first() is not None

    def get_low_stock_products(self, limit: int = 50) -> list[Product]:
        """Obtener productos con stock bajo."""
        return (
            self.db.query(Product)
            .options(joinedload(Product.category), joinedload(Product.supplier))
            .filter(Product.is_active == True)
            .filter(Product.stock_current < Product.stock_min)
            .order_by(Product.stock_current)
            .limit(limit)
            .all()
        )

    def get_by_category(self, category_id: int, only_active: bool = True) -> list[Product]:
        """Obtener productos por categoría."""
        query = self.db.query(Product).filter(Product.category_id == category_id)
        if only_active:
            query = query.filter(Product.is_active == True)
        return query.order_by(Product.name).all()

    def get_by_supplier(self, supplier_id: int, only_active: bool = True) -> list[Product]:
        """Obtener productos por proveedor."""
        query = self.db.query(Product).filter(Product.supplier_id == supplier_id)
        if only_active:
            query = query.filter(Product.is_active == True)
        return query.order_by(Product.name).all()
