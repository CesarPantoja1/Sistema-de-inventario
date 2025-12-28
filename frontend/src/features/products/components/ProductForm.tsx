/**
 * Formulario para crear/editar productos
 */
import { useState, useEffect } from 'react'
import { Modal, Input, Select, Button } from '@/shared/components/ui'
import {
  ProductWithRelations,
  ProductCreate,
  ProductUpdate,
  CategoryWithProductCount,
  SupplierWithProductCount
} from '../types'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductCreate | ProductUpdate) => Promise<boolean>
  product?: ProductWithRelations | null
  categories: CategoryWithProductCount[]
  suppliers: SupplierWithProductCount[]
}

export default function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  suppliers
}: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    stock_current: '0',
    stock_min: '0',
    cost: '',
    price: ''
  })

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category_id: product.category_id?.toString() || '',
        supplier_id: product.supplier_id?.toString() || '',
        stock_current: product.stock_current.toString(),
        stock_min: product.stock_min.toString(),
        cost: product.cost.toString(),
        price: product.price.toString()
      })
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        supplier_id: '',
        stock_current: '0',
        stock_min: '0',
        cost: '',
        price: ''
      })
    }
    setErrors({})
  }, [product, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    if (!formData.cost || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'El costo debe ser mayor o igual a 0'
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'El precio debe ser mayor o igual a 0'
    }
    if (parseFloat(formData.stock_min) < 0) {
      newErrors.stock_min = 'El stock mínimo debe ser mayor o igual a 0'
    }
    if (!isEditing && parseFloat(formData.stock_current) < 0) {
      newErrors.stock_current = 'El stock actual debe ser mayor o igual a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    const data: ProductCreate | ProductUpdate = {
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
      stock_min: Number(formData.stock_min),
      cost: Number(formData.cost),
      price: Number(formData.price)
    }

    if (!isEditing) {
      (data as ProductCreate).stock_current = Number(formData.stock_current)
    }

    const success = await onSubmit(data)
    setLoading(false)

    if (success) {
      onClose()
    }
  }

  const profitMargin = formData.cost && formData.price
    ? ((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price) * 100).toFixed(1)
    : '0'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Información básica
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU"
              value={formData.sku}
              onChange={handleChange('sku')}
              error={errors.sku}
              placeholder="ABC-001"
              className="uppercase"
            />
            <Input
              label="Nombre"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white resize-none"
              placeholder="Descripción del producto (opcional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              value={formData.category_id}
              onChange={handleChange('category_id')}
              options={[
                { value: '', label: 'Sin categoría' },
                ...categories.map(cat => ({
                  value: cat.id.toString(),
                  label: cat.name
                }))
              ]}
            />
            <Select
              label="Proveedor"
              value={formData.supplier_id}
              onChange={handleChange('supplier_id')}
              options={[
                { value: '', label: 'Sin proveedor' },
                ...suppliers.filter(s => s.is_active).map(sup => ({
                  value: sup.id.toString(),
                  label: sup.name
                }))
              ]}
            />
          </div>
        </div>

        {/* Inventario */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Inventario
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEditing && (
              <Input
                label="Stock Inicial"
                type="number"
                min="0"
                value={formData.stock_current}
                onChange={handleChange('stock_current')}
                error={errors.stock_current}
              />
            )}
            <Input
              label="Stock Mínimo"
              type="number"
              min="0"
              value={formData.stock_min}
              onChange={handleChange('stock_min')}
              error={errors.stock_min}
              helperText="Se alertará cuando el stock sea menor a este valor"
            />
          </div>
        </div>

        {/* Precios */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Precios
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Costo"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={handleChange('cost')}
              error={errors.cost}
              leftIcon={<span className="text-gray-500">$</span>}
            />
            <Input
              label="Precio de Venta"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange('price')}
              error={errors.price}
              leftIcon={<span className="text-gray-500">$</span>}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen de Ganancia
              </label>
              <div className={`px-4 py-3 rounded-xl font-semibold text-center ${
                parseFloat(profitMargin) > 0
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : parseFloat(profitMargin) < 0
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {profitMargin}%
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
