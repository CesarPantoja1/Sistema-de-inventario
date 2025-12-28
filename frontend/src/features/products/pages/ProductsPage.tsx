/**
 * Página principal de gestión de productos
 */
import { useState } from 'react'
import { Button, Pagination } from '@/shared/components/ui'
import { useToast } from '@/shared/components/ui/Toast'
import { useProducts, useCategories, useSuppliers } from '../hooks'
import {
  ProductFilters,
  ProductTable,
  ProductStats,
  ProductForm,
  StockUpdateModal,
  DeleteConfirmModal,
  CategoriesModal,
  SuppliersModal
} from '../components'
import { ProductWithRelations, ProductCreate, ProductUpdate, ProductFilter } from '../types'

export default function ProductsPage() {
  const toast = useToast()

  // Hooks de datos
  const {
    products,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    filters,
    setPage,
    setFilters,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    fetchProducts
  } = useProducts()

  const { categories } = useCategories()
  const { suppliers } = useSuppliers()

  // Estados de modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isSuppliersOpen, setIsSuppliersOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null)

  // Handlers de modales
  const handleCreate = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleUpdateStock = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setIsStockModalOpen(true)
  }

  const handleDelete = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  // Handlers de acciones
  const handleFormSubmit = async (data: ProductCreate | ProductUpdate): Promise<boolean> => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data as ProductUpdate)
        toast.success('Producto actualizado correctamente')
      } else {
        await createProduct(data as ProductCreate)
        toast.success('Producto creado correctamente')
      }
      return true
    } catch {
      toast.error('Error al guardar el producto')
      return false
    }
  }

  const handleStockSubmit = async (quantity: number, reason?: string, notes?: string): Promise<boolean> => {
    if (!selectedProduct) return false
    try {
      await updateStock(selectedProduct.id, quantity, reason, notes)
      toast.success('Stock actualizado correctamente')
      return true
    } catch {
      toast.error('Error al actualizar el stock')
      return false
    }
  }

  const handleDeleteConfirm = async (): Promise<boolean> => {
    if (!selectedProduct) return false
    try {
      await deleteProduct(selectedProduct.id)
      toast.success('Producto eliminado correctamente')
      return true
    } catch {
      toast.error('Error al eliminar el producto')
      return false
    }
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="mt-1 text-gray-500">
              Gestiona tu inventario de productos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsCategoriesOpen(true)}
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categorías
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsSuppliersOpen(true)}
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Proveedores
            </Button>
            <Button
              variant="secondary"
              onClick={fetchProducts}
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </Button>
            <Button onClick={handleCreate}>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Estadísticas */}
        <ProductStats
          products={products}
          total={total}
          categories={categories}
          suppliers={suppliers}
        />

        {/* Filtros */}
        <ProductFilters
          filters={filters}
          categories={categories}
          suppliers={suppliers}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Tabla de productos */}
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStock={handleUpdateStock}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Modales */}
        <ProductForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          product={selectedProduct}
          categories={categories}
          suppliers={suppliers}
        />

        <StockUpdateModal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSubmit={handleStockSubmit}
          product={selectedProduct}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          product={selectedProduct}
        />

        <CategoriesModal
          isOpen={isCategoriesOpen}
          onClose={() => setIsCategoriesOpen(false)}
        />

        <SuppliersModal
          isOpen={isSuppliersOpen}
          onClose={() => setIsSuppliersOpen(false)}
        />
      </div>
    </div>
  )
}
