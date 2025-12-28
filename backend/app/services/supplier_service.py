"""
Servicio de proveedores.
Contiene la lógica de negocio para gestión de proveedores.
"""
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.supplier_repository import SupplierRepository
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierWithProductCount,
)
from app.models.supplier import Supplier


class SupplierService:
    """Servicio para gestión de proveedores."""

    def __init__(self, db: Session):
        self.db = db
        self.supplier_repo = SupplierRepository(db)

    def create(self, supplier_data: SupplierCreate) -> SupplierResponse:
        """
        Crear un nuevo proveedor.

        Args:
            supplier_data: Datos del proveedor

        Returns:
            Proveedor creado
        """
        supplier = self.supplier_repo.create(supplier_data.model_dump())
        return SupplierResponse.model_validate(supplier)

    def get_by_id(self, supplier_id: int) -> SupplierResponse:
        """
        Obtener un proveedor por ID.

        Args:
            supplier_id: ID del proveedor

        Returns:
            Proveedor encontrado

        Raises:
            HTTPException: Si no existe
        """
        supplier = self.supplier_repo.get_by_id(supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado"
            )
        return SupplierResponse.model_validate(supplier)

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
        with_product_count: bool = False
    ) -> list[SupplierResponse | SupplierWithProductCount]:
        """
        Obtener todos los proveedores.

        Args:
            skip: Número de registros a saltar
            limit: Límite de registros
            is_active: Filtrar por estado activo
            with_product_count: Incluir conteo de productos

        Returns:
            Lista de proveedores
        """
        if with_product_count:
            results = self.supplier_repo.get_all_with_product_count(skip, limit, is_active)
            return [
                SupplierWithProductCount(
                    **SupplierResponse.model_validate(sup).model_dump(),
                    product_count=count
                )
                for sup, count in results
            ]

        suppliers = self.supplier_repo.get_all(skip, limit, is_active)
        return [SupplierResponse.model_validate(sup) for sup in suppliers]

    def update(self, supplier_id: int, supplier_data: SupplierUpdate) -> SupplierResponse:
        """
        Actualizar un proveedor.

        Args:
            supplier_id: ID del proveedor
            supplier_data: Datos a actualizar

        Returns:
            Proveedor actualizado

        Raises:
            HTTPException: Si no existe
        """
        supplier = self.supplier_repo.get_by_id(supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado"
            )

        update_data = supplier_data.model_dump(exclude_unset=True)
        updated = self.supplier_repo.update(supplier_id, update_data)
        return SupplierResponse.model_validate(updated)

    def delete(self, supplier_id: int, soft: bool = True) -> bool:
        """
        Eliminar un proveedor.

        Args:
            supplier_id: ID del proveedor
            soft: Si True, hace soft delete (desactiva)

        Returns:
            True si se eliminó

        Raises:
            HTTPException: Si no existe
        """
        supplier = self.supplier_repo.get_by_id(supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Proveedor no encontrado"
            )

        return self.supplier_repo.delete(supplier_id, soft)

    def search(self, query: str, skip: int = 0, limit: int = 100) -> list[SupplierResponse]:
        """
        Buscar proveedores.

        Args:
            query: Término de búsqueda
            skip: Número de registros a saltar
            limit: Límite de registros

        Returns:
            Lista de proveedores encontrados
        """
        suppliers = self.supplier_repo.search(query, skip, limit)
        return [SupplierResponse.model_validate(sup) for sup in suppliers]

    def count(self, is_active: Optional[bool] = None) -> int:
        """Contar total de proveedores."""
        return self.supplier_repo.count(is_active)
