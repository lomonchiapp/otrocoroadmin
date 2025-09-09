// Tipos para manejo de clientes en múltiples stores

export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'pending_verification'
export type CustomerSegment = 'vip' | 'frequent' | 'new' | 'at_risk' | 'churned'
export type MarketingConsent = 'opted_in' | 'opted_out' | 'not_set'

export interface Customer {
  id: string
  email: string
  emailVerified: boolean
  firstName: string
  lastName: string
  phone?: string
  phoneVerified: boolean
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  
  // Estado del cliente
  status: CustomerStatus
  segment: CustomerSegment
  
  // Direcciones
  addresses: CustomerAddress[]
  defaultShippingAddressId?: string
  defaultBillingAddressId?: string
  
  // Preferencias
  language: string
  currency: string
  timezone?: string
  
  // Marketing y comunicación
  marketingConsent: {
    email: MarketingConsent
    sms: MarketingConsent
    push: MarketingConsent
    phone: MarketingConsent
  }
  
  // Métricas del cliente
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lifetimeValue: number
  firstOrderDate?: Date
  lastOrderDate?: Date
  daysSinceLastOrder?: number
  
  // Información de registro
  registrationSource: 'web' | 'mobile' | 'social' | 'admin' | 'import'
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referralCode?: string
  referredBy?: string
  
  // Información adicional
  notes: CustomerNote[]
  tags: string[]
  customFields: Record<string, unknown>
  
  // Información técnica
  lastSeenAt?: Date
  ipAddress?: string
  userAgent?: string
  
  // Fechas
  createdAt: Date
  updatedAt: Date
  lastModifiedBy?: string
  
  // Tiendas en las que ha comprado
  storeHistory: CustomerStoreHistory[]
}

export interface CustomerAddress {
  id: string
  customerId: string
  type: 'shipping' | 'billing' | 'both'
  label?: string // "Casa", "Oficina", etc.
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  countryCode: string
  phone?: string
  isDefault: boolean
  isVerified: boolean
  
  // Coordenadas para delivery
  latitude?: number
  longitude?: number
  
  // Instrucciones de entrega
  deliveryInstructions?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface CustomerNote {
  id: string
  customerId: string
  content: string
  isInternal: boolean // Si es visible solo para el equipo interno
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt?: Date
}

export interface CustomerStoreHistory {
  storeId: string
  storeName: string
  firstOrderDate: Date
  lastOrderDate: Date
  totalOrders: number
  totalSpent: number
  favoriteCategories: string[]
  preferredPaymentMethod?: string
  preferredShippingMethod?: string
}

// Tipos para filtros y búsqueda de clientes
export interface CustomerFilters {
  status?: CustomerStatus[]
  segment?: CustomerSegment[]
  storeIds?: string[]
  registrationDateRange?: {
    start: Date
    end: Date
  }
  lastOrderDateRange?: {
    start: Date
    end: Date
  }
  totalSpentRange?: {
    min: number
    max: number
  }
  orderCountRange?: {
    min: number
    max: number
  }
  location?: {
    countries?: string[]
    states?: string[]
    cities?: string[]
  }
  marketingConsent?: {
    email?: MarketingConsent
    sms?: MarketingConsent
  }
  tags?: string[]
  hasNotes?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
  gender?: string[]
  ageRange?: {
    min: number
    max: number
  }
}

export interface CustomerSearchParams {
  query?: string // Buscar por email, nombre, teléfono
  filters?: CustomerFilters
  sortBy?: 'created_at' | 'last_order_date' | 'total_spent' | 'total_orders' | 'lifetime_value'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  includeAddresses?: boolean
  includeOrderHistory?: boolean
  includeStoreHistory?: boolean
}

export interface PaginatedCustomerResponse {
  data: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  aggregations?: {
    totalCustomers: number
    totalLifetimeValue: number
    averageLifetimeValue: number
    segmentCounts: Record<CustomerSegment, number>
    statusCounts: Record<CustomerStatus, number>
    topSpenders: CustomerSpendingSummary[]
  }
}

export interface CustomerSpendingSummary {
  customerId: string
  customerName: string
  email: string
  totalSpent: number
  totalOrders: number
  lastOrderDate: Date
}

// Tipos para operaciones con clientes
export interface CustomerUpdate {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: Date
  gender?: string
  status?: CustomerStatus
  segment?: CustomerSegment
  language?: string
  currency?: string
  marketingConsent?: {
    email?: MarketingConsent
    sms?: MarketingConsent
    push?: MarketingConsent
    phone?: MarketingConsent
  }
  tags?: string[]
  customFields?: Record<string, unknown>
  lastModifiedBy: string
}

export interface CustomerAnalytics {
  period: 'today' | '7days' | '30days' | '90days' | '1year'
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  churnedCustomers: number
  customerRetentionRate: number
  customerAcquisitionCost?: number
  averageLifetimeValue: number
  
  // Distribuciones
  segmentDistribution: Record<CustomerSegment, number>
  statusDistribution: Record<CustomerStatus, number>
  geoDistribution: GeoDistribution[]
  ageDistribution: AgeDistribution[]
  
  // Tendencias
  registrationsByDay: RegistrationByDay[]
  cohortAnalysis: CohortData[]
}

export interface GeoDistribution {
  country: string
  customers: number
  percentage: number
  totalSpent: number
}

export interface AgeDistribution {
  ageRange: string
  customers: number
  percentage: number
  averageOrderValue: number
}

export interface RegistrationByDay {
  date: string
  registrations: number
  source: Record<string, number>
}

export interface CohortData {
  cohortMonth: string
  totalCustomers: number
  retentionByMonth: Record<string, number>
}

// Tipos para comunicación con clientes
export interface CustomerCommunication {
  id: string
  customerId: string
  type: 'email' | 'sms' | 'push' | 'phone' | 'note'
  subject?: string
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
  
  // Metadatos del mensaje
  templateId?: string
  campaignId?: string
  
  // Seguimiento
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  failedAt?: Date
  errorMessage?: string
  
  // Usuario que envió
  sentBy: string
  sentByName: string
  
  createdAt: Date
}

export interface BulkCustomerOperation {
  id: string
  type: 'update' | 'delete' | 'export' | 'segment' | 'email_campaign'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  failedItems: number
  errors: BulkCustomerError[]
  parameters: Record<string, unknown>
  createdBy: string
  createdAt: Date
  completedAt?: Date
}

export interface BulkCustomerError {
  customerId: string
  customerEmail: string
  error: string
  details?: string
}

// Estados para el manejo de clientes en la UI
export interface CustomerState {
  selectedCustomers: string[]
  isLoading: boolean
  error: string | null
  currentCustomer: Customer | null
  customerAnalytics: CustomerAnalytics | null
  bulkOperations: BulkCustomerOperation[]
}
