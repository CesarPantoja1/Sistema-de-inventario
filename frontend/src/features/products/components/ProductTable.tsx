/**
 * Tabla de productos con diseño premium
 */
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
  TableEmpty,
  TableLoading,
  Badge,
  Button
} from '@/shared/components/ui'
import { ProductWithRelations } from '../types'

interface ProductTableProps {
  products: ProductWithRelations[]
  loading: boolean
  onEdit: (product: ProductWithRelations) => void
  onDelete: (product: ProductWithRelations) => void
  onUpdateStock: (product: ProductWithRelations) => void
}

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  onUpdateStock
}: ProductTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value)
  }

  const getStockBadge = (product: ProductWithRelations) => {
    if (product.is_low_stock) {
      return <Badge variant="danger" dot>Bajo stock</Badge>
    }
    if (product.stock_current === 0) {
      return <Badge variant="danger">Sin stock</Badge>
    }
    return <Badge variant="success" dot>En stock</Badge>
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableLoading columns={8} rows={5} />
        </Table>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableEmpty
            message="No se encontraron productos"
            description="Intenta ajustar los filtros o crea un nuevo producto"
          />
        </Table>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeadCell>Producto</TableHeadCell>
            <TableHeadCell>SKU</TableHeadCell>
            <TableHeadCell>Categoría</TableHeadCell>
            <TableHeadCell>Proveedor</TableHeadCell>
            <TableHeadCell className="text-right">Stock</TableHeadCell>
            <TableHeadCell className="text-right">Costo</TableHeadCell>
            <TableHeadCell className="text-right">Precio</TableHeadCell>
            <TableHeadCell>Estado</TableHeadCell>
            <TableHeadCell className="text-right">Acciones</TableHeadCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hoverable>
              <TableCell>
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    {product.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {product.sku}
                </span>
              </TableCell>
              <TableCell>
                {product.category ? (
                  <Badge variant="info">{product.category.name}</Badge>
                ) : (
                  <span className="text-gray-400 text-sm">Sin categoría</span>
                )}
              </TableCell>
              <TableCell>
                {product.supplier ? (
                  <span className="text-sm text-gray-700">{product.supplier.name}</span>
                ) : (
                  <span className="text-gray-400 text-sm">Sin proveedor</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-semibold ${
                    product.is_low_stock ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {product.stock_current}
                  </span>
                  <span className="text-xs text-gray-500">
                    Mín: {product.stock_min}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-sm text-gray-600">
                  {formatCurrency(product.cost)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  <span className={`text-xs ${
                    product.profit_margin > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.profit_margin.toFixed(1)}% margen
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getStockBadge(product)}
                  {!product.is_active && (
                    <Badge variant="default">Inactivo</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onUpdateStock(product)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Actualizar stock"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
