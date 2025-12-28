"""
Endpoints de productos.
"""
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query

from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductWithRelations,
    ProductListResponse,
    ProductFilter,
)
from app.services.product_service import ProductService
from app.api.deps import get_product_service, get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=ProductListResponse)
def get_products(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    search: Optional[str] = Query(None, description="Buscar por nombre, SKU o descripción"),
    category_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    supplier_id: Optional[int] = Query(None, description="Filtrar por proveedor"),
    is_active: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    low_stock_only: bool = Query(False, description="Solo productos con stock bajo"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Precio mínimo"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Precio máximo"),
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener productos con paginación y filtros.

    - **page**: Número de página (empieza en 1)
    - **page_size**: Cantidad de productos por página
    - **search**: Búsqueda por nombre, SKU o descripción
    - **category_id**: Filtrar por ID de categoría
    - **supplier_id**: Filtrar por ID de proveedor
    - **is_active**: Filtrar por estado activo/inactivo
    - **low_stock_only**: Solo mostrar productos con stock bajo
    - **min_price**: Filtrar por precio mínimo
    - **max_price**: Filtrar por precio máximo
    """
    filters = ProductFilter(
        search=search,
        category_id=category_id,
        supplier_id=supplier_id,
        is_active=is_active,
        low_stock_only=low_stock_only,
        min_price=min_price,
        max_price=max_price,
    )
    return product_service.get_all(page, page_size, filters)


@router.get("/low-stock", response_model=list[ProductWithRelations])
def get_low_stock_products(
    limit: int = Query(50, ge=1, le=200, description="Límite de productos"),
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener productos con stock por debajo del mínimo.

    - **limit**: Límite de productos a retornar
    """
    return product_service.get_low_stock_products(limit)


@router.get("/sku/{sku}", response_model=ProductResponse)
def get_product_by_sku(
    sku: str,
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un producto por SKU.

    - **sku**: Código SKU del producto
    """
    return product_service.get_by_sku(sku)


@router.get("/{product_id}", response_model=ProductWithRelations)
def get_product(
    product_id: int,
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un producto por ID con sus relaciones.

    - **product_id**: ID del producto
    """
    return product_service.get_by_id(product_id, with_relations=True)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo producto.

    - **sku**: Código SKU único (se convierte a mayúsculas)
    - **name**: Nombre del producto
    - **description**: Descripción (opcional)
    - **category_id**: ID de categoría (opcional)
    - **supplier_id**: ID de proveedor (opcional)
    - **stock_current**: Stock inicial (default: 0)
    - **stock_min**: Stock mínimo para alertas (default: 0)
    - **cost**: Costo de adquisición
    - **price**: Precio de venta
    """
    return product_service.create(product_data)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar un producto existente.

    - **product_id**: ID del producto
    - Todos los campos son opcionales
    """
    return product_service.update(product_id, product_data)


@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_product_stock(
    product_id: int,
    quantity: int = Query(..., description="Cantidad a agregar (positivo) o quitar (negativo)"),
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar el stock de un producto.

    - **product_id**: ID del producto
    - **quantity**: Cantidad a agregar (positivo) o quitar (negativo)
    """
    return product_service.update_stock(product_id, quantity)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    soft: bool = Query(True, description="Soft delete (desactivar) en lugar de eliminar"),
    product_service: ProductService = Depends(get_product_service),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar un producto.

    Por defecto hace soft delete (desactiva el producto).

    - **product_id**: ID del producto
    - **soft**: Si es true, solo desactiva; si es false, elimina permanentemente
    """
    product_service.delete(product_id, soft)
    return None
