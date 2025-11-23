export interface Brand {
    id: string
    name: string
    slug: string
    description?: string
    logo?: string
    logoPath?: string // Path en Firebase Storage
    website?: string
    isActive: boolean
    productCount?: number
    createdAt: Date
    updatedAt: Date
  }