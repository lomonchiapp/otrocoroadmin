/**
 * Sistema de Combos/Bundles
 * Un combo es un conjunto de productos que se venden juntos con descuento
 */

export type BundleStatus = 'draft' | 'active' | 'scheduled' | 'expired' | 'archived'
export type BundleDiscountType = 'percentage' | 'fixed' | 'bundle_price'

/**
 * Item dentro de un combo
 */
export interface BundleItem {
  productId: string
  productName: string // Denormalizado para UI rápida
  productImage?: string // Denormalizado para UI rápida
  variationId?: string // Si es una variación específica
  variationName?: string
  quantity: number // Cantidad de este producto en el combo
  originalPrice: number // Precio original del producto/variación
}

/**
 * Configuración de descuento del combo
 */
export interface BundleDiscount {
  type: BundleDiscountType
  
  // Para 'percentage': valor entre 0-100 (ej: 20 = 20% descuento)
  // Para 'fixed': valor en moneda (ej: 1000 = $1000 de descuento)
  // Para 'bundle_price': precio fijo del combo completo
  value: number
}

/**
 * Restricciones del combo
 */
export interface BundleRestrictions {
  // Cantidad mínima para comprar
  minQuantity: number
  
  // Cantidad máxima por orden
  maxQuantity?: number
  
  // Si el combo requiere comprar todos los items o permite selección
  requiresAllItems: boolean
  
  // Si permite cambiar cantidades de items individuales
  allowQuantityChange: boolean
  
  // Usuarios elegibles (si está vacío, aplica a todos)
  eligibleCustomerSegments?: ('retail' | 'wholesale' | 'vip')[]
}

/**
 * Combo/Bundle principal
 */
export interface Bundle {
  id: string
  storeId: string
  
  // Información básica
  name: string
  slug: string
  description: string
  shortDescription?: string
  
  // Estado y visibilidad
  status: BundleStatus
  isFeatured: boolean
  
  // Programación
  startDate?: Date // Fecha de inicio (para scheduled)
  endDate?: Date // Fecha de fin (para expiración automática)
  
  // Items del combo
  items: BundleItem[]
  
  // Descuento
  discount: BundleDiscount
  
  // Restricciones
  restrictions: BundleRestrictions
  
  // Precios calculados
  totalOriginalPrice: number // Suma de precios originales
  bundlePrice: number // Precio final del combo con descuento
  savings: number // Ahorro total (originalPrice - bundlePrice)
  savingsPercentage: number // % de ahorro
  
  // Imágenes
  images: string[]
  primaryImage?: string
  
  // SEO
  seoTitle?: string
  seoDescription?: string
  
  // Tags para filtrado
  tags: string[]
  
  // Categorías asociadas (para mostrar el combo en ciertas categorías)
  categoryIds: string[]
  
  // Inventario
  // El stock del combo está limitado por el stock de sus items
  availableQuantity: number // Stock disponible (calculado del item con menos stock)
  isInStock: boolean
  
  // Analytics
  viewCount: number
  purchaseCount: number
  revenue: number
  
  // Auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

/**
 * Filtros para búsqueda de combos
 */
export interface BundleFilters {
  storeId?: string
  status?: BundleStatus[]
  isFeatured?: boolean
  categoryIds?: string[]
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string // Buscar por nombre o descripción
}

/**
 * Parámetros para búsqueda paginada
 */
export interface BundleSearchParams {
  filters?: BundleFilters
  sortBy?: 'created_at' | 'name' | 'price' | 'popularity' | 'savings'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Respuesta paginada
 */
export interface PaginatedBundleResponse {
  data: Bundle[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * DTO para crear/actualizar combo
 */
export interface CreateBundleDTO {
  storeId: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  status: BundleStatus
  isFeatured: boolean
  startDate?: Date
  endDate?: Date
  items: Omit<BundleItem, 'productName' | 'productImage' | 'originalPrice'>[]
  discount: BundleDiscount
  restrictions: BundleRestrictions
  images: string[]
  seoTitle?: string
  seoDescription?: string
  tags: string[]
  categoryIds: string[]
}

/**
 * Análisis de un combo
 */
export interface BundleAnalytics {
  bundleId: string
  bundleName: string
  
  // Métricas de rendimiento
  viewCount: number
  addToCartCount: number
  purchaseCount: number
  conversionRate: number // (purchaseCount / viewCount) * 100
  
  // Métricas financieras
  revenue: number
  averageOrderValue: number
  totalSavingsGiven: number
  
  // Tendencias (últimos 30 días)
  dailyViews: { date: string; count: number }[]
  dailySales: { date: string; count: number; revenue: number }[]
  
  // Popularidad de items
  itemPerformance: {
    productId: string
    productName: string
    timesOrdered: number
  }[]
}

/**
 * Validación de combo
 */
export interface BundleValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Estado del combo en el carrito
 */
export interface CartBundle {
  bundleId: string
  bundleName: string
  bundleSlug: string
  quantity: number
  bundlePrice: number
  originalPrice: number
  savings: number
  items: {
    productId: string
    productName: string
    variationId?: string
    variationName?: string
    quantity: number
  }[]
  primaryImage?: string
}
