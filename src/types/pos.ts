import type { User } from './index'
import type { Order, OrderPayment } from './orders'

export type PosSessionStatus = 'open' | 'closed' | 'auditing'

export interface PosSession {
  id: string
  storeId: string
  registerId: string // ID de la caja/registradora (ej: "CAJA-1", "CAJA-2")
  registerName?: string // Nombre descriptivo (ej: "Caja Principal", "Caja Express")
  userId: string
  user?: User
  status: PosSessionStatus
  
  // Balances
  openingBalance: number // Fondo de caja inicial
  closingBalance?: number // Dinero contado al cierre
  expectedBalance?: number // Dinero que debería haber (opening + ventas efectivo - retiros)
  discrepancy?: number // Diferencia (closing - expected)
  
  // Totales por método de pago
  totalCash: number
  totalCard: number
  totalTransfer: number
  totalOther: number
  
  // Conteo de billetes (opcional para cierre)
  cashCount?: Record<string, number> // Denominación -> Cantidad
  
  // Notas
  openingNotes?: string
  closingNotes?: string
  
  // Fechas
  openedAt: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PosTransaction {
  id: string
  sessionId: string
  storeId: string
  orderId?: string // Si es una venta
  invoiceId?: string // Si generó factura
  
  type: 'sale' | 'refund' | 'deposit' | 'withdrawal' // Venta, Devolución, Ingreso manual, Retiro manual
  amount: number
  currency: string
  
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other'
  
  // Detalles
  description?: string
  reference?: string // Para depósitos/retiros
  
  performedBy: string // UserId
  createdAt: Date
}

export interface PosCartItem {
  productId: string
  variantId: string
  name: string
  sku: string
  price: number
  originalPrice: number // Precio base sin descuento
  quantity: number
  image?: string
  
  // Descuentos
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
  
  // Impuestos
  tax?: number
  taxRate?: number
  
  // Totales de línea
  subtotal: number // (price * quantity)
  total: number // subtotal + tax
}

export interface PosState {
  cart: PosCartItem[]
  customer?: {
    id: string
    name: string
    email?: string
    taxId?: string // RNC/Cédula
  }
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
}

