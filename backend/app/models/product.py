"""
Modelo de base de datos para productos del inventario.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    """Modelo de producto del inventario."""

    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("stock_current >= 0", name="check_stock_current_positive"),
        CheckConstraint("stock_min >= 0", name="check_stock_min_positive"),
        CheckConstraint("cost >= 0", name="check_cost_positive"),
        CheckConstraint("price >= 0", name="check_price_positive"),
    )

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relaciones
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)

    # Stock
    stock_current = Column(Integer, default=0, nullable=False)
    stock_min = Column(Integer, default=0, nullable=False)

    # Precios (Decimal para precisión monetaria)
    cost = Column(Numeric(10, 2), nullable=False)  # Costo de adquisición
    price = Column(Numeric(10, 2), nullable=False)  # Precio de venta

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones ORM
    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")

    def __repr__(self):
        return f"<Product {self.sku} - {self.name}>"

    @property
    def is_low_stock(self) -> bool:
        """Indica si el producto está por debajo del stock mínimo."""
        return self.stock_current < self.stock_min

    @property
    def profit_margin(self) -> float:
        """Calcula el margen de ganancia en porcentaje."""
        if self.cost and self.cost > 0:
            return float((self.price - self.cost) / self.cost * 100)
        return 0.0
