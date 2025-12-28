"""
Endpoints para gestión de inventario.
"""
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.inventory_service import InventoryService
from app.schemas.inventory import (
    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryMovementList,
    InventoryMovementFilter,
    StockAdjustment,
    BatchStockEntryRequest,
    LowStockAlert,
    InventoryStats,
    MovementTypeEnum,
    MovementReasonEnum,
)

router = APIRouter(prefix="/inventory", tags=["Inventario"])


def get_inventory_service(db: Session = Depends(get_db)) -> InventoryService:
    """Dependency para obtener el servicio de inventario."""
    return InventoryService(db)


# ==================== MOVIMIENTOS ====================

@router.get("/movements", response_model=InventoryMovementList)
def get_movements(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Elementos por página"),
    product_id: Optional[int] = Query(None, description="Filtrar por producto"),
    movement_type: Optional[MovementTypeEnum] = Query(None, description="Filtrar por tipo"),
    reason: Optional[MovementReasonEnum] = Query(None, description="Filtrar por razón"),
    user_id: Optional[int] = Query(None, description="Filtrar por usuario"),
    reference: Optional[str] = Query(None, description="Buscar por referencia"),
    date_from: Optional[datetime] = Query(None, description="Fecha desde"),
    date_to: Optional[datetime] = Query(None, description="Fecha hasta"),
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de movimientos de inventario con filtros y paginación.
    
    Filtros disponibles:
    - **product_id**: ID del producto
    - **movement_type**: entry, exit, adjustment
    - **reason**: purchase, sale, etc.
    - **user_id**: Usuario que realizó el movimiento
    - **reference**: Número de referencia (factura, orden, etc.)
    - **date_from/date_to**: Rango de fechas
    """
    filters = InventoryMovementFilter(
        product_id=product_id,
        movement_type=movement_type,
        reason=reason,
        user_id=user_id,
        reference=reference,
        date_from=date_from,
        date_to=date_to
    )
    return service.get_movements(page, page_size, filters)


@router.get("/movements/{movement_id}", response_model=InventoryMovementResponse)
def get_movement(
    movement_id: int,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """Obtener detalle de un movimiento de inventario."""
    return service.get_movement(movement_id)


@router.post("/movements", response_model=InventoryMovementResponse, status_code=status.HTTP_201_CREATED)
def create_movement(
    data: InventoryMovementCreate,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo movimiento de inventario.
    
    Tipos de movimiento:
    - **entry**: Entrada de mercancía (incrementa stock)
    - **exit**: Salida de mercancía (reduce stock)
    - **adjustment**: Ajuste de inventario (reduce stock)
    
    El stock del producto se actualiza automáticamente.
    """
    return service.create_movement(data, user_id=current_user.id)


@router.get("/products/{product_id}/movements", response_model=List[InventoryMovementResponse])
def get_product_movements(
    product_id: int,
    limit: int = Query(50, ge=1, le=200, description="Cantidad máxima de movimientos"),
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """Obtener historial de movimientos de un producto específico."""
    return service.get_product_movements(product_id, limit)


# ==================== AJUSTES RÁPIDOS ====================

@router.post("/adjust", response_model=InventoryMovementResponse, status_code=status.HTTP_201_CREATED)
def adjust_stock(
    data: StockAdjustment,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Ajustar el stock de un producto a un valor específico.
    
    Útil para:
    - Correcciones después de conteo físico
    - Ajustes por merma o pérdida
    - Corrección de errores
    
    Se crea automáticamente un movimiento de ajuste.
    """
    return service.adjust_stock(data, user_id=current_user.id)


@router.post("/batch-entry", response_model=List[InventoryMovementResponse], status_code=status.HTTP_201_CREATED)
def batch_stock_entry(
    data: BatchStockEntryRequest,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Entrada masiva de stock (para compras/recepciones).
    
    Procesa múltiples productos en una sola operación.
    Útil para registrar una compra completa.
    """
    return service.batch_stock_entry(data, user_id=current_user.id)


# ==================== ALERTAS ====================

@router.get("/alerts/low-stock", response_model=LowStockAlert)
def get_low_stock_alerts(
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener productos con bajo stock o sin stock.
    
    Retorna:
    - **critical_count**: Productos sin stock (stock = 0)
    - **warning_count**: Productos bajo el stock mínimo
    - **products**: Lista de productos afectados ordenados por criticidad
    """
    return service.get_low_stock_products()


# ==================== ESTADÍSTICAS ====================

@router.get("/stats", response_model=InventoryStats)
def get_inventory_stats(
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener estadísticas generales del inventario.
    
    Incluye:
    - Total de productos activos
    - Valor total del inventario
    - Conteo de productos con bajo stock / sin stock
    - Movimientos realizados (hoy, semana, mes)
    """
    return service.get_inventory_stats()


# ==================== VALIDACIONES ====================

@router.get("/check-stock/{product_id}")
def check_stock_available(
    product_id: int,
    quantity: int = Query(..., gt=0, description="Cantidad a verificar"),
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_user)
):
    """
    Verificar si hay stock disponible de un producto.
    
    Útil antes de procesar una venta para validar disponibilidad.
    """
    available = service.validate_stock_available(product_id, quantity)
    return {
        "product_id": product_id,
        "quantity_requested": quantity,
        "available": available
    }
