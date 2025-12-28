/**
 * Servicio para gestión de proveedores
 */
import apiClient from '@/shared/services/api'
import {
  Supplier,
  SupplierWithProductCount,
  SupplierCreate,
  SupplierUpdate
} from '../types'

class SupplierService {
  private readonly basePath = '/api/v1/suppliers'

  /**
   * Obtener todos los proveedores
   */
  async getAll(activeOnly: boolean = false): Promise<SupplierWithProductCount[]> {
    const params = activeOnly ? { active_only: true } : {}
    const response = await apiClient.get<SupplierWithProductCount[]>(this.basePath, { params })
    return response.data
  }

  /**
   * Buscar proveedores por término
   */
  async search(query: string): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>(`${this.basePath}/search`, {
      params: { q: query }
    })
    return response.data
  }

  /**
   * Obtener un proveedor por ID
   */
  async getById(id: number): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * Crear un nuevo proveedor
   */
  async create(data: SupplierCreate): Promise<Supplier> {
    const response = await apiClient.post<Supplier>(this.basePath, data)
    return response.data
  }

  /**
   * Actualizar un proveedor
   */
  async update(id: number, data: SupplierUpdate): Promise<Supplier> {
    const response = await apiClient.put<Supplier>(`${this.basePath}/${id}`, data)
    return response.data
  }

  /**
   * Eliminar un proveedor (soft delete)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const supplierService = new SupplierService()
