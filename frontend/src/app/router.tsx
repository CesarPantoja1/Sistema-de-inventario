import { Routes, Route } from 'react-router-dom'

// Temporary home page component
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Sistema de Inventario
        </h1>
        <p className="text-gray-600 mb-8">
          Aplicación de gestión de inventario, ventas y Business Intelligence
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Frontend: React + TypeScript + Vite + Tailwind CSS
          </p>
          <p className="text-sm text-gray-500">
            Backend: FastAPI + PostgreSQL + SQLAlchemy
          </p>
        </div>
      </div>
    </div>
  )
}

function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Future routes will be added here */}
    </Routes>
  )
}

export default Router
