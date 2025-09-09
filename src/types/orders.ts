// Tipos para manejo de órdenes en múltiples stores

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'partially_refunded'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'failed' | 'cancelled' | 'refunded'
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  storeId: string
  orderNumber: string
  customerId: string
  customer: OrderCustomer
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  currency: string
  
  // Información de envío
  shippingAddress: Address
  billingAddress: Address
  shippingMethod: ShippingMethodSummary
  
  // Información de pago
  paymentMethods: OrderPayment[]
  
  // Seguimiento
  trackingNumbers: TrackingInfo[]
  estimatedDeliveryDate?: Date
  actualDeliveryDate?: Date
  
  // Metadatos
  source: 'web' | 'mobile' | 'admin' | 'api'
  browserInfo?: BrowserInfo
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  
  // Notas y comunicación
  customerNotes?: string
  internalNotes?: string
  tags: string[]
  
  // Fechas
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
  refundedAt?: Date
  
  // Usuario que gestionó la orden
  assignedTo?: string
  lastModifiedBy?: string
}

export interface OrderCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  isGuest: boolean
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderAt?: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  
  // Información del producto al momento de la orden
  productSnapshot: ProductSnapshot
  variantSnapshot: VariantSnapshot
  
  // Estados específicos del item
  fulfillmentStatus: FulfillmentStatus
  quantityFulfilled: number
  quantityRefunded: number
  refundAmount: number
  
  // Personalización
  customization?: string
  giftMessage?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface ProductSnapshot {
  name: string
  slug: string
  description: string
  images: string[]
  categoryName: string
  brandName?: string
  type: 'clothing' | 'jewelry'
}

export interface VariantSnapshot {
  sku: string
  title: string
  price: number
  compareAtPrice?: number
  color?: {
    name: string
    hex: string
  }
  size?: {
    name: string
    value: string
  }
  weight?: number
  weightUnit?: string
}

export interface Address {
  id?: string
  type: 'shipping' | 'billing'
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
  isDefault?: boolean
}

export interface ShippingMethodSummary {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
  carrier?: string
  serviceCode?: string
}

export interface OrderPayment {
  id: string
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
  provider: string
  amount: number
  currency: string
  status: PaymentStatus
  transactionId?: string
  gatewayTransactionId?: string
  processingFee?: number
  
  // Información de tarjeta (sin datos sensibles)
  cardLast4?: string
  cardBrand?: string
  cardExpiry?: string
  
  // Referencias
  authorizationCode?: string
  captureId?: string
  refundIds: string[]
  
  // Fechas
  authorizedAt?: Date
  capturedAt?: Date
  failedAt?: Date
  createdAt: Date
}

export interface TrackingInfo {
  carrier: string
  trackingNumber: string
  trackingUrl?: string
  status: 'pending' | 'in_transit' | 'delivered' | 'exception'
  estimatedDelivery?: Date
  actualDelivery?: Date
  events: TrackingEvent[]
  createdAt: Date
}

export interface TrackingEvent {
  timestamp: Date
  status: string
  description: string
  location?: string
}

export interface BrowserInfo {
  userAgent: string
  ipAddress: string
  acceptLanguage: string
  timezone?: string
}

// Tipos para filtros y búsqueda de órdenes
export interface OrderFilters {
  storeIds?: string[]
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  fulfillmentStatus?: FulfillmentStatus[]
  customerIds?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  shippingMethods?: string[]
  paymentMethods?: string[]
  tags?: string[]
  source?: string[]
  hasNotes?: boolean
  isGuest?: boolean
}

export interface OrderSearchParams {
  query?: string // Buscar por número de orden, email, nombre
  filters?: OrderFilters
  sortBy?: 'created_at' | 'updated_at' | 'total_amount' | 'order_number'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedOrderResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  aggregations?: {
    totalRevenue: number
    averageOrderValue: number
    statusCounts: Record<OrderStatus, number>
    paymentStatusCounts: Record<PaymentStatus, number>
  }
}

// Tipos para operaciones con órdenes
export interface OrderUpdate {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  fulfillmentStatus?: FulfillmentStatus
  internalNotes?: string
  tags?: string[]
  assignedTo?: string
  shippingAddress?: Address
  billingAddress?: Address
  trackingNumbers?: TrackingInfo[]
}

export interface RefundRequest {
  orderId: string
  items: RefundItem[]
  reason: string
  refundShipping: boolean
  notifyCustomer: boolean
  internalNote?: string
}

export interface RefundItem {
  orderItemId: string
  quantity: number
  amount?: number // Si no se especifica, se calcula automáticamente
}

export interface OrderAnalytics {
  period: 'today' | '7days' | '30days' | '90days' | '1year'
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate?: number
  topProducts: OrderProductAnalytics[]
  revenueByDay: RevenueByDay[]
  ordersByStatus: Record<OrderStatus, number>
  customerAcquisition: {
    new: number
    returning: number
  }
}

export interface OrderProductAnalytics {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
  averagePrice: number
}

export interface RevenueByDay {
  date: string
  orders: number
  revenue: number
}

// Estados para el manejo de órdenes en la UI
export interface OrderState {
  selectedOrders: string[]
  isLoading: boolean
  error: string | null
  currentOrder: Order | null
  orderAnalytics: OrderAnalytics | null
}
