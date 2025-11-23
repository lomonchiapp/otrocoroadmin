// Tipos para filtros, búsqueda y paginación de productos
import type { ProductType, ProductStatus } from './product-base'

export interface ProductFilters {
  storeId?: string
  type?: ProductType
  categoryIds?: string[]
  brandIds?: string[]
  status?: ProductStatus[]
  priceRange?: {
    min: number
    max: number
  }
  tags?: string[]
  isFeatured?: boolean
  hasStock?: boolean
  createdDateRange?: {
    start: Date
    end: Date
  }
  // Filtros específicos para ropa
  clothingFilters?: {
    colors?: string[]
    sizes?: string[]
    gender?: string[]
    materials?: string[]
  }
  // Filtros específicos para joyería
  jewelryFilters?: {
    metalTypes?: string[]
    gemstones?: string[]
    weightRange?: {
      min: number
      max: number
    }
  }
}

export interface ProductSearchParams {
  query?: string
  filters?: ProductFilters
  sortBy?: 'name' | 'price' | 'created_at' | 'updated_at' | 'inventory_quantity' | 'featured'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  fields?: string[] // campos específicos a retornar
}

export interface PaginatedProductResponse {
  data: any[] // Se define en product-base.ts
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  aggregations?: {
    totalValue: number
    averagePrice: number
    stockStatus: {
      inStock: number
      lowStock: number
      outOfStock: number
    }
  }
}

// Tipos para operaciones bulk
export interface BulkOperation {
  id: string
  type: 'update' | 'delete' | 'export' | 'import'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  failedItems: number
  errors: BulkError[]
  createdAt: Date
  completedAt?: Date
}

export interface BulkError {
  itemId: string
  error: string
  details?: string
}


