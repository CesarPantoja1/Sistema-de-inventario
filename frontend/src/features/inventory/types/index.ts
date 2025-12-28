/**
 * Tipos e interfaces para el módulo de inventario
 */

// ==================== ENUMS ====================

export type MovementType = 'entry' | 'exit' | 'adjustment' | 'transfer'
export type MovementReason = 
  | 'purchase' 
  | 'customer_return' 
  | 'initial_stock'
  | 'sale' 
  | 'supplier_return' 
  | 'damaged' 
  | 'expired' 
  | 'theft'
  | 'physical_count' 
  | 'correction' 
  | 'other'

// ==================== MOVEMENT ====================

export interface InventoryMovement {
  id: number
  product_id: number
  movement_type: MovementType
  reason: MovementReason
  quantity: number
  stock_before: number
  stock_after: number
  user_id: number | null
  reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InventoryMovementWithProduct extends InventoryMovement {
  product: {
    id: number
    sku: string
    name: string
    stock_current: number
  }
}

export interface InventoryMovementCreate {
  product_id: number
  movement_type: MovementType
  reason: MovementReason
  quantity: number
  reference?: string | null
  notes?: string | null
}

// ==================== STOCK ADJUSTMENT ====================

export interface StockAdjustment {
  product_id: number
  new_stock: number
  reason?: MovementReason
  notes?: string | null
}

// ==================== BATCH ENTRY ====================

export interface BatchStockEntry {
  product_id: number
  quantity: number
  reference?: string | null
  notes?: string | null
}

export interface BatchStockEntryRequest {
  entries: BatchStockEntry[]
  reason?: MovementReason
  reference?: string | null
}

// ==================== FILTERS ====================

export interface MovementFilter {
  product_id?: number
  movement_type?: MovementType
  reason?: MovementReason
  user_id?: number
  reference?: string
  date_from?: string
  date_to?: string
}

// ==================== RESPONSES ====================

export interface MovementListResponse {
  items: InventoryMovementWithProduct[]
  total: number
  page: number
  page_size: number
  pages: number
}

// ==================== ALERTS ====================

export interface LowStockProduct {
  product_id: number
  sku: string
  name: string
  stock_current: number
  stock_min: number
  difference: number
  category_name: string | null
  supplier_name: string | null
}

export interface LowStockAlert {
  critical_count: number
  warning_count: number
  products: LowStockProduct[]
}

// ==================== STATS ====================

export interface InventoryStats {
  total_products: number
  total_value: number
  low_stock_count: number
  out_of_stock_count: number
  movements_today: number
  movements_week: number
  movements_month: number
}

// ==================== UI HELPERS ====================

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entry: 'Entrada',
  exit: 'Salida',
  adjustment: 'Ajuste',
  transfer: 'Transferencia'
}

export const MOVEMENT_TYPE_COLORS: Record<MovementType, 'green' | 'red' | 'yellow' | 'blue'> = {
  entry: 'green',
  exit: 'red',
  adjustment: 'yellow',
  transfer: 'blue'
}

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  purchase: 'Compra',
  customer_return: 'Devolución cliente',
  initial_stock: 'Stock inicial',
  sale: 'Venta',
  supplier_return: 'Devolución a proveedor',
  damaged: 'Dañado',
  expired: 'Vencido',
  theft: 'Robo/Pérdida',
  physical_count: 'Conteo físico',
  correction: 'Corrección',
  other: 'Otro'
}

export const ENTRY_REASONS: MovementReason[] = ['purchase', 'customer_return', 'initial_stock']
export const EXIT_REASONS: MovementReason[] = ['sale', 'supplier_return', 'damaged', 'expired', 'theft']
export const ADJUSTMENT_REASONS: MovementReason[] = ['physical_count', 'correction', 'other']
