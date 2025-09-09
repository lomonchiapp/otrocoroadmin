// Archivo índice para todos los tipos del admin multi-store

// Tipos de stores
export type {
  StoreType,
  Store,
  StoreSettings,
  ShippingZone,
  ShippingMethod,
  PaymentMethod,
  NotificationSettings,
  AdminState,
  AdminUser,
  AdminRole,
  StoreAccess,
  Permission,
  DashboardMetrics,
  ProductMetric,
  OrderSummary,
  ProductStockAlert,
  OrderStatus as OrderStatusFromStores
} from './stores'

// Tipos de productos
export type {
  ProductType,
  ProductStatus,
  InventoryPolicy,
  BaseProduct,
  ClothingProduct,
  JewelryProduct,
  ClothingDetails,
  JewelryDetails,
  Material,
  Gemstone,
  Dimensions,
  BaseVariant,
  ClothingVariant,
  JewelryVariant,
  Color,
  ClothingSize,
  JewelrySize,
  SizeMeasurement,
  ProductImage,
  Category,
  Brand,
  Metafield,
  ProductFilters,
  ProductSearchParams,
  PaginatedProductResponse,
  BulkOperation,
  BulkError,
  Product
} from './products'

// Tipos de órdenes
export type {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  Order,
  OrderCustomer,
  OrderItem,
  ProductSnapshot,
  VariantSnapshot,
  Address,
  ShippingMethodSummary,
  OrderPayment,
  TrackingInfo,
  TrackingEvent,
  BrowserInfo,
  OrderFilters,
  OrderSearchParams,
  PaginatedOrderResponse,
  OrderUpdate,
  RefundRequest,
  RefundItem,
  OrderAnalytics,
  OrderProductAnalytics,
  RevenueByDay,
  OrderState
} from './orders'

// Tipos de clientes
export type {
  CustomerStatus,
  CustomerSegment,
  MarketingConsent,
  Customer,
  CustomerAddress,
  CustomerNote,
  CustomerStoreHistory,
  CustomerFilters,
  CustomerSearchParams,
  PaginatedCustomerResponse,
  CustomerSpendingSummary,
  CustomerUpdate,
  CustomerAnalytics,
  GeoDistribution,
  AgeDistribution,
  RegistrationByDay,
  CohortData,
  CustomerCommunication,
  BulkCustomerOperation,
  BulkCustomerError,
  CustomerState
} from './customers'

// Tipos comunes utilizados en múltiples módulos
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface SearchFilters {
  query?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

// Tipos para manejo de errores
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

// Tipos para configuración de la aplicación
export interface AppConfig {
  apiUrl: string
  enableDevtools: boolean
  supportedStores: StoreType[]
  defaultCurrency: string
  supportedCurrencies: string[]
  supportedLanguages: string[]
  features: {
    multiStore: boolean
    bulkOperations: boolean
    analytics: boolean
    customerSegmentation: boolean
    inventoryTracking: boolean
  }
}

// Tipos para notificaciones
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: Date
  isRead: boolean
  expiresAt?: Date
}

// Tipos para manejo de archivos/uploads
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: Date
}

// Tipos para audit log
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress: string
  userAgent: string
  timestamp: Date
  storeId?: string
}
