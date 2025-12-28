"""
Repositorio para operaciones CRUD de movimientos de inventario.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_

from app.models.inventory_movement import InventoryMovement, MovementType, MovementReason
from app.models.product import Product
from app.schemas.inventory import InventoryMovementFilter


class InventoryMovementRepository:
    """Repositorio para movimientos de inventario."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, movement_id: int) -> Optional[InventoryMovement]:
        """Obtener movimiento por ID con relaciones."""
        return (
            self.db.query(InventoryMovement)
            .options(
                joinedload(InventoryMovement.product),
                joinedload(InventoryMovement.user)
            )
            .filter(InventoryMovement.id == movement_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        filters: Optional[InventoryMovementFilter] = None
    ) -> tuple[List[InventoryMovement], int]:
        """
        Obtener todos los movimientos con filtros y paginación.
        Retorna (lista de movimientos, total).
        """
        query = (
            self.db.query(InventoryMovement)
            .options(
                joinedload(InventoryMovement.product),
                joinedload(InventoryMovement.user)
            )
        )

        # Aplicar filtros
        if filters:
            if filters.product_id:
                query = query.filter(InventoryMovement.product_id == filters.product_id)
            if filters.movement_type:
                query = query.filter(InventoryMovement.movement_type == filters.movement_type)
            if filters.reason:
                query = query.filter(InventoryMovement.reason == filters.reason)
            if filters.user_id:
                query = query.filter(InventoryMovement.user_id == filters.user_id)
            if filters.reference:
                query = query.filter(InventoryMovement.reference.ilike(f"%{filters.reference}%"))
            if filters.date_from:
                query = query.filter(InventoryMovement.created_at >= filters.date_from)
            if filters.date_to:
                query = query.filter(InventoryMovement.created_at <= filters.date_to)

        # Contar total
        total = query.count()

        # Ordenar por fecha descendente y paginar
        movements = (
            query
            .order_by(InventoryMovement.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return movements, total

    def get_by_product(
        self,
        product_id: int,
        limit: int = 50
    ) -> List[InventoryMovement]:
        """Obtener los últimos movimientos de un producto."""
        return (
            self.db.query(InventoryMovement)
            .options(joinedload(InventoryMovement.user))
            .filter(InventoryMovement.product_id == product_id)
            .order_by(InventoryMovement.created_at.desc())
            .limit(limit)
            .all()
        )

    def create(
        self,
        product_id: int,
        movement_type: MovementType,
        reason: MovementReason,
        quantity: int,
        stock_before: int,
        stock_after: int,
        user_id: Optional[int] = None,
        reference: Optional[str] = None,
        notes: Optional[str] = None
    ) -> InventoryMovement:
        """Crear un nuevo movimiento de inventario."""
        movement = InventoryMovement(
            product_id=product_id,
            movement_type=movement_type,
            reason=reason,
            quantity=quantity,
            stock_before=stock_before,
            stock_after=stock_after,
            user_id=user_id,
            reference=reference,
            notes=notes
        )
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)
        return movement

    def count_by_period(
        self,
        start_date: datetime,
        end_date: Optional[datetime] = None
    ) -> int:
        """Contar movimientos en un período."""
        query = self.db.query(func.count(InventoryMovement.id)).filter(
            InventoryMovement.created_at >= start_date
        )
        if end_date:
            query = query.filter(InventoryMovement.created_at <= end_date)
        return query.scalar() or 0

    def count_today(self) -> int:
        """Contar movimientos de hoy."""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        return self.count_by_period(today)

    def count_this_week(self) -> int:
        """Contar movimientos de esta semana."""
        today = datetime.now()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        return self.count_by_period(start_of_week)

    def count_this_month(self) -> int:
        """Contar movimientos de este mes."""
        today = datetime.now()
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return self.count_by_period(start_of_month)

    def get_last_movement(self, product_id: int) -> Optional[InventoryMovement]:
        """Obtener el último movimiento de un producto."""
        return (
            self.db.query(InventoryMovement)
            .filter(InventoryMovement.product_id == product_id)
            .order_by(InventoryMovement.created_at.desc())
            .first()
        )
