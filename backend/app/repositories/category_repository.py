"""
Repository para acceso a datos de categorías.
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.category import Category
from app.models.product import Product


class CategoryRepository:
    """Repository para operaciones CRUD de categorías."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, category_id: int) -> Optional[Category]:
        """Obtener categoría por ID."""
        return self.db.query(Category).filter(Category.id == category_id).first()

    def get_by_name(self, name: str) -> Optional[Category]:
        """Obtener categoría por nombre."""
        return self.db.query(Category).filter(Category.name == name).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Category]:
        """Obtener todas las categorías con paginación."""
        return self.db.query(Category).order_by(Category.name).offset(skip).limit(limit).all()

    def get_all_with_product_count(self, skip: int = 0, limit: int = 100) -> list[tuple[Category, int]]:
        """Obtener categorías con conteo de productos."""
        return (
            self.db.query(Category, func.count(Product.id).label("product_count"))
            .outerjoin(Product, Category.id == Product.category_id)
            .group_by(Category.id)
            .order_by(Category.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(self) -> int:
        """Contar total de categorías."""
        return self.db.query(func.count(Category.id)).scalar()

    def create(self, category_data: dict) -> Category:
        """Crear una nueva categoría."""
        category = Category(**category_data)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category_id: int, category_data: dict) -> Optional[Category]:
        """Actualizar una categoría existente."""
        category = self.get_by_id(category_id)
        if not category:
            return None

        for key, value in category_data.items():
            if value is not None:
                setattr(category, key, value)

        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category_id: int) -> bool:
        """Eliminar una categoría."""
        category = self.get_by_id(category_id)
        if not category:
            return False

        self.db.delete(category)
        self.db.commit()
        return True

    def exists_by_name(self, name: str, exclude_id: Optional[int] = None) -> bool:
        """Verificar si existe una categoría con el nombre dado."""
        query = self.db.query(Category).filter(Category.name == name)
        if exclude_id:
            query = query.filter(Category.id != exclude_id)
        return query.first() is not None

    def has_products(self, category_id: int) -> bool:
        """Verificar si la categoría tiene productos asociados."""
        return (
            self.db.query(Product)
            .filter(Product.category_id == category_id)
            .first() is not None
        )
