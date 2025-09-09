// Tipos robustos para manejo de productos en múltiples stores

export type ProductType = 'clothing' | 'jewelry' | 'accessory'
export type ProductStatus = 'draft' | 'active' | 'archived' | 'out_of_stock'
export type InventoryPolicy = 'deny' | 'continue' | 'notify'

export interface BaseProduct {
  id: string
  storeId: string
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
  metafields: Metafield[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

// Producto específico para ropa
export interface ClothingProduct extends BaseProduct {
  type: 'clothing'
  clothingDetails: ClothingDetails
  variants: ClothingVariant[]
}

// Producto específico para joyería
export interface JewelryProduct extends BaseProduct {
  type: 'jewelry'
  jewelryDetails: JewelryDetails
  variants: JewelryVariant[]
}

export interface ClothingDetails {
  gender: 'men' | 'women' | 'unisex' | 'kids'
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all_season'
  careInstructions: string[]
  materials: Material[]
  fitType: 'slim' | 'regular' | 'loose' | 'oversized'
  origin: string
}

export interface JewelryDetails {
  metalType: 'gold' | 'silver' | 'platinum' | 'stainless_steel' | 'other'
  goldKarat?: '14k' | '18k' | '24k'
  gemstones: Gemstone[]
  weight?: number // en gramos
  dimensions: Dimensions
  warranty: string
  certification?: string
  origin: string
}

export interface Material {
  name: string
  percentage: number
}

export interface Gemstone {
  type: string
  carat?: number
  color?: string
  clarity?: string
  cut?: string
}

export interface Dimensions {
  length?: number
  width?: number
  height?: number
  diameter?: number
  unit: 'mm' | 'cm' | 'inches'
}

export interface BaseVariant {
  id: string
  productId: string
  sku: string
  barcode?: string
  price: number
  compareAtPrice?: number
  costPerItem?: number
  inventoryQuantity: number
  inventoryPolicy: InventoryPolicy
  fulfillmentService: 'manual' | 'automatic'
  requiresShipping: boolean
  weight?: number
  weightUnit: 'g' | 'kg' | 'lb' | 'oz'
  isActive: boolean
  position: number
  images: ProductImage[]
  createdAt: Date
  updatedAt: Date
}

export interface ClothingVariant extends BaseVariant {
  colorId: string
  sizeId: string
  color: Color
  size: ClothingSize
}

export interface JewelryVariant extends BaseVariant {
  size?: JewelrySize
  customization?: string
  engraving?: string
}

export interface Color {
  id: string
  name: string
  hex: string
  colorFamily: string
  isActive: boolean
  sortOrder: number
}

export interface ClothingSize {
  id: string
  name: string
  abbreviation: string
  measurements: SizeMeasurement[]
  category: 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories'
  isActive: boolean
  sortOrder: number
}

export interface JewelrySize {
  id: string
  name: string
  value: string | number
  category: 'rings' | 'bracelets' | 'necklaces' | 'earrings'
  isActive: boolean
  sortOrder: number
}

export interface SizeMeasurement {
  name: string
  value: number
  unit: 'cm' | 'inches'
}

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

export interface Category {
  id: string
  storeId: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  level: number
  productType: ProductType
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  sortOrder: number
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  isActive: boolean
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Metafield {
  key: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'json'
  namespace: string
  description?: string
}

// Tipos para filtros y búsqueda avanzada
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
  data: (ClothingProduct | JewelryProduct)[]
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

export type Product = ClothingProduct | JewelryProduct
