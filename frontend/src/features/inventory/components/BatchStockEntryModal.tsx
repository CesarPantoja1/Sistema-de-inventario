/**
 * Modal para entrada masiva de stock (compras)
 */
import { useState, useEffect } from 'react'
import { Modal, Button, Input } from '@/shared/components/ui'
import { BatchStockEntryRequest, MovementReason, MOVEMENT_REASON_LABELS, ENTRY_REASONS } from '../types'

interface Product {
  id: number
  sku: string
  name: string
  stock_current: number
}

interface BatchStockEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BatchStockEntryRequest) => Promise<boolean>
  products: Product[]
}

interface EntryLine {
  product_id: number | null
  product_name: string
  quantity: number
  notes: string
}

export default function BatchStockEntryModal({
  isOpen,
  onClose,
  onSubmit,
  products
}: BatchStockEntryModalProps) {
  const [loading, setLoading] = useState(false)
  const [reference, setReference] = useState('')
  const [reason, setReason] = useState<MovementReason>('purchase')
  const [entries, setEntries] = useState<EntryLine[]>([
    { product_id: null, product_name: '', quantity: 1, notes: '' }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      setReference('')
      setReason('purchase')
      setEntries([{ product_id: null, product_name: '', quantity: 1, notes: '' }])
      setSearchQuery('')
      setActiveLineIndex(null)
    }
  }, [isOpen])

  const filteredProducts = products.filter(
    p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (lineIndex: number, product: Product) => {
    setEntries(prev => prev.map((entry, i) => 
      i === lineIndex 
        ? { ...entry, product_id: product.id, product_name: product.name }
        : entry
    ))
    setSearchQuery('')
    setActiveLineIndex(null)
  }

  const handleRemoveLine = (index: number) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleAddLine = () => {
    setEntries(prev => [...prev, { product_id: null, product_name: '', quantity: 1, notes: '' }])
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, quantity } : entry
    ))
  }

  const handleUpdateNotes = (index: number, notes: string) => {
    setEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, notes } : entry
    ))
  }

  const validEntries = entries.filter(e => e.product_id && e.quantity > 0)
  const totalUnits = validEntries.reduce((sum, e) => sum + e.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validEntries.length === 0) return

    setLoading(true)
    try {
      const data: BatchStockEntryRequest = {
        entries: validEntries.map(e => ({
          product_id: e.product_id!,
          quantity: e.quantity,
          notes: e.notes || null
        })),
        reason,
        reference: reference || null
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entrada Masiva de Stock"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        {/* Header info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia (Factura/Orden)
            </label>
            <Input
              placeholder="Ej: FAC-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón de entrada
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
            >
              {ENTRY_REASONS.map(r => (
                <option key={r} value={r}>{MOVEMENT_REASON_LABELS[r]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Entry lines */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
            <div className="col-span-5">Producto</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-4">Notas</div>
            <div className="col-span-1"></div>
          </div>
          
          {entries.map((entry, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-xl">
              {/* Product selection */}
              <div className="col-span-5 relative">
                {entry.product_id ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {entry.product_name.charAt(0)}
                    </div>
                    <span className="flex-1 text-sm truncate">{entry.product_name}</span>
                    <button
                      type="button"
                      onClick={() => setEntries(prev => prev.map((e, i) => 
                        i === index ? { ...e, product_id: null, product_name: '' } : e
                      ))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder="Buscar producto..."
                      value={activeLineIndex === index ? searchQuery : ''}
                      onFocus={() => setActiveLineIndex(index)}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {activeLineIndex === index && searchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {filteredProducts.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">No se encontraron productos</div>
                        ) : (
                          filteredProducts.slice(0, 5).map(product => (
                            <button
                              key={product.id}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => handleSelectProduct(index, product)}
                            >
                              <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {product.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.sku} · Stock: {product.stock_current}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  value={entry.quantity}
                  onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>

              {/* Notes */}
              <div className="col-span-4">
                <Input
                  placeholder="Notas..."
                  value={entry.notes}
                  onChange={(e) => handleUpdateNotes(index, e.target.value)}
                />
              </div>

              {/* Remove */}
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveLine(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={entries.length === 1}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add line button */}
        <button
          type="button"
          onClick={handleAddLine}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar producto
        </button>

        {/* Summary */}
        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Resumen de entrada</p>
              <p className="text-2xl font-bold text-green-900">
                {validEntries.length} productos · {totalUnits} unidades
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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
            disabled={validEntries.length === 0}
          >
            Registrar Entrada
          </Button>
        </div>
      </form>
    </Modal>
  )
}
