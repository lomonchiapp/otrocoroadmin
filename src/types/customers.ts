// ✅ Tipos unificados para Usuario (admin) y User (ecommerce)
// Un User del ecommerce es un Usuario en el sistema admin
// Nota: Mantenemos el nombre "Customer" en el código por compatibilidad, pero lo llamamos "Usuario" en la UI

export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'pending_verification'
export type CustomerSegment = 'vip' | 'frequent' | 'new' | 'at_risk' | 'churned'
export type MarketingConsent = 'opted_in' | 'opted_out' | 'not_set'

// ✅ Tipos de usuario: Mayorista (wholesale) o Cliente Final (retail)
export type UserType = 'wholesale' | 'retail'

export interface Customer {
  id: string // Firebase UID
  email: string
  emailVerified: boolean
  passwordSet: boolean // ✅ Indica si el usuario ya estableció su contraseña
  firstName: string
  lastName: string
  phone?: string
  phoneVerified: boolean
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  
  // Avatar/foto de perfil
  photoURL?: string
  displayName?: string // firstName + lastName generado automáticamente
  
  // ✅ Tipo de usuario: Determina qué precios ve
  userType: UserType
  
  // Información fiscal para mayoristas
  taxId?: string // NIT o RUT
  businessName?: string // Razón social
  
  // Estado del usuario
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

// ✅ Sistema de direcciones adaptado para República Dominicana
export type DeliveryType = 'pickup' | 'home_delivery' // Pickup en agencia o entrega a domicilio
export type ShippingAgency = 
  | 'caribe_tours'
  | 'metro'
  | 'jet_courier'
  | 'dhl'
  | 'fedex'
  | 'ups'
  | 'domex'
  | 'otra' // Permite agregar otras agencias

// ✅ Agencias de envío disponibles con nombres legibles
export const SHIPPING_AGENCIES = {
  caribe_tours: 'Caribe Tours',
  metro: 'Metro Servicios Express',
  jet_courier: 'Jet Courier',
  dhl: 'DHL Express',
  fedex: 'FedEx',
  ups: 'UPS',
  domex: 'Domex',
  otra: 'Otra agencia'
} as const

// ✅ Ciudades principales de República Dominicana
export const DOMINICAN_CITIES = [
  'Santo Domingo',
  'Santiago de los Caballeros',
  'La Vega',
  'San Pedro de Macorís',
  'La Romana',
  'Puerto Plata',
  'San Francisco de Macorís',
  'Higüey',
  'San Cristóbal',
  'Moca',
  'Bonao',
  'Baní',
  'Azua',
  'Mao',
  'Barahona',
  'San Juan de la Maguana',
  'Nagua',
  'Monte Plata',
  'Cotuí',
  'Samaná'
] as const

export interface CustomerAddress {
  id: string
  customerId: string
  label?: string // "Casa", "Oficina", "Agencia Caribe Tours Centro", etc.
  
  // ✅ Tipo de entrega
  deliveryType: DeliveryType
  
  // ✅ Para PICKUP en agencia
  shippingAgency?: ShippingAgency // Nombre de la agencia
  agencyBranch?: string // Sucursal/oficina de la agencia
  agencyAddress?: string // Dirección de la agencia (opcional)
  
  // ✅ Para ENTREGA A DOMICILIO
  firstName?: string
  lastName?: string
  phone: string // REQUERIDO para contacto
  whatsapp?: string // Número de WhatsApp (puede ser diferente al teléfono)
  
  // Dirección simplificada para RD
  city: string // Ciudad/municipio (ej: "Santo Domingo", "Santiago")
  sector: string // Sector o barrio (ej: "Naco", "Piantini", "Los Mina")
  street: string // Calle principal
  houseNumber?: string // Número de casa/edificio
  reference: string // Punto de referencia (ej: "Frente al Supermercado Nacional")
  additionalDetails?: string // Detalles adicionales (apartamento, piso, etc.)
  
  // Siempre República Dominicana
  country: 'República Dominicana'
  countryCode: 'DO'
  
  // Coordenadas para delivery (opcional)
  latitude?: number
  longitude?: number
  
  // Instrucciones especiales
  deliveryInstructions?: string
  
  // Preferencias
  isDefault: boolean
  isVerified: boolean
  
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
