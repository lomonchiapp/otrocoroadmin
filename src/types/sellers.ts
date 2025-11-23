// Tipos para vendedores (sellers/salespersons)

export type SellerStatus = 'active' | 'inactive' | 'on_leave' | 'suspended'
export type VisitStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type VisitType = 'scheduled' | 'walk_in' | 'follow_up' | 'emergency'

export interface Seller {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  avatar?: string
  status: SellerStatus
  
  // Información laboral
  hireDate: Date
  supervisorId?: string
  supervisorName?: string
  
  // Zona asignada
  assignedZone: AssignedZone
  
  // Métricas de desempeño
  metrics: SellerMetrics
  
  // Configuración
  settings: {
    allowRemoteCheckIn: boolean
    requirePhotoProof: boolean
    maxDailyVisits: number
  }
  
  // Fechas
  createdAt: Date
  updatedAt: Date
  lastActiveAt?: Date
}

export interface AssignedZone {
  id: string
  name: string
  description?: string
  coverage: ZoneCoverage
  stores: ZoneStore[]
  assignedAt: Date
  assignedBy: string
}

export interface ZoneCoverage {
  type: 'city' | 'district' | 'region' | 'custom'
  cities?: string[]
  districts?: string[]
  regions?: string[]
  coordinates?: {
    lat: number
    lng: number
  }[]
  radius?: number // en kilómetros
}

export interface ZoneStore {
  id: string
  storeId: string
  storeName: string
  storeAddress: string
  storePhone?: string
  coordinates: {
    lat: number
    lng: number
  }
  visitFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  preferredDays?: string[]
  notes?: string
  isActive: boolean
}

export interface SellerMetrics {
  // Visitas
  totalVisits: number
  completedVisits: number
  pendingVisits: number
  cancelledVisits: number
  
  // Rendimiento
  averageVisitsPerDay: number
  averageVisitDuration: number // en minutos
  onTimeRate: number // porcentaje
  completionRate: number // porcentaje
  
  // Ventas (si aplica)
  totalOrders?: number
  totalRevenue?: number
  averageOrderValue?: number
  
  // Período
  periodStart: Date
  periodEnd: Date
  lastUpdated: Date
}

export interface SellerVisit {
  id: string
  sellerId: string
  sellerName: string
  
  // Información de la visita
  type: VisitType
  status: VisitStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Tienda visitada
  storeId: string
  storeName: string
  storeAddress: string
  storeCoordinates: {
    lat: number
    lng: number
  }
  
  // Programación
  scheduledDate: Date
  scheduledTime: string
  estimatedDuration: number // en minutos
  
  // Check-in/Check-out
  checkInTime?: Date
  checkInLocation?: {
    lat: number
    lng: number
  }
  checkInPhoto?: string
  checkInNotes?: string
  
  checkOutTime?: Date
  checkOutLocation?: {
    lat: number
    lng: number
  }
  checkOutPhoto?: string
  checkOutNotes?: string
  
  // Resultados de la visita
  outcome?: VisitOutcome
  
  // Seguimiento
  followUpRequired: boolean
  followUpDate?: Date
  followUpNotes?: string
  
  // Auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy?: string
}

export interface VisitOutcome {
  // Actividades realizadas
  activitiesCompleted: string[]
  issuesFound: VisitIssue[]
  
  // Pedidos (si aplica)
  ordersTaken?: {
    orderId: string
    orderNumber: string
    amount: number
  }[]
  
  // Inventario
  inventoryChecked: boolean
  inventoryNotes?: string
  lowStockItems?: {
    productId: string
    productName: string
    currentStock: number
    recommendedOrder: number
  }[]
  
  // Evaluación
  storeConditionRating: number // 1-5
  staffCooperationRating: number // 1-5
  overallSatisfaction: number // 1-5
  
  // Notas y observaciones
  generalNotes?: string
  photos: string[]
  documents: string[]
}

export interface VisitIssue {
  id: string
  type: 'inventory' | 'display' | 'pricing' | 'staff' | 'infrastructure' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  reportedAt: Date
  resolvedAt?: Date
  resolution?: string
}

// Filtros para búsqueda de vendedores
export interface SellerFilters {
  status?: SellerStatus[]
  zoneId?: string
  supervisorId?: string
  search?: string
}

// Filtros para búsqueda de visitas
export interface VisitFilters {
  sellerId?: string
  storeId?: string
  status?: VisitStatus[]
  type?: VisitType[]
  dateFrom?: Date
  dateTo?: Date
  zoneId?: string
}

// Respuesta paginada para vendedores
export interface PaginatedSellersResponse {
  data: Seller[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Respuesta paginada para visitas
export interface PaginatedVisitsResponse {
  data: SellerVisit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary?: {
    totalCompleted: number
    totalPending: number
    totalCancelled: number
    averageCompletionTime: number
  }
}

// Datos de actividad reciente del vendedor
export interface SellerActivity {
  id: string
  sellerId: string
  type: 'visit_completed' | 'visit_scheduled' | 'order_placed' | 'issue_reported' | 'zone_changed'
  title: string
  description: string
  metadata?: Record<string, unknown>
  timestamp: Date
}

// Reporte de rendimiento del vendedor
export interface SellerPerformanceReport {
  sellerId: string
  sellerName: string
  period: {
    start: Date
    end: Date
  }
  
  visitMetrics: {
    total: number
    completed: number
    pending: number
    cancelled: number
    onTimePercentage: number
    averageDuration: number
  }
  
  storesCovered: {
    total: number
    visited: number
    notVisited: number
    visitFrequency: Record<string, number>
  }
  
  performance: {
    overall: number // 1-100
    punctuality: number // 1-100
    thoroughness: number // 1-100
    communication: number // 1-100
  }
  
  highlights: string[]
  concerns: string[]
  recommendations: string[]
  
  generatedAt: Date
  generatedBy: string
}




