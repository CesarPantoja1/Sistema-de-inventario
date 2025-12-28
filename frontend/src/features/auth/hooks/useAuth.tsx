/**
 * Hook y Context para gestión de autenticación global
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { User, LoginCredentials, RegisterData, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar si hay un usuario autenticado al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      if (authService.hasToken()) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // Token inválido o expirado
          authService.removeToken()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      // 1. Hacer login y obtener token
      const authResponse = await authService.login(credentials)
      authService.setToken(authResponse.access_token)

      // 2. Obtener datos del usuario
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

      // 3. Redirigir al dashboard
      navigate('/dashboard')
    } catch (error: any) {
      // Propagar el error para manejarlo en el componente
      throw new Error(error.response?.data?.detail || 'Error al iniciar sesión')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      // 1. Registrar usuario
      await authService.register(data)

      // 2. Login automático después del registro
      await login({ email: data.email, password: data.password })
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al registrar usuario')
    }
  }

  const logout = () => {
    authService.removeToken()
    setUser(null)
    navigate('/login')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
