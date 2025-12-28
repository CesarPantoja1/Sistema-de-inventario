/**
 * Hook para estadísticas de inventario
 */
import { useState, useEffect, useCallback } from 'react'
import { inventoryService } from '../services'
import { InventoryStats } from '../types'

interface UseInventoryStatsReturn {
  stats: InventoryStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useInventoryStats(): UseInventoryStatsReturn {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.getStats()
      setStats(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
      console.error('Error fetching inventory stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  }
}
