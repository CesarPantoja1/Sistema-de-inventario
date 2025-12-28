/**
 * Modal de confirmación para eliminar producto
 */
import { useState } from 'react'
import { Modal, Button } from '@/shared/components/ui'
import { ProductWithRelations } from '../types'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<boolean>
  product: ProductWithRelations | null
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    const success = await onConfirm()
    setLoading(false)
    if (success) {
      onClose()
    }
  }

  if (!product) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Producto"
      size="sm"
    >
      <div className="space-y-6">
        {/* Icono de advertencia */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Mensaje */}
        <div className="text-center">
          <p className="text-gray-700">
            ¿Estás seguro que deseas eliminar el producto{' '}
            <span className="font-semibold text-gray-900">{product.name}</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Info del producto */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
              {product.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-gray-900">
                Stock: {product.stock_current}
              </p>
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
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
          >
            Eliminar Producto
          </Button>
        </div>
      </div>
    </Modal>
  )
}
