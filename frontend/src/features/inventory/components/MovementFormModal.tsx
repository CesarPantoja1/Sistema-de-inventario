/**
 * Modal para crear movimiento de inventario
 */
import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/shared/components/ui'
import {
  InventoryMovementCreate,
  MovementType,
  MovementReason,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_REASON_LABELS,
  ENTRY_REASONS,
  EXIT_REASONS,
  ADJUSTMENT_REASONS
} from '../types'

interface Product {
  id: number
  sku: string
  name: string
  stock_current: number
}

interface MovementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InventoryMovementCreate) => Promise<boolean>
  products: Product[]
  preselectedProduct?: Product | null
  preselectedType?: MovementType
}

export default function MovementFormModal({
  isOpen,
  onClose,
  onSubmit,
  products,
  preselectedProduct,
  preselectedType
}: MovementFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    product_id: number | null
    movement_type: MovementType
    reason: MovementReason
    quantity: number
    reference: string
    notes: string
  }>({
    product_id: null,
    movement_type: 'entry',
    reason: 'purchase',
    quantity: 1,
    reference: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        product_id: preselectedProduct?.id ?? null,
        movement_type: preselectedType ?? 'entry',
        reason: preselectedType === 'exit' ? 'sale' : preselectedType === 'adjustment' ? 'physical_count' : 'purchase',
        quantity: 1,
        reference: '',
        notes: ''
      })
      setErrors({})
    }
  }, [isOpen, preselectedProduct, preselectedType])

  // Update reason options when type changes
  useEffect(() => {
    const reasons = getAvailableReasons(formData.movement_type)
    if (!reasons.includes(formData.reason)) {
      setFormData(prev => ({ ...prev, reason: reasons[0] }))
    }
  }, [formData.movement_type])

  const getAvailableReasons = (type: MovementType): MovementReason[] => {
    switch (type) {
      case 'entry':
        return ENTRY_REASONS
      case 'exit':
        return EXIT_REASONS
      case 'adjustment':
        return ADJUSTMENT_REASONS
      default:
        return ['other']
    }
  }

  const selectedProduct = products.find(p => p.id === formData.product_id)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id) {
      newErrors.product_id = 'Selecciona un producto'
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0'
    }

    // Validate stock for exits
    if (formData.movement_type === 'exit' || formData.movement_type === 'adjustment') {
      if (selectedProduct && formData.quantity > selectedProduct.stock_current) {
        newErrors.quantity = `Stock insuficiente. Disponible: ${selectedProduct.stock_current}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    try {
      const data: InventoryMovementCreate = {
        product_id: formData.product_id!,
        movement_type: formData.movement_type,
        reason: formData.reason,
        quantity: formData.quantity,
        reference: formData.reference || null,
        notes: formData.notes || null
      }
      
      const success = await onSubmit(data)
      if (success) {
        onClose()
      }
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = Object.entries(MOVEMENT_TYPE_LABELS)
    .filter(([key]) => key !== 'transfer') // Transfer not implemented yet
    .map(([value, label]) => ({ value, label }))

  const reasonOptions = getAvailableReasons(formData.movement_type).map(reason => ({
    value: reason,
    label: MOVEMENT_REASON_LABELS[reason]
  }))

  const productOptions = [
    { value: '', label: 'Seleccionar producto...' },
    ...products.map(p => ({
      value: p.id.toString(),
      label: `${p.name} (${p.sku}) - Stock: ${p.stock_current}`
    }))
  ]

  const getTypeIcon = () => {
    switch (formData.movement_type) {
      case 'entry':
        return (
          <div className="p-3 bg-green-100 rounded-xl">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
      case 'exit':
        return (
          <div className="p-3 bg-red-100 rounded-xl">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="p-3 bg-yellow-100 rounded-xl">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Movimiento"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Type indicator */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          {getTypeIcon()}
          <div>
            <p className="font-medium text-gray-900">
              {MOVEMENT_TYPE_LABELS[formData.movement_type]}
            </p>
            <p className="text-sm text-gray-500">
              {formData.movement_type === 'entry' && 'Aumentará el stock del producto'}
              {formData.movement_type === 'exit' && 'Reducirá el stock del producto'}
              {formData.movement_type === 'adjustment' && 'Ajustará el stock del producto'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto *
            </label>
            <Select
              value={formData.product_id?.toString() || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                product_id: e.target.value ? Number(e.target.value) : null
              }))}
              options={productOptions}
              error={errors.product_id}
              disabled={!!preselectedProduct}
            />
          </div>

          {/* Selected product info */}
          {selectedProduct && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">{selectedProduct.name}</p>
                  <p className="text-sm text-blue-700">{selectedProduct.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Stock actual</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedProduct.stock_current}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tipo y Razón */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de movimiento *
              </label>
              <Select
                value={formData.movement_type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  movement_type: e.target.value as MovementType
                }))}
                options={typeOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón *
              </label>
              <Select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reason: e.target.value as MovementReason
                }))}
                options={reasonOptions}
              />
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad *
            </label>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                quantity: parseInt(e.target.value) || 0
              }))}
              error={errors.quantity}
            />
            {selectedProduct && formData.quantity > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Nuevo stock: {' '}
                <span className="font-semibold">
                  {formData.movement_type === 'entry'
                    ? selectedProduct.stock_current + formData.quantity
                    : selectedProduct.stock_current - formData.quantity}
                </span>
              </p>
            )}
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia
            </label>
            <Input
              placeholder="Ej: FAC-001, ORD-123"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                reference: e.target.value
              }))}
            />
            <p className="mt-1 text-xs text-gray-500">
              Número de factura, orden de compra, etc.
            </p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Observaciones adicionales..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Registrar Movimiento
          </Button>
        </div>
      </form>
    </Modal>
  )
}
