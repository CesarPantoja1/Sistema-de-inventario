/**
 * Servicio de autenticación para comunicación con la API
 */
import apiClient from '@/shared/services/api'
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types'

class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/api/v1/auth/register', data)
    return response.data
  }

  /**
   * Login de usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/v1/auth/login/json',
      credentials
    )
    return response.data
  }

  /**
   * Obtener usuario actual autenticado
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/me')
    return response.data
  }

  /**
   * Guardar token en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('access_token', token)
  }

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  /**
   * Eliminar token de localStorage
   */
  removeToken(): void {
    localStorage.removeItem('access_token')
  }

  /**
   * Verificar si hay un token guardado
   */
  hasToken(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
