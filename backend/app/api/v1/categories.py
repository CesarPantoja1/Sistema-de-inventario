"""
Endpoints de categorías.
"""
from fastapi import APIRouter, Depends, status, Query

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithProductCount,
)
from app.services.category_service import CategoryService
from app.api.deps import get_category_service, get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[CategoryResponse | CategoryWithProductCount])
def get_categories(
    skip: int = Query(0, ge=0, description="Registros a saltar"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    with_product_count: bool = Query(False, description="Incluir conteo de productos"),
    category_service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todas las categorías.

    - **skip**: Número de registros a saltar (paginación)
    - **limit**: Límite de registros a retornar
    - **with_product_count**: Si es true, incluye el conteo de productos por categoría
    """
    return category_service.get_all(skip, limit, with_product_count)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    category_service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener una categoría por ID.

    - **category_id**: ID de la categoría
    """
    return category_service.get_by_id(category_id)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    category_service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva categoría.

    - **name**: Nombre único de la categoría
    - **description**: Descripción opcional
    """
    return category_service.create(category_data)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    category_service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar una categoría existente.

    - **category_id**: ID de la categoría
    - **name**: Nuevo nombre (opcional)
    - **description**: Nueva descripción (opcional)
    """
    return category_service.update(category_id, category_data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    category_service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar una categoría.

    No se puede eliminar si tiene productos asociados.

    - **category_id**: ID de la categoría
    """
    category_service.delete(category_id)
    return None
