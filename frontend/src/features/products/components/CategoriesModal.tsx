/**
 * Modal para gestión de categorías
 */
import { useState } from 'react'
import { Modal, Input, Button, Badge } from '@/shared/components/ui'
import { useToast } from '@/shared/components/ui/Toast'
import { useCategories } from '../hooks'
import { CategoryWithProductCount, CategoryCreate, CategoryUpdate } from '../types'

interface CategoriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const toast = useToast()
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories()

  const [editingCategory, setEditingCategory] = useState<CategoryWithProductCount | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setFormErrors({})
    setEditingCategory(null)
    setIsFormOpen(false)
  }

  const handleCreate = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const handleEdit = (category: CategoryWithProductCount) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleDelete = async (category: CategoryWithProductCount) => {
    if (category.product_count > 0) {
      toast.error('No se puede eliminar una categoría con productos asociados')
      return
    }

    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return

    setDeletingId(category.id)
    const success = await deleteCategory(category.id)
    setDeletingId(null)

    if (success) {
      toast.success('Categoría eliminada')
    } else {
      toast.error('Error al eliminar la categoría')
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)

    const data: CategoryCreate | CategoryUpdate = {
      name: formData.name.trim(),
      description: formData.description.trim() || null
    }

    let success = false
    if (editingCategory) {
      success = await updateCategory(editingCategory.id, data)
      if (success) toast.success('Categoría actualizada')
    } else {
      success = await createCategory(data as CategoryCreate)
      if (success) toast.success('Categoría creada')
    }

    setSubmitting(false)

    if (success) {
      resetForm()
    } else {
      toast.error('Error al guardar la categoría')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Categorías"
      size="md"
    >
      <div className="space-y-6">
        {/* Formulario */}
        {isFormOpen ? (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h4>

            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={formErrors.name}
              placeholder="Nombre de la categoría"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white resize-none"
                placeholder="Descripción (opcional)"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={submitting}>
                {editingCategory ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={handleCreate} className="w-full">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Categoría
          </Button>
        )}

        {/* Lista de categorías */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay categorías registradas
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {category.name}
                    </p>
                    <Badge variant="info" size="sm">
                      {category.product_count} productos
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={deletingId === category.id || category.product_count > 0}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={category.product_count > 0 ? 'No se puede eliminar (tiene productos)' : 'Eliminar'}
                  >
                    {deletingId === category.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
