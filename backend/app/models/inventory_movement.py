"""
Modelo de base de datos para movimientos de inventario.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class MovementType(str, enum.Enum):
    """Tipos de movimiento de inventario."""
    ENTRY = "entry"           # Entrada de mercancía (compra, devolución cliente)
    EXIT = "exit"             # Salida de mercancía (venta, devolución proveedor)
    ADJUSTMENT = "adjustment"  # Ajuste de inventario (corrección, merma, robo)
    TRANSFER = "transfer"     # Transferencia entre ubicaciones (futuro)


class MovementReason(str, enum.Enum):
    """Razones específicas del movimiento."""
    # Entradas
    PURCHASE = "purchase"              # Compra a proveedor
    CUSTOMER_RETURN = "customer_return" # Devolución de cliente
    INITIAL_STOCK = "initial_stock"    # Stock inicial
    
    # Salidas
    SALE = "sale"                      # Venta
    SUPPLIER_RETURN = "supplier_return" # Devolución a proveedor
    DAMAGED = "damaged"                # Producto dañado
    EXPIRED = "expired"                # Producto vencido
    THEFT = "theft"                    # Robo/pérdida
    
    # Ajustes
    PHYSICAL_COUNT = "physical_count"  # Conteo físico
    CORRECTION = "correction"          # Corrección de error
    OTHER = "other"                    # Otro


class InventoryMovement(Base):
    """Modelo de movimiento de inventario."""

    __tablename__ = "inventory_movements"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
    )

    id = Column(Integer, primary_key=True, index=True)
    
    # Relación con producto
    product_id = Column(
        Integer, 
        ForeignKey("products.id", ondelete="RESTRICT"), 
        nullable=False,
        index=True
    )
    
    # Tipo y razón del movimiento (usamos String para compatibilidad con enum PostgreSQL en minúsculas)
    movement_type = Column(
        String(20),
        nullable=False,
        index=True
    )
    reason = Column(
        String(30),
        nullable=False
    )
    
    # Cantidades
    quantity = Column(Integer, nullable=False)  # Siempre positivo
    stock_before = Column(Integer, nullable=False)  # Stock antes del movimiento
    stock_after = Column(Integer, nullable=False)   # Stock después del movimiento
    
    # Referencia externa (número de factura, orden de compra, etc.)
    reference = Column(String(100), nullable=True, index=True)
    
    # Notas adicionales
    notes = Column(Text, nullable=True)
    
    # Usuario que realizó el movimiento
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True,
        index=True
    )
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relaciones ORM
    product = relationship("Product", backref="inventory_movements")
    user = relationship("User", backref="inventory_movements")

    def __repr__(self):
        return f"<InventoryMovement {self.id} - {self.movement_type.value} - {self.quantity}>"

    @property
    def is_entry(self) -> bool:
        """Indica si el movimiento es una entrada."""
        return self.movement_type == MovementType.ENTRY

    @property
    def is_exit(self) -> bool:
        """Indica si el movimiento es una salida."""
        return self.movement_type in (MovementType.EXIT, MovementType.ADJUSTMENT)
