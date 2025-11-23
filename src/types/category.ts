import type { ProductType } from "./products"

export interface Category {
    id: string
    storeId: string
    name: string
    slug: string
    description?: string
    image?: string
    imagePath?: string // Path en Firebase Storage
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