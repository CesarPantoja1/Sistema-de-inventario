/**
 * Modal para ver detalles de un movimiento
 */
import { Modal, Badge } from '@/shared/components/ui'
import {
  InventoryMovementWithProduct,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_REASON_LABELS
} from '../types'

interface MovementDetailModalProps {
  isOpen: boolean
  onClose: () => void
  movement: InventoryMovementWithProduct | null
}

export default function MovementDetailModal({
  isOpen,
  onClose,
  movement
}: MovementDetailModalProps) {
  if (!movement) return null

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTypeBadgeVariant = (type: string): 'success' | 'danger' | 'warning' | 'info' => {
    const colorMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
      green: 'success',
      red: 'danger',
      yellow: 'warning',
      blue: 'info'
    }
    return colorMap[MOVEMENT_TYPE_COLORS[type as keyof typeof MOVEMENT_TYPE_COLORS]] || 'info'
  }

  const isEntry = movement.movement_type === 'entry'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Movimiento"
      size="md"
    >
      <div className="space-y-6">
        {/* Header with type */}
        <div className={`p-4 rounded-xl ${isEntry ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isEntry ? 'bg-green-100' : 'bg-red-100'}`}>
              {isEntry ? (
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={getTypeBadgeVariant(movement.movement_type)}>
                  {MOVEMENT_TYPE_LABELS[movement.movement_type]}
                </Badge>
                <span className={`text-2xl font-bold ${isEntry ? 'text-green-700' : 'text-red-700'}`}>
                  {isEntry ? '+' : '-'}{movement.quantity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {MOVEMENT_REASON_LABELS[movement.reason]}
              </p>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Producto</h4>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {movement.product?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{movement.product?.name || 'Producto eliminado'}</p>
              <p className="text-sm text-gray-500">{movement.product?.sku || '-'}</p>
            </div>
          </div>
        </div>

        {/* Stock change */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Cambio de Stock</h4>
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-gray-500">Antes</p>
              <p className="text-2xl font-bold text-gray-400">{movement.stock_before}</p>
            </div>
            <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="text-center">
              <p className="text-xs text-gray-500">Después</p>
              <p className="text-2xl font-bold text-gray-900">{movement.stock_after}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Fecha</h4>
            <p className="text-sm text-gray-900 capitalize">{formatDate(movement.created_at)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">ID Movimiento</h4>
            <p className="text-sm text-gray-900 font-mono">#{movement.id}</p>
          </div>
        </div>

        {/* Reference */}
        {movement.reference && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Referencia</h4>
            <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded-lg">
              {movement.reference}
            </p>
          </div>
        )}

        {/* Notes */}
        {movement.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
              {movement.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
