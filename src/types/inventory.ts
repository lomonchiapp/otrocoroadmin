// Inventory Status Types
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'

// Location Types
export type LocationType = 'warehouse' | 'store' | 'display' | 'return' | 'damaged'

// Stock Movement Types
export type StockMovementType = 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'damage'

// Inventory Location Interface
export interface InventoryLocation {
  id: string
  name: string
  type: LocationType
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Stock Item Interface
export interface StockItem {
  id: string
  productId: string
  variationId?: string
  locationId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  status: InventoryStatus
  lastCountedAt?: Date
  lastCountedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Stock Movement Interface
export interface StockMovement {
  id: string
  productId: string
  variationId?: string
  locationId: string
  type: StockMovementType
  quantity: number
  reason: string
  reference?: string
  performedBy: string
  notes?: string
  createdAt: Date
}

// Stock Adjustment Interface
export interface StockAdjustment {
  id: string
  productId: string
  variationId?: string
  locationId: string
  adjustmentType: 'count' | 'adjustment' | 'write_off'
  quantityBefore: number
  quantityAfter: number
  difference: number
  reason: string
  performedBy: string
  notes?: string
  createdAt: Date
}

// Stock Transfer Interface
export interface StockTransfer {
  id: string
  fromLocationId: string
  toLocationId: string
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  requestedBy: string
  approvedBy?: string
  shippedBy?: string
  receivedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  items: StockTransferItem[]
}

// Stock Transfer Item Interface
export interface StockTransferItem {
  id: string
  transferId: string
  productId: string
  variationId?: string
  quantity: number
  quantityShipped?: number
  quantityReceived?: number
  notes?: string
}

// Low Stock Alert Interface
export interface LowStockAlert {
  id: string
  productId: string
  variationId?: string
  locationId: string
  currentQuantity: number
  threshold: number
  isActive: boolean
  createdAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
}

// Inventory Report Interface
export interface InventoryReport {
  id: string
  type: 'summary' | 'detailed' | 'movement' | 'valuation'
  locationId?: string
  productId?: string
  dateFrom: Date
  dateTo: Date
  generatedBy: string
  generatedAt: Date
  data: unknown
}

// Inventory Filters Interface
export interface InventoryFilters {
  search?: string
  status?: InventoryStatus[]
  locationType?: LocationType[]
  locationId?: string
  productId?: string
  lowStock?: boolean
  dateFrom?: Date
  dateTo?: Date
}

// Inventory Search Parameters
export interface InventorySearchParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: InventoryFilters
}

// Paginated Inventory Response
export interface PaginatedInventoryResponse {
  items: StockItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Bulk Inventory Operations
export interface BulkInventoryOperation {
  type: 'adjustment' | 'transfer' | 'status_change'
  items: {
    productId: string
    variationId?: string
    locationId: string
    quantity?: number
    status?: InventoryStatus
  }[]
  reason: string
  performedBy: string
  notes?: string
}

// Bulk Operation Error
export interface BulkInventoryError {
  itemId: string
  error: string
  details?: string
}

// Inventory Valuation
export interface InventoryValuation {
  locationId: string
  totalValue: number
  totalQuantity: number
  averageValue: number
  items: {
    productId: string
    variationId?: string
    quantity: number
    unitValue: number
    totalValue: number
  }[]
  calculatedAt: Date
}

// Inventory Constants
export const INVENTORY_CONSTANTS = {
  // Status Options
  STATUS_OPTIONS: [
    { value: 'in_stock', label: 'En Stock', color: 'green' },
    { value: 'low_stock', label: 'Stock Bajo', color: 'yellow' },
    { value: 'out_of_stock', label: 'Sin Stock', color: 'red' },
    { value: 'discontinued', label: 'Descontinuado', color: 'gray' }
  ] as const,

  // Location Types
  LOCATION_TYPES: [
    { value: 'warehouse', label: 'Almacén', icon: 'warehouse' },
    { value: 'store', label: 'Tienda', icon: 'store' },
    { value: 'display', label: 'Exhibición', icon: 'display' },
    { value: 'return', label: 'Devolución', icon: 'return' },
    { value: 'damaged', label: 'Dañado', icon: 'damaged' }
  ] as const,

  // Movement Types
  MOVEMENT_TYPES: [
    { value: 'in', label: 'Entrada', icon: 'arrow-down', color: 'green' },
    { value: 'out', label: 'Salida', icon: 'arrow-up', color: 'red' },
    { value: 'adjustment', label: 'Ajuste', icon: 'edit', color: 'blue' },
    { value: 'transfer', label: 'Transferencia', icon: 'move', color: 'purple' },
    { value: 'return', label: 'Devolución', icon: 'undo', color: 'orange' },
    { value: 'damage', label: 'Daño', icon: 'x', color: 'red' }
  ] as const,

  // Transfer Status
  TRANSFER_STATUS: [
    { value: 'pending', label: 'Pendiente', color: 'yellow' },
    { value: 'in_transit', label: 'En Tránsito', color: 'blue' },
    { value: 'completed', label: 'Completado', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' }
  ] as const,

  // Report Types
  REPORT_TYPES: [
    { value: 'summary', label: 'Resumen General' },
    { value: 'detailed', label: 'Detallado por Producto' },
    { value: 'movement', label: 'Movimientos' },
    { value: 'valuation', label: 'Valuación' }
  ] as const,

  // Default Values
  DEFAULT_LOW_STOCK_THRESHOLD: 10,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Validation Rules
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 999999,
  MIN_THRESHOLD: 0,
  MAX_THRESHOLD: 999999,

  // Date Ranges
  DATE_RANGES: [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last_7_days', label: 'Últimos 7 días' },
    { value: 'last_30_days', label: 'Últimos 30 días' },
    { value: 'last_90_days', label: 'Últimos 90 días' },
    { value: 'this_month', label: 'Este mes' },
    { value: 'last_month', label: 'Mes pasado' },
    { value: 'this_year', label: 'Este año' },
    { value: 'last_year', label: 'Año pasado' },
    { value: 'custom', label: 'Personalizado' }
  ] as const,

  // Sort Options
  SORT_OPTIONS: [
    { value: 'product_name', label: 'Nombre del Producto' },
    { value: 'quantity', label: 'Cantidad' },
    { value: 'status', label: 'Estado' },
    { value: 'location', label: 'Ubicación' },
    { value: 'last_counted', label: 'Último Conteo' },
    { value: 'created_at', label: 'Fecha de Creación' },
    { value: 'updated_at', label: 'Última Actualización' }
  ] as const
} as const

// Helper Functions
export const getStatusColor = (status: InventoryStatus): string => {
  const statusOption = INVENTORY_CONSTANTS.STATUS_OPTIONS.find(opt => opt.value === status)
  return statusOption?.color || 'gray'
}

export const getStatusLabel = (status: InventoryStatus): string => {
  const statusOption = INVENTORY_CONSTANTS.STATUS_OPTIONS.find(opt => opt.value === status)
  return statusOption?.label || status
}

export const getLocationTypeLabel = (type: LocationType): string => {
  const locationOption = INVENTORY_CONSTANTS.LOCATION_TYPES.find(opt => opt.value === type)
  return locationOption?.label || type
}

export const getMovementTypeLabel = (type: StockMovementType): string => {
  const movementOption = INVENTORY_CONSTANTS.MOVEMENT_TYPES.find(opt => opt.value === type)
  return movementOption?.label || type
}

export const getTransferStatusLabel = (status: string): string => {
  const statusOption = INVENTORY_CONSTANTS.TRANSFER_STATUS.find(opt => opt.value === status)
  return statusOption?.label || status
}

export const isLowStock = (quantity: number, threshold?: number): boolean => {
  const actualThreshold = threshold || INVENTORY_CONSTANTS.DEFAULT_LOW_STOCK_THRESHOLD
  return quantity <= actualThreshold
}

export const calculateAvailableQuantity = (quantity: number, reservedQuantity: number): number => {
  return Math.max(0, quantity - reservedQuantity)
}

export const formatInventoryValue = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(value)
}

export const formatQuantity = (quantity: number): string => {
  return new Intl.NumberFormat('es-ES').format(quantity)
}

