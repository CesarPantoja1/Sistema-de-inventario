/**
 * Panel de alertas de bajo stock
 */
import { Badge, Button } from '@/shared/components/ui'
import { LowStockAlert, LowStockProduct } from '../types'

interface LowStockAlertsPanelProps {
  alerts: LowStockAlert | null
  loading: boolean
  onRestock?: (product: LowStockProduct) => void
}

export default function LowStockAlertsPanel({
  alerts,
  loading,
  onRestock
}: LowStockAlertsPanelProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!alerts || alerts.products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-xl">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock</h3>
        </div>
        <p className="text-gray-500 text-center py-6">
          ¡Excelente! No hay productos con bajo stock
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock</h3>
            <p className="text-sm text-gray-500">
              {alerts.critical_count} críticos · {alerts.warning_count} en advertencia
            </p>
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 mb-4">
        {alerts.critical_count > 0 && (
          <Badge variant="danger" dot>
            {alerts.critical_count} sin stock
          </Badge>
        )}
        {alerts.warning_count > 0 && (
          <Badge variant="warning" dot>
            {alerts.warning_count} bajo stock
          </Badge>
        )}
      </div>

      {/* Product list */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.products.slice(0, 10).map((product) => (
          <div
            key={product.product_id}
            className={`p-3 rounded-xl border ${
              product.stock_current === 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  {product.stock_current === 0 ? (
                    <Badge variant="danger" size="sm">Agotado</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Bajo</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 font-mono">{product.sku}</span>
                  <span className="text-xs text-gray-400">
                    Stock: <span className="font-semibold text-gray-700">{product.stock_current}</span>
                    <span className="text-gray-400"> / mín: {product.stock_min}</span>
                  </span>
                </div>
              </div>
              {onRestock && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onRestock(product)}
                  className="ml-2"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Reabastecer
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.products.length > 10 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          y {alerts.products.length - 10} productos más...
        </p>
      )}
    </div>
  )
}
