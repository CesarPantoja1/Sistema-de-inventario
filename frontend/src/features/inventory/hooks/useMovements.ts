/**
 * Hook para gestión de movimientos de inventario
 */
import { useState, useEffect, useCallback } from 'react'
import { inventoryService } from '../services'
import {
  InventoryMovementWithProduct,
  MovementListResponse,
  InventoryMovementCreate,
  MovementFilter
} from '../types'

interface UseMovementsOptions {
  initialPage?: number
  initialPageSize?: number
  initialFilters?: MovementFilter
  autoFetch?: boolean
}

interface UseMovementsReturn {
  movements: InventoryMovementWithProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  loading: boolean
  error: string | null
  filters: MovementFilter
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setFilters: (filters: MovementFilter) => void
  fetchMovements: () => Promise<void>
  createMovement: (data: InventoryMovementCreate) => Promise<boolean>
}

export function useMovements(options: UseMovementsOptions = {}): UseMovementsReturn {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialFilters = {},
    autoFetch = true
  } = options

  const [data, setData] = useState<MovementListResponse>({
    items: [],
    total: 0,
    page: initialPage,
    page_size: initialPageSize,
    pages: 0
  })
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [filters, setFilters] = useState<MovementFilter>(initialFilters)

  const fetchMovements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.getMovements(page, pageSize, filters)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos')
      console.error('Error fetching movements:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => {
    if (autoFetch) {
      fetchMovements()
    }
  }, [fetchMovements, autoFetch])

  const createMovement = async (movementData: InventoryMovementCreate): Promise<boolean> => {
    try {
      await inventoryService.createMovement(movementData)
      await fetchMovements()
      return true
    } catch (err) {
      console.error('Error creating movement:', err)
      throw err
    }
  }

  return {
    movements: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.pages,
    loading,
    error,
    filters,
    setPage,
    setPageSize,
    setFilters,
    fetchMovements,
    createMovement
  }
}
