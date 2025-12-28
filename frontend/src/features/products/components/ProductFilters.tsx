/**
 * Componente de filtros para productos
 */
import { Input, Select, Button } from '@/shared/components/ui'
import { ProductFilter, CategoryWithProductCount, SupplierWithProductCount } from '../types'

interface ProductFiltersProps {
  filters: ProductFilter
  categories: CategoryWithProductCount[]
  suppliers: SupplierWithProductCount[]
  onFilterChange: (filters: ProductFilter) => void
  onClearFilters: () => void
}

export default function ProductFilters({
  filters,
  categories,
  suppliers,
  onFilterChange,
  onClearFilters
}: ProductFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value || undefined })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onFilterChange({ ...filters, category_id: value ? Number(value) : undefined })
  }

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onFilterChange({ ...filters, supplier_id: value ? Number(value) : undefined })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    onFilterChange({
      ...filters,
      is_active: value === '' ? undefined : value === 'true'
    })
  }

  const handleLowStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, low_stock_only: e.target.checked })
  }

  const hasActiveFilters =
    filters.search ||
    filters.category_id ||
    filters.supplier_id ||
    filters.is_active !== undefined ||
    filters.low_stock_only

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
        {/* Búsqueda */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Categoría */}
        <Select
          value={filters.category_id?.toString() || ''}
          onChange={handleCategoryChange}
          options={[
            { value: '', label: 'Todas las categorías' },
            ...categories.map(cat => ({
              value: cat.id.toString(),
              label: `${cat.name} (${cat.product_count})`
            }))
          ]}
        />

        {/* Proveedor */}
        <Select
          value={filters.supplier_id?.toString() || ''}
          onChange={handleSupplierChange}
          options={[
            { value: '', label: 'Todos los proveedores' },
            ...suppliers.map(sup => ({
              value: sup.id.toString(),
              label: `${sup.name} (${sup.product_count})`
            }))
          ]}
        />

        {/* Estado */}
        <Select
          value={filters.is_active === undefined ? '' : filters.is_active.toString()}
          onChange={handleStatusChange}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'true', label: 'Activos' },
            { value: 'false', label: 'Inactivos' }
          ]}
        />
      </div>

      {/* Filtro de bajo stock */}
      <div className="mt-4 flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.low_stock_only || false}
            onChange={handleLowStockChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-700">
            Solo productos con bajo stock
          </span>
        </label>
      </div>
    </div>
  )
}
