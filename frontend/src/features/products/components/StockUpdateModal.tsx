/**
 * Modal para actualizar stock de producto
 */
import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@/shared/components/ui'
import { ProductWithRelations } from '../types'

interface StockUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (quantity: number, reason?: string, notes?: string) => Promise<boolean>
  product: ProductWithRelations | null
}

export default function StockUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  product
}: StockUpdateModalProps) {
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [operation, setOperation] = useState<'add' | 'remove' | 'set'>('add')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuantity('')
      setOperation('add')
      setNotes('')
      setError('')
    }
  }, [isOpen])

  const calculateNewStock = () => {
    if (!product || !quantity) return product?.stock_current || 0
    const q = parseInt(quantity)
    switch (operation) {
      case 'add':
        return product.stock_current + q
      case 'remove':
        return Math.max(0, product.stock_current - q)
      case 'set':
        return q
      default:
        return product.stock_current
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quantity || parseInt(quantity) < 0) {
      setError('La cantidad debe ser mayor o igual a 0')
      return
    }

    const newStock = calculateNewStock()
    if (newStock < 0) {
      setError('El stock no puede ser negativo')
      return
    }

    setLoading(true)
    setError('')

    // Calcular la diferencia para el API
    const currentStock = product?.stock_current || 0
    const difference = newStock - currentStock
    
    // Determinar la razón según la operación
    let reason: string | undefined
    if (operation === 'add') {
      reason = 'purchase'
    } else if (operation === 'remove') {
      reason = 'sale'
    } else {
      // Para "set", determinamos si es entrada o salida
      reason = difference > 0 ? 'purchase' : 'sale'
    }

    const success = await onSubmit(difference, reason, notes || undefined)
    setLoading(false)

    if (success) {
      onClose()
    }
  }

  if (!product) return null

  const newStock = calculateNewStock()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Actualizar Stock"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info del producto */}
        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
          <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {product.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Stock actual */}
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">Stock actual</span>
          <span className={`font-semibold text-lg ${
            product.is_low_stock ? 'text-red-600' : 'text-gray-900'
          }`}>
            {product.stock_current} unidades
          </span>
        </div>

        {/* Tipo de operación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de operación
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setOperation('add')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                operation === 'add'
                  ? 'bg-green-100 text-green-700 border-2 border-green-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              + Agregar
            </button>
            <button
              type="button"
              onClick={() => setOperation('remove')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                operation === 'remove'
                  ? 'bg-red-100 text-red-700 border-2 border-red-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              - Retirar
            </button>
            <button
              type="button"
              onClick={() => setOperation('set')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                operation === 'set'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              = Establecer
            </button>
          </div>
        </div>

        {/* Cantidad */}
        <Input
          label="Cantidad"
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value)
            setError('')
          }}
          error={error}
          placeholder="0"
        />

        {/* Notas (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Razón del ajuste de stock..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
          />
        </div>

        {/* Preview del nuevo stock */}
        {quantity && (
          <div className={`flex justify-between items-center p-4 rounded-xl ${
            newStock < product.stock_min
              ? 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <span className="text-gray-700">Nuevo stock</span>
            <span className={`font-bold text-xl ${
              newStock < product.stock_min ? 'text-red-600' : 'text-green-600'
            }`}>
              {newStock} unidades
            </span>
          </div>
        )}

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
            disabled={!quantity}
          >
            Actualizar Stock
          </Button>
        </div>
      </form>
    </Modal>
  )
}
