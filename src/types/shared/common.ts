/**
 * Tipos compartidos y reutilizables en toda la aplicación
 */

/**
 * Estados comunes para entidades
 */
export type EntityStatus = 'draft' | 'published' | 'archived'

/**
 * Información de auditoría para todas las entidades
 */
export interface AuditInfo {
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

/**
 * Metadata básica para SEO
 */
export interface SEOMetadata {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

/**
 * Información de slug
 */
export interface Sluggable {
  slug: string
}

/**
 * Entidad con nombre y descripción
 */
export interface Descriptable {
  name: string
  description: string
  shortDescription?: string
}

/**
 * Entidad que puede ser destacada
 */
export interface Featurable {
  isFeatured: boolean
}

/**
 * Entidad con tags
 */
export interface Taggable {
  tags: string[]
}

/**
 * Paginación estándar
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Respuesta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

/**
 * Filtros de búsqueda base
 */
export interface BaseSearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Rango de valores numéricos
 */
export interface NumericRange {
  min?: number
  max?: number
}

/**
 * Rango de fechas
 */
export interface DateRange {
  start?: Date
  end?: Date
}

/**
 * Coordenadas geográficas
 */
export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Moneda
 */
export interface Currency {
  code: string // USD, COP, EUR
  symbol: string // $, €
}

/**
 * Precio con moneda
 */
export interface Price {
  amount: number
  currency: Currency
}

/**
 * Descuento
 */
export interface Discount {
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
}





