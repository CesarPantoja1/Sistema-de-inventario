/**
 * Hook para gestión de productos
 */
import { useState, useEffect, useCallback } from 'react'
import { productService } from '../services'
import {
  ProductWithRelations,
  ProductListResponse,
  ProductCreate,
  ProductUpdate,
  ProductFilter
} from '../types'

interface UseProductsOptions {
  initialPage?: number
  initialPageSize?: number
  initialFilters?: ProductFilter
  autoFetch?: boolean
}

interface UseProductsReturn {
  products: ProductWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  loading: boolean
  error: string | null
  filters: ProductFilter
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setFilters: (filters: ProductFilter) => void
  fetchProducts: () => Promise<void>
  createProduct: (data: ProductCreate) => Promise<boolean>
  updateProduct: (id: number, data: ProductUpdate) => Promise<boolean>
  updateStock: (id: number, quantity: number, reason?: string, notes?: string) => Promise<boolean>
  deleteProduct: (id: number) => Promise<boolean>
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialFilters = {},
    autoFetch = true
  } = options

  const [data, setData] = useState<ProductListResponse>({
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
  const [filters, setFilters] = useState<ProductFilter>(initialFilters)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productService.getAll(page, pageSize, filters)
      setData(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  const createProduct = useCallback(async (productData: ProductCreate): Promise<boolean> => {
    try {
      setError(null)
      await productService.create(productData)
      await fetchProducts()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear producto'
      setError(message)
      return false
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: number, productData: ProductUpdate): Promise<boolean> => {
    try {
      setError(null)
      await productService.update(id, productData)
      await fetchProducts()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar producto'
      setError(message)
      return false
    }
  }, [fetchProducts])

  const updateStock = useCallback(async (id: number, quantity: number, reason?: string, notes?: string): Promise<boolean> => {
    try {
      setError(null)
      await productService.updateStock(id, quantity, reason, notes)
      await fetchProducts()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar stock'
      setError(message)
      return false
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await productService.delete(id)
      await fetchProducts()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto'
      setError(message)
      return false
    }
  }, [fetchProducts])

  useEffect(() => {
    if (autoFetch) {
      fetchProducts()
    }
  }, [autoFetch, fetchProducts])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  return {
    products: data.items,
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
    fetchProducts,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct
  }
}
