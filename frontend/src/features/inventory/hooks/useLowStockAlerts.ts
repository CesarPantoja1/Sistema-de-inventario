/**
 * Hook para alertas de bajo stock
 */
import { useState, useEffect, useCallback } from 'react'
import { inventoryService } from '../services'
import { LowStockAlert } from '../types'

interface UseLowStockAlertsReturn {
  alerts: LowStockAlert | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useLowStockAlerts(): UseLowStockAlertsReturn {
  const [alerts, setAlerts] = useState<LowStockAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.getLowStockAlerts()
      setAlerts(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alertas')
      console.error('Error fetching low stock alerts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  return {
    alerts,
    loading,
    error,
    refresh: fetchAlerts
  }
}
