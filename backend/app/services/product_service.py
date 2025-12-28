"""
Servicio de productos.
Contiene la lógica de negocio para gestión de productos.
"""
from typing import Optional
from decimal import Decimal
import math

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.product_repository import ProductRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.supplier_repository import SupplierRepository
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductWithRelations,
    ProductListResponse,
    ProductFilter,
)
from app.models.product import Product


class ProductService:
    """Servicio para gestión de productos."""

    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.category_repo = CategoryRepository(db)
        self.supplier_repo = SupplierRepository(db)

    def create(self, product_data: ProductCreate) -> ProductResponse:
        """
        Crear un nuevo producto.

        Args:
            product_data: Datos del producto

        Returns:
            Producto creado

        Raises:
            HTTPException: Si el SKU ya existe o referencias inválidas
        """
        # Verificar SKU único
        if self.product_repo.exists_by_sku(product_data.sku):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un producto con el SKU: {product_data.sku.upper()}"
            )

        # Verificar categoría existe
        if product_data.category_id:
            if not self.category_repo.get_by_id(product_data.category_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La categoría especificada no existe"
                )

        # Verificar proveedor existe
        if product_data.supplier_id:
            supplier = self.supplier_repo.get_by_id(product_data.supplier_id)
            if not supplier:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El proveedor especificado no existe"
                )
            if not supplier.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El proveedor especificado está inactivo"
                )

        product = self.product_repo.create(product_data.model_dump())
        return ProductResponse.model_validate(product)

    def get_by_id(self, product_id: int, with_relations: bool = False) -> ProductResponse | ProductWithRelations:
        """
        Obtener un producto por ID.

        Args:
            product_id: ID del producto
            with_relations: Incluir categoría y proveedor

        Returns:
            Producto encontrado

        Raises:
            HTTPException: Si no existe
        """
        product = self.product_repo.get_by_id(product_id, with_relations)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        if with_relations:
            return self._to_product_with_relations(product)

        return ProductResponse.model_validate(product)

    def get_by_sku(self, sku: str) -> ProductResponse:
        """
        Obtener un producto por SKU.

        Args:
            sku: SKU del producto

        Returns:
            Producto encontrado

        Raises:
            HTTPException: Si no existe
        """
        product = self.product_repo.get_by_sku(sku)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        return ProductResponse.model_validate(product)

    def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[ProductFilter] = None
    ) -> ProductListResponse:
        """
        Obtener todos los productos con paginación y filtros.

        Args:
            page: Número de página (1-indexed)
            page_size: Tamaño de página
            filters: Filtros opcionales

        Returns:
            Lista paginada de productos
        """
        skip = (page - 1) * page_size

        filter_params = {}
        if filters:
            filter_params = {
                "category_id": filters.category_id,
                "supplier_id": filters.supplier_id,
                "is_active": filters.is_active,
                "low_stock_only": filters.low_stock_only,
                "search": filters.search,
                "min_price": filters.min_price,
                "max_price": filters.max_price,
            }

        products = self.product_repo.get_all(
            skip=skip,
            limit=page_size,
            with_relations=True,
            **filter_params
        )

        total = self.product_repo.count(**filter_params)
        pages = math.ceil(total / page_size) if total > 0 else 1

        items = [self._to_product_with_relations(p) for p in products]

        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    def update(self, product_id: int, product_data: ProductUpdate) -> ProductResponse:
        """
        Actualizar un producto.

        Args:
            product_id: ID del producto
            product_data: Datos a actualizar

        Returns:
            Producto actualizado

        Raises:
            HTTPException: Si no existe o datos inválidos
        """
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        # Verificar SKU único si se está actualizando
        if product_data.sku and self.product_repo.exists_by_sku(
            product_data.sku, exclude_id=product_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un producto con el SKU: {product_data.sku.upper()}"
            )

        # Verificar categoría si se está actualizando
        if product_data.category_id is not None:
            if product_data.category_id and not self.category_repo.get_by_id(product_data.category_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La categoría especificada no existe"
                )

        # Verificar proveedor si se está actualizando
        if product_data.supplier_id is not None:
            if product_data.supplier_id:
                supplier = self.supplier_repo.get_by_id(product_data.supplier_id)
                if not supplier:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El proveedor especificado no existe"
                    )

        update_data = product_data.model_dump(exclude_unset=True)
        updated = self.product_repo.update(product_id, update_data)
        return ProductResponse.model_validate(updated)

    def delete(self, product_id: int, soft: bool = True) -> bool:
        """
        Eliminar un producto.

        Args:
            product_id: ID del producto
            soft: Si True, hace soft delete (desactiva)

        Returns:
            True si se eliminó

        Raises:
            HTTPException: Si no existe
        """
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        return self.product_repo.delete(product_id, soft)

    def get_low_stock_products(self, limit: int = 50) -> list[ProductWithRelations]:
        """
        Obtener productos con stock bajo.

        Args:
            limit: Límite de productos

        Returns:
            Lista de productos con stock bajo
        """
        products = self.product_repo.get_low_stock_products(limit)
        return [self._to_product_with_relations(p) for p in products]

    def update_stock(self, product_id: int, quantity: int) -> ProductResponse:
        """
        Actualizar stock de un producto.

        Args:
            product_id: ID del producto
            quantity: Cantidad a agregar (positivo) o quitar (negativo)

        Returns:
            Producto actualizado

        Raises:
            HTTPException: Si no existe o stock insuficiente
        """
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        new_stock = product.stock_current + quantity
        if new_stock < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Stock actual: {product.stock_current}"
            )

        updated = self.product_repo.update_stock(product_id, quantity)
        return ProductResponse.model_validate(updated)

    def count(
        self,
        is_active: Optional[bool] = None,
        low_stock_only: bool = False
    ) -> int:
        """Contar total de productos."""
        return self.product_repo.count(is_active=is_active, low_stock_only=low_stock_only)

    def _to_product_with_relations(self, product: Product) -> ProductWithRelations:
        """Convertir producto a schema con relaciones."""
        from app.schemas.category import CategoryResponse
        from app.schemas.supplier import SupplierResponse

        data = ProductResponse.model_validate(product).model_dump()

        # Agregar relaciones
        data["category"] = (
            CategoryResponse.model_validate(product.category)
            if product.category else None
        )
        data["supplier"] = (
            SupplierResponse.model_validate(product.supplier)
            if product.supplier else None
        )

        # Agregar propiedades calculadas
        data["is_low_stock"] = product.is_low_stock
        data["profit_margin"] = product.profit_margin

        return ProductWithRelations(**data)
