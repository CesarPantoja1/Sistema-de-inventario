/**
 * Tarjetas de actividad de movimientos
 */
import { InventoryStats } from '../types'

interface MovementActivityCardsProps {
  stats: InventoryStats | null
  loading: boolean
}

export default function MovementActivityCards({ stats, loading }: MovementActivityCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    )
  }

  const activityData = [
    {
      label: 'Hoy',
      value: stats?.movements_today ?? 0,
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Esta semana',
      value: stats?.movements_week ?? 0,
      icon: (
        <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Este mes',
      value: stats?.movements_month ?? 0,
      icon: (
        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {activityData.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={`text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </p>
              <p className="text-xs text-gray-400">movimientos</p>
            </div>
            <div className={`p-3 rounded-xl ${item.bgColor}`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
