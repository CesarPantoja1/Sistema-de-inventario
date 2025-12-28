/**
 * Página principal de gestión de inventario
 */
import { useState, useEffect } from 'react'
import { Button, Pagination } from '@/shared/components/ui'
import { useToast } from '@/shared/components/ui/Toast'
import apiClient from '@/shared/services/api'
import { useMovements, useInventoryStats, useLowStockAlerts } from '../hooks'
import {
  InventoryStatsCards,
  MovementActivityCards,
  MovementFilters,
  MovementTable,
  MovementFormModal,
  StockAdjustmentModal,
  BatchStockEntryModal,
  MovementDetailModal
} from '../components'
import { inventoryService } from '../services'
import {
  InventoryMovementWithProduct,
  InventoryMovementCreate,
  StockAdjustment,
  BatchStockEntryRequest,
  MovementFilter,
  LowStockProduct,
  MovementType,
  LowStockAlert
} from '../types'

interface Product {
  id: number
  sku: string
  name: string
  stock_current: number
}

export default function InventoryPage() {
  const toast = useToast()

  // Data hooks
  const {
    movements,
    total,
    page,
    totalPages,
    loading: movementsLoading,
    filters,
    setPage,
    setFilters,
    fetchMovements,
    createMovement
  } = useMovements()

  const { stats, loading: statsLoading, refresh: refreshStats } = useInventoryStats()
  const { alerts, loading: alertsLoading, refresh: refreshAlerts } = useLowStockAlerts()

  // Products state (for modals)
  const [products, setProducts] = useState<Product[]>([])

  // Modal states
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [isBatchEntryOpen, setIsBatchEntryOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementWithProduct | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [preselectedType, setPreselectedType] = useState<MovementType | undefined>()

  // Fetch products for modals
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products in batches since API limits page_size to 100
        let allProducts: Product[] = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const response = await apiClient.get('/api/v1/products', {
            params: { page, page_size: 100 }
          })
          const items = response.data.items || []
          allProducts = [...allProducts, ...items]
          hasMore = items.length === 100
          page++
        }
        
        setProducts(allProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [])

  // Handlers
  const handleCreateMovement = (type?: MovementType) => {
    setSelectedProduct(null)
    setPreselectedType(type)
    setIsMovementFormOpen(true)
  }

  const handleViewMovementDetails = (movement: InventoryMovementWithProduct) => {
    setSelectedMovement(movement)
    setIsDetailModalOpen(true)
  }

  const handleRestock = (lowStockProduct: LowStockProduct) => {
    const product = products.find(p => p.id === lowStockProduct.product_id)
    if (product) {
      setSelectedProduct(product)
      setPreselectedType('entry')
      setIsMovementFormOpen(true)
      setIsAlertsOpen(false)
    }
  }

  const handleMovementSubmit = async (data: InventoryMovementCreate): Promise<boolean> => {
    try {
      await createMovement(data)
      toast.success('Movimiento registrado correctamente')
      refreshStats()
      refreshAlerts()
      return true
    } catch {
      toast.error('Error al registrar el movimiento')
      return false
    }
  }

  const handleAdjustmentSubmit = async (data: StockAdjustment): Promise<boolean> => {
    try {
      await inventoryService.adjustStock(data)
      toast.success('Stock ajustado correctamente')
      fetchMovements()
      refreshStats()
      refreshAlerts()
      setProducts(prev => prev.map(p => 
        p.id === data.product_id ? { ...p, stock_current: data.new_stock } : p
      ))
      return true
    } catch {
      toast.error('Error al ajustar el stock')
      return false
    }
  }

  const handleBatchEntrySubmit = async (data: BatchStockEntryRequest): Promise<boolean> => {
    try {
      await inventoryService.batchStockEntry(data)
      toast.success(`${data.entries.length} entradas registradas correctamente`)
      fetchMovements()
      refreshStats()
      refreshAlerts()
      return true
    } catch {
      toast.error('Error al registrar las entradas')
      return false
    }
  }

  const handleFilterChange = (newFilters: MovementFilter) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const alertCount = alerts ? alerts.critical_count + alerts.warning_count : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
              <p className="text-gray-500 mt-1">
                Gestiona el stock y movimientos de productos
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Alert button */}
              <Button
            variant="secondary"
            onClick={() => setIsAlertsOpen(true)}
            className="relative"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Alertas
            {alertCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                {alertCount}
              </span>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCreateMovement('exit')}
          >
            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Salida
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsBatchEntryOpen(true)}
          >
            <svg className="h-5 w-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Compra
          </Button>
          <Button onClick={() => handleCreateMovement('entry')}>
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Entrada
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStatsCards stats={stats} loading={statsLoading} />

      {/* Activity Cards */}
      <MovementActivityCards stats={stats} loading={statsLoading} />

      {/* Filters */}
      <MovementFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Movements table */}
      <MovementTable
        movements={movements}
        loading={movementsLoading}
        onViewDetails={handleViewMovementDetails}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
          />
        </div>
      )}

      {/* Total count */}
      {total > 0 && (
        <p className="text-center text-sm text-gray-500">
          Mostrando {movements.length} de {total} movimientos
        </p>
      )}

      {/* Modals */}
      <MovementFormModal
        isOpen={isMovementFormOpen}
        onClose={() => {
          setIsMovementFormOpen(false)
          setSelectedProduct(null)
          setPreselectedType(undefined)
        }}
        onSubmit={handleMovementSubmit}
        products={products}
        preselectedProduct={selectedProduct}
        preselectedType={preselectedType}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleAdjustmentSubmit}
        product={selectedProduct}
      />

      <BatchStockEntryModal
        isOpen={isBatchEntryOpen}
        onClose={() => setIsBatchEntryOpen(false)}
        onSubmit={handleBatchEntrySubmit}
        products={products}
      />

      <MovementDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedMovement(null)
        }}
        movement={selectedMovement}
      />

      {/* Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        loading={alertsLoading}
        onRestock={handleRestock}
      />
        </div>
      </div>
    </div>
  )
}

// ==================== ALERTS MODAL ====================

interface AlertsModalProps {
  isOpen: boolean
  onClose: () => void
  alerts: LowStockAlert | null
  loading: boolean
  onRestock: (product: LowStockProduct) => void
}

function AlertsModal({ isOpen, onClose, alerts, loading, onRestock }: AlertsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Alertas de Stock</h2>
                <p className="text-sm text-gray-500">
                  {alerts ? `${alerts.critical_count} críticos · ${alerts.warning_count} en advertencia` : 'Cargando...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !alerts || alerts.products.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">¡Todo en orden!</p>
                <p className="text-gray-500 text-sm">No hay productos con bajo stock</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.products.map((product) => (
                  <div
                    key={product.product_id}
                    className={`p-4 rounded-xl border ${
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
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Agotado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                              Bajo
                            </span>
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
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onRestock(product)}
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Reabastecer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
