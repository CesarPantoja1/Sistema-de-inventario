/**
 * Navbar principal de la aplicación
 */
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      seller: 'Vendedor',
      warehouse_keeper: 'Bodeguero',
    }
    return roles[role] || role
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Sistema de Inventario
              </span>
            </div>

            {/* Navigation links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <a
                href="/dashboard"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition"
              >
                Productos
              </a>
              <a
                href="#"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition"
              >
                Ventas
              </a>
              <a
                href="#"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition"
              >
                Reportes
              </a>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user && getRoleLabel(user.role)}</p>
              </div>

              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.full_name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
