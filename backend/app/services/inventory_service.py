"""
Servicio de lógica de negocio para gestión de inventario.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.inventory_movement import InventoryMovement, MovementType, MovementReason
from app.models.product import Product
from app.repositories.inventory_repository import InventoryMovementRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.inventory import (
    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryMovementList,
    InventoryMovementFilter,
    StockAdjustment,
    BatchStockEntry,
    BatchStockEntryRequest,
    LowStockProduct,
    LowStockAlert,
    InventoryStats,
    MovementTypeEnum,
    MovementReasonEnum,
)


class InventoryService:
    """Servicio para gestión de inventario."""

    def __init__(self, db: Session):
        self.db = db
        self.movement_repo = InventoryMovementRepository(db)
        self.product_repo = ProductRepository(db)

    def get_movement(self, movement_id: int) -> InventoryMovement:
        """Obtener un movimiento por ID."""
        movement = self.movement_repo.get_by_id(movement_id)
        if not movement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movimiento no encontrado"
            )
        return movement

    def get_movements(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[InventoryMovementFilter] = None
    ) -> InventoryMovementList:
        """Obtener movimientos con paginación y filtros."""
        skip = (page - 1) * page_size
        movements, total = self.movement_repo.get_all(skip, page_size, filters)
        
        pages = (total + page_size - 1) // page_size if page_size > 0 else 0
        
        return InventoryMovementList(
            items=[InventoryMovementResponse.model_validate(m) for m in movements],
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    def get_product_movements(
        self,
        product_id: int,
        limit: int = 50
    ) -> List[InventoryMovementResponse]:
        """Obtener historial de movimientos de un producto."""
        # Verificar que el producto existe
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        movements = self.movement_repo.get_by_product(product_id, limit)
        return [InventoryMovementResponse.model_validate(m) for m in movements]

    def create_movement(
        self,
        data: InventoryMovementCreate,
        user_id: Optional[int] = None
    ) -> InventoryMovementResponse:
        """
        Crear un movimiento de inventario.
        Actualiza automáticamente el stock del producto.
        """
        # Obtener producto
        product = self.product_repo.get_by_id(data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        # Calcular nuevo stock
        stock_before = product.stock_current
        
        # Convertir enum de schema a enum de modelo
        movement_type = MovementType(data.movement_type.value)
        reason = MovementReason(data.reason.value)
        
        if movement_type == MovementType.ENTRY:
            stock_after = stock_before + data.quantity
        elif movement_type in (MovementType.EXIT, MovementType.ADJUSTMENT):
            stock_after = stock_before - data.quantity
            if stock_after < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente. Stock actual: {stock_before}, cantidad solicitada: {data.quantity}"
                )
        else:
            # Para transferencias u otros tipos futuros
            stock_after = stock_before

        # Crear movimiento
        movement = self.movement_repo.create(
            product_id=data.product_id,
            movement_type=movement_type,
            reason=reason,
            quantity=data.quantity,
            stock_before=stock_before,
            stock_after=stock_after,
            user_id=user_id,
            reference=data.reference,
            notes=data.notes
        )

        # Actualizar stock del producto
        self.product_repo.update_stock(product.id, stock_after)

        # Recargar con relaciones
        movement = self.movement_repo.get_by_id(movement.id)
        return InventoryMovementResponse.model_validate(movement)

    def add_stock(
        self,
        product_id: int,
        quantity: int,
        reason: MovementReasonEnum = MovementReasonEnum.PURCHASE,
        reference: Optional[str] = None,
        notes: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> InventoryMovementResponse:
        """Agregar stock a un producto (entrada)."""
        data = InventoryMovementCreate(
            product_id=product_id,
            movement_type=MovementTypeEnum.ENTRY,
            reason=reason,
            quantity=quantity,
            reference=reference,
            notes=notes
        )
        return self.create_movement(data, user_id)

    def remove_stock(
        self,
        product_id: int,
        quantity: int,
        reason: MovementReasonEnum = MovementReasonEnum.SALE,
        reference: Optional[str] = None,
        notes: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> InventoryMovementResponse:
        """Remover stock de un producto (salida)."""
        data = InventoryMovementCreate(
            product_id=product_id,
            movement_type=MovementTypeEnum.EXIT,
            reason=reason,
            quantity=quantity,
            reference=reference,
            notes=notes
        )
        return self.create_movement(data, user_id)

    def adjust_stock(
        self,
        data: StockAdjustment,
        user_id: Optional[int] = None
    ) -> InventoryMovementResponse:
        """
        Ajustar el stock de un producto a un valor específico.
        Crea un movimiento de ajuste automáticamente.
        """
        product = self.product_repo.get_by_id(data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        stock_before = product.stock_current
        stock_after = data.new_stock
        difference = abs(stock_after - stock_before)

        if difference == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nuevo stock es igual al actual"
            )

        # Determinar tipo de movimiento
        if stock_after > stock_before:
            movement_type = MovementType.ENTRY
        else:
            movement_type = MovementType.ADJUSTMENT

        reason = MovementReason(data.reason.value)

        # Crear movimiento de ajuste
        movement = self.movement_repo.create(
            product_id=data.product_id,
            movement_type=movement_type,
            reason=reason,
            quantity=difference,
            stock_before=stock_before,
            stock_after=stock_after,
            user_id=user_id,
            reference=None,
            notes=data.notes or f"Ajuste de stock: {stock_before} → {stock_after}"
        )

        # Actualizar stock del producto
        self.product_repo.update_stock(product.id, stock_after)

        movement = self.movement_repo.get_by_id(movement.id)
        return InventoryMovementResponse.model_validate(movement)

    def batch_stock_entry(
        self,
        data: BatchStockEntryRequest,
        user_id: Optional[int] = None
    ) -> List[InventoryMovementResponse]:
        """
        Entrada masiva de stock (para compras).
        Procesa múltiples productos en una sola transacción.
        """
        results = []
        
        for item in data.items:
            movement = self.add_stock(
                product_id=item.product_id,
                quantity=item.quantity,
                reason=MovementReasonEnum.PURCHASE,
                reference=item.reference or data.reference,
                notes=item.notes,
                user_id=user_id
            )
            results.append(movement)
        
        return results

    def get_low_stock_products(self) -> LowStockAlert:
        """Obtener productos con bajo stock o sin stock."""
        # Query para productos con stock menor al mínimo
        products = (
            self.db.query(Product)
            .filter(Product.is_active == True)
            .filter(Product.stock_current < Product.stock_min)
            .order_by(
                (Product.stock_current - Product.stock_min).asc()  # Más críticos primero
            )
            .all()
        )

        low_stock_products = []
        critical_count = 0
        warning_count = 0

        for product in products:
            deficit = product.stock_min - product.stock_current
            
            if product.stock_current == 0:
                critical_count += 1
            else:
                warning_count += 1

            low_stock_products.append(LowStockProduct(
                id=product.id,
                sku=product.sku,
                name=product.name,
                stock_current=product.stock_current,
                stock_min=product.stock_min,
                stock_deficit=deficit,
                category_name=product.category.name if product.category else None,
                supplier_name=product.supplier.name if product.supplier else None
            ))

        return LowStockAlert(
            total_products=len(products),
            critical_count=critical_count,
            warning_count=warning_count,
            products=low_stock_products
        )

    def get_inventory_stats(self) -> InventoryStats:
        """Obtener estadísticas generales del inventario."""
        # Total de productos activos
        total_products = (
            self.db.query(func.count(Product.id))
            .filter(Product.is_active == True)
            .scalar() or 0
        )

        # Valor total del inventario (stock_current * cost)
        total_value = (
            self.db.query(func.sum(Product.stock_current * Product.cost))
            .filter(Product.is_active == True)
            .scalar() or 0
        )

        # Productos con bajo stock
        low_stock_count = (
            self.db.query(func.count(Product.id))
            .filter(Product.is_active == True)
            .filter(Product.stock_current < Product.stock_min)
            .filter(Product.stock_current > 0)
            .scalar() or 0
        )

        # Productos sin stock
        out_of_stock_count = (
            self.db.query(func.count(Product.id))
            .filter(Product.is_active == True)
            .filter(Product.stock_current == 0)
            .scalar() or 0
        )

        # Movimientos por período
        movements_today = self.movement_repo.count_today()
        movements_week = self.movement_repo.count_this_week()
        movements_month = self.movement_repo.count_this_month()

        return InventoryStats(
            total_products=total_products,
            total_stock_value=float(total_value),
            low_stock_count=low_stock_count,
            out_of_stock_count=out_of_stock_count,
            movements_today=movements_today,
            movements_this_week=movements_week,
            movements_this_month=movements_month
        )

    def validate_stock_available(self, product_id: int, quantity: int) -> bool:
        """Validar si hay stock disponible para una cantidad específica."""
        product = self.product_repo.get_by_id(product_id)
        if not product:
            return False
        return product.stock_current >= quantity
