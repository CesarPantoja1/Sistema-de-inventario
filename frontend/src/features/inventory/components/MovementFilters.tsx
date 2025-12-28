/**
 * Filtros de movimientos de inventario
 */
import { Input, Select, Button } from '@/shared/components/ui'
import { MovementFilter, MOVEMENT_TYPE_LABELS, MOVEMENT_REASON_LABELS, MovementType, MovementReason } from '../types'

interface MovementFiltersProps {
  filters: MovementFilter
  onFilterChange: (filters: MovementFilter) => void
  onClearFilters: () => void
}

export default function MovementFilters({
  filters,
  onFilterChange,
  onClearFilters
}: MovementFiltersProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as MovementType | ''
    onFilterChange({ ...filters, movement_type: value || undefined })
  }

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as MovementReason | ''
    onFilterChange({ ...filters, reason: value || undefined })
  }

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, reference: e.target.value || undefined })
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, date_from: e.target.value || undefined })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, date_to: e.target.value || undefined })
  }

  const hasActiveFilters =
    filters.movement_type ||
    filters.reason ||
    filters.reference ||
    filters.date_from ||
    filters.date_to

  const movementTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    ...Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  ]

  const reasonOptions = [
    { value: '', label: 'Todas las razones' },
    ...Object.entries(MOVEMENT_REASON_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Referencia */}
        <Input
          placeholder="Buscar por referencia..."
          value={filters.reference || ''}
          onChange={handleReferenceChange}
          leftIcon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {/* Tipo de movimiento */}
        <Select
          value={filters.movement_type || ''}
          onChange={handleTypeChange}
          options={movementTypeOptions}
        />

        {/* Razón */}
        <Select
          value={filters.reason || ''}
          onChange={handleReasonChange}
          options={reasonOptions}
        />

        {/* Fecha desde */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={handleDateFromChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={handleDateToChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  )
}
