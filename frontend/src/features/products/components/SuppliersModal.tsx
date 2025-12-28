/**
 * Modal para gestión de proveedores
 */
import { useState } from 'react'
import { Modal, Input, Button, Badge } from '@/shared/components/ui'
import { useToast } from '@/shared/components/ui/Toast'
import { useSuppliers } from '../hooks'
import { SupplierWithProductCount, SupplierCreate, SupplierUpdate } from '../types'

interface SuppliersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuppliersModal({ isOpen, onClose }: SuppliersModalProps) {
  const toast = useToast()
  const {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier
  } = useSuppliers()

  const [editingSupplier, setEditingSupplier] = useState<SupplierWithProductCount | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: ''
    })
    setFormErrors({})
    setEditingSupplier(null)
    setIsFormOpen(false)
  }

  const handleCreate = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const handleEdit = (supplier: SupplierWithProductCount) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const handleToggleActive = async (supplier: SupplierWithProductCount) => {
    const success = await updateSupplier(supplier.id, { is_active: !supplier.is_active })
    if (success) {
      toast.success(supplier.is_active ? 'Proveedor desactivado' : 'Proveedor activado')
    } else {
      toast.error('Error al actualizar el proveedor')
    }
  }

  const handleDelete = async (supplier: SupplierWithProductCount) => {
    if (supplier.product_count > 0) {
      toast.error('No se puede eliminar un proveedor con productos asociados')
      return
    }

    if (!confirm(`¿Eliminar el proveedor "${supplier.name}"?`)) return

    setDeletingId(supplier.id)
    const success = await deleteSupplier(supplier.id)
    setDeletingId(null)

    if (success) {
      toast.success('Proveedor eliminado')
    } else {
      toast.error('Error al eliminar el proveedor')
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)

    const data: SupplierCreate | SupplierUpdate = {
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null
    }

    let success = false
    if (editingSupplier) {
      success = await updateSupplier(editingSupplier.id, data)
      if (success) toast.success('Proveedor actualizado')
    } else {
      success = await createSupplier(data as SupplierCreate)
      if (success) toast.success('Proveedor creado')
    }

    setSubmitting(false)

    if (success) {
      resetForm()
    } else {
      toast.error('Error al guardar el proveedor')
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Proveedores"
      size="lg"
    >
      <div className="space-y-6">
        {/* Formulario */}
        {isFormOpen ? (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900">
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={formData.name}
                onChange={handleChange('name')}
                error={formErrors.name}
                placeholder="Nombre del proveedor"
              />
              <Input
                label="Contacto"
                value={formData.contact_person}
                onChange={handleChange('contact_person')}
                placeholder="Persona de contacto"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={formErrors.email}
                placeholder="email@ejemplo.com"
              />
              <Input
                label="Teléfono"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="+52 123 456 7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                value={formData.address}
                onChange={handleChange('address')}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white resize-none"
                placeholder="Dirección (opcional)"
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
                {editingSupplier ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={handleCreate} className="w-full">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proveedor
          </Button>
        )}

        {/* Lista de proveedores */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay proveedores registrados
            </div>
          ) : (
            suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`p-4 bg-white border rounded-xl transition-colors ${
                  supplier.is_active
                    ? 'border-gray-100 hover:border-gray-200'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">
                        {supplier.name}
                      </p>
                      <Badge variant="info" size="sm">
                        {supplier.product_count} productos
                      </Badge>
                      {!supplier.is_active && (
                        <Badge variant="default" size="sm">Inactivo</Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      {supplier.contact_person && (
                        <p className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {supplier.contact_person}
                        </p>
                      )}
                      {supplier.email && (
                        <p className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {supplier.email}
                        </p>
                      )}
                      {supplier.phone && (
                        <p className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {supplier.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleToggleActive(supplier)}
                      className={`p-2 rounded-lg transition-colors ${
                        supplier.is_active
                          ? 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
                          : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={supplier.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {supplier.is_active ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(supplier)}
                      disabled={deletingId === supplier.id || supplier.product_count > 0}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={supplier.product_count > 0 ? 'No se puede eliminar (tiene productos)' : 'Eliminar'}
                    >
                      {deletingId === supplier.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
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
