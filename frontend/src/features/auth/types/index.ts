/**
 * Tipos TypeScript para el módulo de autenticación
 */

export interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'seller' | 'warehouse_keeper'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  full_name: string
  password: string
  role?: 'admin' | 'seller' | 'warehouse_keeper'
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}
