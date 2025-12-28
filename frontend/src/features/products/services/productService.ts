/**
 * Servicio para gestión de productos
 */
import apiClient from '@/shared/services/api'
import {
  Product,
  ProductWithRelations,
  ProductListResponse,
  ProductCreate,
  ProductUpdate,
  ProductFilter
} from '../types'

class ProductService {
  private readonly basePath = '/api/v1/products'

  /**
   * Obtener productos con paginación y filtros
   */
  async getAll(
    page: number = 1,
    pageSize: number = 20,
    filters?: ProductFilter
  ): Promise<ProductListResponse> {
    const params: Record<string, unknown> = {
      page,
      page_size: pageSize,
    }

    if (filters) {
      if (filters.search) params.search = filters.search
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.supplier_id) params.supplier_id = filters.supplier_id
      if (filters.is_active !== undefined) params.is_active = filters.is_active
      if (filters.low_stock_only) params.low_stock_only = true
      if (filters.min_price !== undefined) params.min_price = filters.min_price
      if (filters.max_price !== undefined) params.max_price = filters.max_price
    }

    const response = await apiClient.get<ProductListResponse>(this.basePath, { params })
    return response.data
  }

  /**
   * Obtener productos con bajo stock
   */
  async getLowStock(): Promise<ProductWithRelations[]> {
    const response = await apiClient.get<ProductWithRelations[]>(`${this.basePath}/low-stock`)
    return response.data
  }

  /**
   * Obtener un producto por ID
   */
  async getById(id: number): Promise<ProductWithRelations> {
    const response = await apiClient.get<ProductWithRelations>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * Crear un nuevo producto
   */
  async create(data: ProductCreate): Promise<Product> {
    const response = await apiClient.post<Product>(this.basePath, data)
    return response.data
  }

  /**
   * Actualizar un producto
   */
  async update(id: number, data: ProductUpdate): Promise<Product> {
    const response = await apiClient.put<Product>(`${this.basePath}/${id}`, data)
    return response.data
  }

  /**
   * Actualizar stock de un producto
   */
  async updateStock(id: number, quantity: number): Promise<Product> {
    const response = await apiClient.patch<Product>(
      `${this.basePath}/${id}/stock`,
      null,
      { params: { quantity } }
    )
    return response.data
  }

  /**
   * Eliminar un producto
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const productService = new ProductService()
