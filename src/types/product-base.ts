// Tipos base para productos
import type { ProductAttribute, ProductVariation } from './attributes'

export type ProductType = 'clothing' | 'jewelry'

/**
 * Estados del producto - Flujo simple para PyMEs:
 * 
 * draft → El producto está en construcción, no visible en la tienda
 * published → El producto está publicado y visible en la tienda
 * archived → El producto está archivado, no visible pero guardado para referencia
 * 
 * NOTA: El stock/inventario NO es un status. Un producto puede estar published
 * y sin stock. La tienda mostrará "Sin stock" pero el producto sigue visible.
 */
export type ProductStatus = 'draft' | 'published' | 'archived'
export type InventoryPolicy = 'deny' | 'continue' | 'notify'

export interface BaseProduct {
  id: string
  storeId?: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  type: ProductType
  categoryId: string
  subcategoryId?: string
  brandId?: string
  tags: string[]
  status: ProductStatus
  isFeatured: boolean
  seoTitle?: string
  seoDescription?: string
  
  // Sistema de atributos flexible
  attributes: ProductAttribute[]
  variations: ProductVariation[]
  
  // Precios base (pueden ser sobrescritos por variaciones)
  basePrice?: number // Precio para cliente final (retail)
  compareAtPrice?: number // Precio antes de descuento
  wholesalePrice?: number // ✅ Precio para mayoristas (wholesale)
  
  // Inventario global (suma de todas las variaciones)
  totalInventory: number
  
  // Imágenes del producto
  images: ProductImage[]
  
  // Metafields para datos adicionales
  metafields: Metafield[]
  
  // Auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

// Los productos ahora son unificados - las diferencias se manejan por atributos
export type Product = BaseProduct

export interface ProductImage {
  id: string
  url: string
  alt: string
  position: number
  isPrimary: boolean
  variantIds: string[]
  width?: number
  height?: number
  format: 'jpg' | 'png' | 'webp'
  size: number // en bytes
}

export interface Metafield {
  key: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'json'
  namespace: string
  description?: string
}

