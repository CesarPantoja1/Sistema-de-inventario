/**
 * Hook para historial de movimientos de un producto
 */
import { useState, useEffect, useCallback } from 'react'
import { inventoryService } from '../services'
import { InventoryMovementWithProduct } from '../types'

interface UseProductMovementsOptions {
  productId: number
  limit?: number
  autoFetch?: boolean
}

interface UseProductMovementsReturn {
  movements: InventoryMovementWithProduct[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProductMovements(options: UseProductMovementsOptions): UseProductMovementsReturn {
  const { productId, limit = 50, autoFetch = true } = options
  
  const [movements, setMovements] = useState<InventoryMovementWithProduct[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchMovements = useCallback(async () => {
    if (!productId) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.getProductMovements(productId, limit)
      setMovements(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial')
      console.error('Error fetching product movements:', err)
    } finally {
      setLoading(false)
    }
  }, [productId, limit])

  useEffect(() => {
    if (autoFetch && productId) {
      fetchMovements()
    }
  }, [fetchMovements, autoFetch, productId])

  return {
    movements,
    loading,
    error,
    refresh: fetchMovements
  }
}
