/**
 * Modal para ajuste rápido de stock
 */
import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '@/shared/components/ui'
import { StockAdjustment, MovementReason, ADJUSTMENT_REASONS, MOVEMENT_REASON_LABELS } from '../types'

interface Product {
  id: number
  sku: string
  name: string
  stock_current: number
}

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StockAdjustment) => Promise<boolean>
  product: Product | null
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  product
}: StockAdjustmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    new_stock: 0,
    reason: 'physical_count' as MovementReason,
    notes: ''
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        new_stock: product.stock_current,
        reason: 'physical_count',
        notes: ''
      })
      setError(null)
    }
  }, [isOpen, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    if (formData.new_stock < 0) {
      setError('El stock no puede ser negativo')
      return
    }

    if (formData.new_stock === product.stock_current) {
      setError('El nuevo stock es igual al actual')
      return
    }

    setLoading(true)
    try {
      const data: StockAdjustment = {
        product_id: product.id,
        new_stock: formData.new_stock,
        reason: formData.reason,
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

  const reasonOptions = ADJUSTMENT_REASONS.map(reason => ({
    value: reason,
    label: MOVEMENT_REASON_LABELS[reason]
  }))

  const stockDifference = product ? formData.new_stock - product.stock_current : 0
  const isIncrease = stockDifference > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustar Stock"
      size="md"
    >
      {product && (
        <form onSubmit={handleSubmit}>
          {/* Product info */}
          <div className="p-4 bg-gray-50 rounded-xl mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {product.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.sku}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-gray-500">Stock actual</p>
                <p className="text-2xl font-bold text-gray-900">{product.stock_current}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* New stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuevo stock *
              </label>
              <Input
                type="number"
                min="0"
                value={formData.new_stock}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, new_stock: parseInt(e.target.value) || 0 }))
                  setError(null)
                }}
                error={error || undefined}
              />
              
              {/* Difference indicator */}
              {stockDifference !== 0 && (
                <div className={`mt-2 p-2 rounded-lg ${isIncrease ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    {isIncrease ? (
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    <span className={`font-medium ${isIncrease ? 'text-green-700' : 'text-red-700'}`}>
                      {isIncrease ? '+' : ''}{stockDifference} unidades
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón del ajuste *
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Razón del ajuste, observaciones..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex gap-2">
              <svg className="h-5 w-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-800">
                Este ajuste quedará registrado en el historial de movimientos del producto.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={stockDifference === 0}
            >
              Ajustar Stock
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
