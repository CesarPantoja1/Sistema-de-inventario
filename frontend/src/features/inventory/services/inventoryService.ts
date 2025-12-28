/**
 * Servicio para gestión de inventario
 */
import apiClient from '@/shared/services/api'
import {
  InventoryMovementWithProduct,
  MovementListResponse,
  InventoryMovementCreate,
  StockAdjustment,
  BatchStockEntryRequest,
  LowStockAlert,
  InventoryStats,
  MovementFilter
} from '../types'

class InventoryService {
  private readonly basePath = '/api/v1/inventory'

  /**
   * Obtener movimientos con paginación y filtros
   */
  async getMovements(
    page: number = 1,
    pageSize: number = 20,
    filters?: MovementFilter
  ): Promise<MovementListResponse> {
    const params: Record<string, unknown> = {
      page,
      page_size: pageSize,
    }

    if (filters) {
      if (filters.product_id) params.product_id = filters.product_id
      if (filters.movement_type) params.movement_type = filters.movement_type
      if (filters.reason) params.reason = filters.reason
      if (filters.user_id) params.user_id = filters.user_id
      if (filters.reference) params.reference = filters.reference
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
    }

    const response = await apiClient.get<MovementListResponse>(`${this.basePath}/movements`, { params })
    return response.data
  }

  /**
   * Obtener un movimiento por ID
   */
  async getMovement(id: number): Promise<InventoryMovementWithProduct> {
    const response = await apiClient.get<InventoryMovementWithProduct>(`${this.basePath}/movements/${id}`)
    return response.data
  }

  /**
   * Crear un nuevo movimiento de inventario
   */
  async createMovement(data: InventoryMovementCreate): Promise<InventoryMovementWithProduct> {
    const response = await apiClient.post<InventoryMovementWithProduct>(`${this.basePath}/movements`, data)
    return response.data
  }

  /**
   * Obtener historial de movimientos de un producto
   */
  async getProductMovements(productId: number, limit: number = 50): Promise<InventoryMovementWithProduct[]> {
    const response = await apiClient.get<InventoryMovementWithProduct[]>(
      `${this.basePath}/products/${productId}/movements`,
      { params: { limit } }
    )
    return response.data
  }

  /**
   * Ajustar stock de un producto
   */
  async adjustStock(data: StockAdjustment): Promise<InventoryMovementWithProduct> {
    const response = await apiClient.post<InventoryMovementWithProduct>(`${this.basePath}/adjust`, data)
    return response.data
  }

  /**
   * Entrada masiva de stock (compras)
   */
  async batchStockEntry(data: BatchStockEntryRequest): Promise<InventoryMovementWithProduct[]> {
    const response = await apiClient.post<InventoryMovementWithProduct[]>(`${this.basePath}/batch-entry`, data)
    return response.data
  }

  /**
   * Obtener alertas de bajo stock
   */
  async getLowStockAlerts(): Promise<LowStockAlert> {
    const response = await apiClient.get<LowStockAlert>(`${this.basePath}/alerts/low-stock`)
    return response.data
  }

  /**
   * Obtener estadísticas de inventario
   */
  async getStats(): Promise<InventoryStats> {
    const response = await apiClient.get<InventoryStats>(`${this.basePath}/stats`)
    return response.data
  }

  /**
   * Verificar stock disponible
   */
  async checkStock(productId: number, quantity: number): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ product_id: number; quantity_requested: number; available: boolean }>(
      `${this.basePath}/check-stock/${productId}`,
      { params: { quantity } }
    )
    return { available: response.data.available }
  }
}

export const inventoryService = new InventoryService()
export default inventoryService
