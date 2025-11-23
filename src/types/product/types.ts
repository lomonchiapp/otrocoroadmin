/**
 * Tipos principales de productos (modular)
 */

import type { ProductAttribute, ProductVariation } from '../attributes'
import type { ProductImage } from './image'
import type { Metafield } from './metafield'
import type { ProductPricing } from './pricing'
import type { InventoryConfig } from './inventory'
import type { 
  EntityStatus,
  AuditInfo,
  SEOMetadata,
  Sluggable,
  Descriptable,
  Featurable,
  Taggable 
} from '../shared/common'

export type ProductType = 'clothing' | 'jewelry' | 'accessory' | 'other'

/**
 * Estados del producto - Flujo simple para PyMEs
 */
export type ProductStatus = EntityStatus

/**
 * Producto base con toda la información
 * Ahora usa tipos modulares y compartidos
 */
export interface BaseProduct 
  extends Descriptable, 
          Sluggable, 
          Featurable, 
          Taggable, 
          SEOMetadata, 
          AuditInfo {
  
  // Identificación
  id: string
  storeId?: string
  sku?: string
  
  // Tipo y clasificación
  type: ProductType
  categoryId: string
  subcategoryId?: string
  brandId?: string
  
  // Estado
  status: ProductStatus
  
  // Sistema de atributos flexible
  attributes: ProductAttribute[]
  variations: ProductVariation[]
  
  // Precios (ahora usa tipo modular)
  pricing: ProductPricing
  
  // Inventario (ahora usa tipo modular)
  inventory: InventoryConfig
  totalInventory: number
  
  // Imágenes (ahora usa tipo modular)
  images: ProductImage[]
  
  // Metafields para datos adicionales (ahora usa tipo modular)
  metafields: Metafield[]
  
  // Visibilidad y disponibilidad
  isVisible: boolean
  publishedAt?: Date
  
  // Datos adicionales
  vendor?: string
  externalId?: string
}

/**
 * Producto unificado
 */
export type Product = BaseProduct

/**
 * DTO para crear producto
 */
export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

/**
 * DTO para actualizar producto
 */
export type UpdateProductDTO = Partial<CreateProductDTO>

/**
 * Producto con información calculada/agregada
 */
export interface ProductWithExtras extends Product {
  categoryName?: string
  brandName?: string
  averageRating?: number
  reviewCount?: number
  salesCount?: number
  viewCount?: number
}





