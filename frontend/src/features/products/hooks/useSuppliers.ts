/**
 * Hook para gestión de proveedores
 */
import { useState, useEffect, useCallback } from 'react'
import { supplierService } from '../services'
import { SupplierWithProductCount, SupplierCreate, SupplierUpdate } from '../types'

interface UseSuppliersReturn {
  suppliers: SupplierWithProductCount[]
  loading: boolean
  error: string | null
  fetchSuppliers: (activeOnly?: boolean) => Promise<void>
  createSupplier: (data: SupplierCreate) => Promise<boolean>
  updateSupplier: (id: number, data: SupplierUpdate) => Promise<boolean>
  deleteSupplier: (id: number) => Promise<boolean>
}

export function useSuppliers(activeOnly: boolean = false): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<SupplierWithProductCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuppliers = useCallback(async (onlyActive: boolean = activeOnly) => {
    try {
      setLoading(true)
      setError(null)
      const data = await supplierService.getAll(onlyActive)
      setSuppliers(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar proveedores'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [activeOnly])

  const createSupplier = useCallback(async (data: SupplierCreate): Promise<boolean> => {
    try {
      setError(null)
      await supplierService.create(data)
      await fetchSuppliers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear proveedor'
      setError(message)
      return false
    }
  }, [fetchSuppliers])

  const updateSupplier = useCallback(async (id: number, data: SupplierUpdate): Promise<boolean> => {
    try {
      setError(null)
      await supplierService.update(id, data)
      await fetchSuppliers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar proveedor'
      setError(message)
      return false
    }
  }, [fetchSuppliers])

  const deleteSupplier = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null)
      await supplierService.delete(id)
      await fetchSuppliers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar proveedor'
      setError(message)
      return false
    }
  }, [fetchSuppliers])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  }
}
