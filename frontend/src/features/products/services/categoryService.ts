/**
 * Servicio para gestión de categorías
 */
import apiClient from '@/shared/services/api'
import {
  Category,
  CategoryWithProductCount,
  CategoryCreate,
  CategoryUpdate
} from '../types'

class CategoryService {
  private readonly basePath = '/api/v1/categories'

  /**
   * Obtener todas las categorías
   */
  async getAll(): Promise<CategoryWithProductCount[]> {
    const response = await apiClient.get<CategoryWithProductCount[]>(this.basePath)
    return response.data
  }

  /**
   * Obtener una categoría por ID
   */
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`${this.basePath}/${id}`)
    return response.data
  }

  /**
   * Crear una nueva categoría
   */
  async create(data: CategoryCreate): Promise<Category> {
    const response = await apiClient.post<Category>(this.basePath, data)
    return response.data
  }

  /**
   * Actualizar una categoría
   */
  async update(id: number, data: CategoryUpdate): Promise<Category> {
    const response = await apiClient.put<Category>(`${this.basePath}/${id}`, data)
    return response.data
  }

  /**
   * Eliminar una categoría
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const categoryService = new CategoryService()
