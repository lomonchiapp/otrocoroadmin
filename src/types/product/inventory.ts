/**
 * Tipos relacionados con inventario de productos
 */

export type InventoryPolicy = 'deny' | 'continue' | 'notify'

/**
 * Estado del inventario
 */
export interface InventoryStatus {
  available: number // Stock disponible para venta
  reserved: number // Reservado en órdenes pendientes
  incoming: number // En camino (órdenes de compra)
  damaged: number // Dañado/no vendible
  total: number // Total en inventario físico
}

/**
 * Configuración de inventario
 */
export interface InventoryConfig {
  // Política cuando no hay stock
  policy: InventoryPolicy
  
  // Rastreo de inventario
  trackQuantity: boolean
  
  // Stock infinito
  hasInfiniteStock: boolean
  
  // Alertas
  lowStockThreshold?: number
  lowStockAlert: boolean
  
  // Reservas
  allowBackorders: boolean
  reserveOnCheckout: boolean
  
  // Ubicación
  warehouseLocation?: string
  binLocation?: string
}

/**
 * Movimiento de inventario
 */
export interface InventoryMovement {
  id: string
  productId: string
  variationId?: string
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage' | 'transfer'
  quantity: number // Positivo = entrada, Negativo = salida
  reason?: string
  reference?: string // ID de orden, transferencia, etc.
  performedBy: string
  performedAt: Date
  notes?: string
}

/**
 * Transferencia de inventario entre ubicaciones
 */
export interface InventoryTransfer {
  id: string
  fromLocation: string
  toLocation: string
  items: {
    productId: string
    variationId?: string
    quantity: number
  }[]
  status: 'pending' | 'in_transit' | 'received' | 'cancelled'
  initiatedBy: string
  initiatedAt: Date
  receivedBy?: string
  receivedAt?: Date
  notes?: string
}

/**
 * Ajuste de inventario
 */
export interface InventoryAdjustment {
  id: string
  productId: string
  variationId?: string
  quantityBefore: number
  quantityAfter: number
  adjustment: number
  reason: 'count' | 'damage' | 'lost' | 'found' | 'correction' | 'other'
  notes?: string
  performedBy: string
  performedAt: Date
}





