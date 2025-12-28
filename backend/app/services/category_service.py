"""
Servicio de categorías.
Contiene la lógica de negocio para gestión de categorías.
"""
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.category_repository import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithProductCount,
)
from app.models.category import Category


class CategoryService:
    """Servicio para gestión de categorías."""

    def __init__(self, db: Session):
        self.db = db
        self.category_repo = CategoryRepository(db)

    def create(self, category_data: CategoryCreate) -> CategoryResponse:
        """
        Crear una nueva categoría.

        Args:
            category_data: Datos de la categoría

        Returns:
            Categoría creada

        Raises:
            HTTPException: Si el nombre ya existe
        """
        if self.category_repo.exists_by_name(category_data.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con ese nombre"
            )

        category = self.category_repo.create(category_data.model_dump())
        return CategoryResponse.model_validate(category)

    def get_by_id(self, category_id: int) -> CategoryResponse:
        """
        Obtener una categoría por ID.

        Args:
            category_id: ID de la categoría

        Returns:
            Categoría encontrada

        Raises:
            HTTPException: Si no existe
        """
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
        return CategoryResponse.model_validate(category)

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        with_product_count: bool = False
    ) -> list[CategoryResponse | CategoryWithProductCount]:
        """
        Obtener todas las categorías.

        Args:
            skip: Número de registros a saltar
            limit: Límite de registros
            with_product_count: Incluir conteo de productos

        Returns:
            Lista de categorías
        """
        if with_product_count:
            results = self.category_repo.get_all_with_product_count(skip, limit)
            return [
                CategoryWithProductCount(
                    **CategoryResponse.model_validate(cat).model_dump(),
                    product_count=count
                )
                for cat, count in results
            ]

        categories = self.category_repo.get_all(skip, limit)
        return [CategoryResponse.model_validate(cat) for cat in categories]

    def update(self, category_id: int, category_data: CategoryUpdate) -> CategoryResponse:
        """
        Actualizar una categoría.

        Args:
            category_id: ID de la categoría
            category_data: Datos a actualizar

        Returns:
            Categoría actualizada

        Raises:
            HTTPException: Si no existe o el nombre ya está en uso
        """
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )

        # Verificar nombre único si se está actualizando
        if category_data.name and self.category_repo.exists_by_name(
            category_data.name, exclude_id=category_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con ese nombre"
            )

        update_data = category_data.model_dump(exclude_unset=True)
        updated = self.category_repo.update(category_id, update_data)
        return CategoryResponse.model_validate(updated)

    def delete(self, category_id: int) -> bool:
        """
        Eliminar una categoría.

        Args:
            category_id: ID de la categoría

        Returns:
            True si se eliminó

        Raises:
            HTTPException: Si no existe o tiene productos
        """
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )

        if self.category_repo.has_products(category_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar la categoría porque tiene productos asociados"
            )

        return self.category_repo.delete(category_id)

    def count(self) -> int:
        """Contar total de categorías."""
        return self.category_repo.count()
