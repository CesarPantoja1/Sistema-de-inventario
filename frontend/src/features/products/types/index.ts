/**
 * Tipos e interfaces para el módulo de productos
 */

// ==================== CATEGORY ====================
export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface CategoryWithProductCount extends Category {
  product_count: number
}

export interface CategoryCreate {
  name: string
  description?: string | null
}

export interface CategoryUpdate {
  name?: string
  description?: string | null
}

// ==================== SUPPLIER ====================
export interface Supplier {
  id: number
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierWithProductCount extends Supplier {
  product_count: number
}

export interface SupplierCreate {
  name: string
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface SupplierUpdate {
  name?: string
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  is_active?: boolean
}

// ==================== PRODUCT ====================
export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  category_id: number | null
  supplier_id: number | null
  stock_current: number
  stock_min: number
  cost: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithRelations extends Product {
  category: Category | null
  supplier: Supplier | null
  is_low_stock: boolean
  profit_margin: number
}

export interface ProductCreate {
  sku: string
  name: string
  description?: string | null
  category_id?: number | null
  supplier_id?: number | null
  stock_current?: number
  stock_min?: number
  cost: number
  price: number
}

export interface ProductUpdate {
  sku?: string
  name?: string
  description?: string | null
  category_id?: number | null
  supplier_id?: number | null
  stock_min?: number
  cost?: number
  price?: number
  is_active?: boolean
}

export interface ProductFilter {
  search?: string
  category_id?: number
  supplier_id?: number
  is_active?: boolean
  low_stock_only?: boolean
  min_price?: number
  max_price?: number
}

export interface ProductListResponse {
  items: ProductWithRelations[]
  total: number
  page: number
  page_size: number
  pages: number
}

// ==================== API RESPONSE ====================
export interface ApiError {
  detail: string
}
