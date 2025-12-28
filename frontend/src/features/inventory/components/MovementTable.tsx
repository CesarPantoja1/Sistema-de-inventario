/**
 * Tabla de movimientos de inventario con diseño premium
 */
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
  TableEmpty,
  TableLoading,
  Badge
} from '@/shared/components/ui'
import {
  InventoryMovementWithProduct,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_REASON_LABELS
} from '../types'

interface MovementTableProps {
  movements: InventoryMovementWithProduct[]
  loading: boolean
  onViewDetails?: (movement: InventoryMovementWithProduct) => void
}

export default function MovementTable({
  movements,
  loading,
  onViewDetails
}: MovementTableProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getQuantityDisplay = (movement: InventoryMovementWithProduct) => {
    const isEntry = movement.movement_type === 'entry'
    const prefix = isEntry ? '+' : '-'
    const colorClass = isEntry ? 'text-green-600' : 'text-red-600'
    
    return (
      <span className={`font-semibold ${colorClass}`}>
        {prefix}{movement.quantity}
      </span>
    )
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableLoading columns={7} rows={8} />
        </Table>
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableEmpty
            message="No se encontraron movimientos"
            description="Intenta ajustar los filtros o registra un nuevo movimiento"
          />
        </Table>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeadCell>Fecha</TableHeadCell>
            <TableHeadCell>Producto</TableHeadCell>
            <TableHeadCell>Tipo</TableHeadCell>
            <TableHeadCell>Razón</TableHeadCell>
            <TableHeadCell className="text-center">Cantidad</TableHeadCell>
            <TableHeadCell className="text-center">Stock</TableHeadCell>
            <TableHeadCell>Referencia</TableHeadCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow
              key={movement.id}
              hoverable
              onClick={() => onViewDetails?.(movement)}
              className={onViewDetails ? 'cursor-pointer' : ''}
            >
              <TableCell>
                <div className="text-sm text-gray-900">
                  {formatDate(movement.created_at)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                    {movement.product?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {movement.product?.name || 'Producto eliminado'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {movement.product?.sku || '-'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getTypeBadgeVariant(movement.movement_type)}>
                  {MOVEMENT_TYPE_LABELS[movement.movement_type]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {MOVEMENT_REASON_LABELS[movement.reason]}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {getQuantityDisplay(movement)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="text-gray-400">{movement.stock_before}</span>
                  <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-medium text-gray-900">{movement.stock_after}</span>
                </div>
              </TableCell>
              <TableCell>
                {movement.reference ? (
                  <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                    {movement.reference}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
