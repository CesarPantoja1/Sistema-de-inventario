"""
Endpoints de proveedores.
"""
from typing import Optional
from fastapi import APIRouter, Depends, status, Query

from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierWithProductCount,
)
from app.services.supplier_service import SupplierService
from app.api.deps import get_supplier_service, get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[SupplierResponse | SupplierWithProductCount])
def get_suppliers(
    skip: int = Query(0, ge=0, description="Registros a saltar"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    is_active: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    with_product_count: bool = Query(False, description="Incluir conteo de productos"),
    supplier_service: SupplierService = Depends(get_supplier_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todos los proveedores.

    - **skip**: Número de registros a saltar (paginación)
    - **limit**: Límite de registros a retornar
    - **is_active**: Filtrar por estado activo/inactivo
    - **with_product_count**: Si es true, incluye el conteo de productos por proveedor
    """
    return supplier_service.get_all(skip, limit, is_active, with_product_count)


@router.get("/search", response_model=list[SupplierResponse])
def search_suppliers(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    skip: int = Query(0, ge=0, description="Registros a saltar"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    supplier_service: SupplierService = Depends(get_supplier_service),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar proveedores por nombre, email o persona de contacto.

    - **q**: Término de búsqueda
    - **skip**: Número de registros a saltar
    - **limit**: Límite de registros
    """
    return supplier_service.search(q, skip, limit)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    supplier_service: SupplierService = Depends(get_supplier_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un proveedor por ID.

    - **supplier_id**: ID del proveedor
    """
    return supplier_service.get_by_id(supplier_id)


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_data: SupplierCreate,
    supplier_service: SupplierService = Depends(get_supplier_service),
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo proveedor.

    - **name**: Nombre del proveedor
    - **contact_person**: Persona de contacto (opcional)
    - **email**: Email de contacto (opcional)
    - **phone**: Teléfono (opcional)
    - **address**: Dirección (opcional)
    """
    return supplier_service.create(supplier_data)


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    supplier_service: SupplierService = Depends(get_supplier_service),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar un proveedor existente.

    - **supplier_id**: ID del proveedor
    - Todos los campos son opcionales
    """
    return supplier_service.update(supplier_id, supplier_data)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: int,
    soft: bool = Query(True, description="Soft delete (desactivar) en lugar de eliminar"),
    supplier_service: SupplierService = Depends(get_supplier_service),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar un proveedor.

    Por defecto hace soft delete (desactiva el proveedor).

    - **supplier_id**: ID del proveedor
    - **soft**: Si es true, solo desactiva; si es false, elimina permanentemente
    """
    supplier_service.delete(supplier_id, soft)
    return None
