/**
 * Hook para gestión de categorías
 */
import { useState, useEffect, useCallback } from 'react'
import { categoryService } from '../services'
import { CategoryWithProductCount, CategoryCreate, CategoryUpdate } from '../types'

interface UseCategoriesReturn {
  categories: CategoryWithProductCount[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  createCategory: (data: CategoryCreate) => Promise<boolean>
  updateCategory: (id: number, data: CategoryUpdate) => Promise<boolean>
  deleteCategory: (id: number) => Promise<boolean>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithProductCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar categorías'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (data: CategoryCreate): Promise<boolean> => {
    try {
      setError(null)
      await categoryService.create(data)
      await fetchCategories()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear categoría'
      setError(message)
      return false
    }
  }, [fetchCategories])

  const updateCategory = useCallback(async (id: number, data: CategoryUpdate): Promise<boolean> => {
    try {
      setError(null)
      await categoryService.update(id, data)
      await fetchCategories()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar categoría'
      setError(message)
      return false
    }
  }, [fetchCategories])

  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await categoryService.delete(id)
      await fetchCategories()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar categoría'
      setError(message)
      return false
    }
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
