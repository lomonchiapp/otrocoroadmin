/**
 * Barrel export para todos los tipos de productos
 * Esto permite importar desde un solo lugar: import { Product, ProductImage } from '@/types/product'
 */

// Tipos principales
export * from './types'

// Tipos modulares
export * from './image'
export * from './metafield'
export * from './pricing'
export * from './inventory'

// Re-exportar tipos compartidos comúnmente usados
export type { 
  EntityStatus,
  AuditInfo,
  SEOMetadata,
  Pagination,
  PaginatedResponse 
} from '../shared/common'





