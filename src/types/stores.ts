// Tipos para el manejo de múltiples stores en Otro Coro Admin

export type StoreType = 'fashion' | 'jewelry'

export interface Store {
  id: string
  name: string
  type: StoreType
  slug: string
  description: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  isActive: boolean
  settings: StoreSettings
  createdAt: Date
  updatedAt: Date
}

export interface StoreSettings {
  allowBackorders: boolean
  trackInventory: boolean
  defaultTaxRate: number
  shippingZones: ShippingZone[]
  shippingAgencies: ShippingAgencyConfig[]
  paymentMethods: PaymentMethod[]
  notifications: NotificationSettings
}

// ✅ Configuración de agencias de envío adaptada para República Dominicana
export interface ShippingAgencyConfig {
  id: string
  name: string
  code: string // 'caribe_tours', 'metro', etc.
  supportsHomeDelivery: boolean // Si soporta puerta a puerta
  supportsPickup: boolean // Si soporta recoger en agencia
  isActive: boolean
  branches: ShippingAgencyBranch[]
  defaultPrice: number // Precio por defecto
  createdAt: Date
  updatedAt: Date
}

export interface ShippingAgencyBranch {
  id: string
  name: string
  city: string
  address: string
  phone?: string
  isActive: boolean
}

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  states?: string[]
  shippingMethods: ShippingMethod[]
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
  isActive: boolean
}

export interface PaymentMethod {
  id: string
  name: string
  provider: 'stripe' | 'paypal' | 'mercadopago' | 'bank_transfer'
  isActive: boolean
  settings: Record<string, unknown>
}

export interface NotificationSettings {
  emailOnNewOrder: boolean
  emailOnLowStock: boolean
  emailOnOutOfStock: boolean
  smsNotifications: boolean
  webhookUrl?: string
}

// Estados globales para el admin
export interface AdminState {
  currentStore: Store | null
  availableStores: Store[]
  user: AdminUser | null
  permissions: Permission[]
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: AdminRole
  storeAccess: StoreAccess[]
  isActive: boolean
  lastLoginAt: Date
  createdAt: Date
}

export type AdminRole = 'super_admin' | 'store_admin' | 'store_manager' | 'inventory_manager' | 'customer_support'

export interface StoreAccess {
  storeId: string
  role: AdminRole
  permissions: Permission[]
}

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface DashboardMetrics {
  storeId: string
  period: 'today' | '7days' | '30days' | '90days' | '1year'
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  conversionRate: number
  averageOrderValue: number
  topSellingProducts: ProductMetric[]
  recentOrders: OrderSummary[]
  lowStockProducts: ProductStockAlert[]
}

export interface ProductMetric {
  productId: string
  name: string
  image?: string
  quantitySold: number
  revenue: number
}

export interface OrderSummary {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: OrderStatus
  createdAt: Date
}

export interface ProductStockAlert {
  productId: string
  name: string
  currentStock: number
  minimumStock: number
  variantDetails?: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
