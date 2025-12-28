"""crear tabla inventory_movements

Revision ID: c7d8e9f0a1b2
Revises: a1b2c3d4e5f6
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c7d8e9f0a1b2'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Definir los enums (SQLAlchemy crea los tipos si no existen con checkfirst)
    movement_type_enum = postgresql.ENUM(
        'entry', 'exit', 'adjustment', 'transfer',
        name='movement_type_enum',
        create_type=False
    )
    
    movement_reason_enum = postgresql.ENUM(
        'purchase', 'customer_return', 'initial_stock',
        'sale', 'supplier_return', 'damaged', 'expired', 'theft',
        'physical_count', 'correction', 'other',
        name='movement_reason_enum',
        create_type=False
    )
    
    # Crear los tipos si no existen
    movement_type_enum.create(op.get_bind(), checkfirst=True)
    movement_reason_enum.create(op.get_bind(), checkfirst=True)
    
    # Crear tabla inventory_movements
    op.create_table(
        'inventory_movements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('movement_type', movement_type_enum, nullable=False),
        sa.Column('reason', movement_reason_enum, nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('stock_before', sa.Integer(), nullable=False),
        sa.Column('stock_after', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('reference', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        
        # Primary key
        sa.PrimaryKeyConstraint('id'),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        
        # Check constraint
        sa.CheckConstraint('quantity > 0', name='check_quantity_positive'),
    )
    
    # Crear índices para optimizar consultas frecuentes
    op.create_index('ix_inventory_movements_id', 'inventory_movements', ['id'])
    op.create_index('ix_inventory_movements_product_id', 'inventory_movements', ['product_id'])
    op.create_index('ix_inventory_movements_movement_type', 'inventory_movements', ['movement_type'])
    op.create_index('ix_inventory_movements_user_id', 'inventory_movements', ['user_id'])
    op.create_index('ix_inventory_movements_created_at', 'inventory_movements', ['created_at'])
    op.create_index('ix_inventory_movements_reference', 'inventory_movements', ['reference'])


def downgrade() -> None:
    # Eliminar índices
    op.drop_index('ix_inventory_movements_reference', table_name='inventory_movements')
    op.drop_index('ix_inventory_movements_created_at', table_name='inventory_movements')
    op.drop_index('ix_inventory_movements_user_id', table_name='inventory_movements')
    op.drop_index('ix_inventory_movements_movement_type', table_name='inventory_movements')
    op.drop_index('ix_inventory_movements_product_id', table_name='inventory_movements')
    op.drop_index('ix_inventory_movements_id', table_name='inventory_movements')
    
    # Eliminar tabla
    op.drop_table('inventory_movements')
    
    # Eliminar enum types
    postgresql.ENUM(name='movement_reason_enum').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='movement_type_enum').drop(op.get_bind(), checkfirst=True)
