// Tipos para sistema de facturas con soporte multi-moneda (DOP y USD)

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe'
export type Currency = 'DOP' | 'USD'

export interface Invoice {
  id: string
  invoiceNumber: string // Ej: "INV-2024-0001"
  storeId: string
  orderId?: string // Opcional, puede haber facturas sin orden
  
  // Estado
  status: InvoiceStatus
  
  // Información del cliente
  customer: InvoiceCustomer
  
  // Items
  items: InvoiceItem[]
  
  // Montos y moneda
  currency: Currency
  subtotal: number
  discount: number
  discountPercentage?: number
  tax: number // ITBIS 18% en RD
  taxRate: number // Ej: 0.18
  shippingCost: number
  total: number
  
  // Información de pago
  paymentMethod?: PaymentMethod
  paymentTerms?: string // Ej: "Net 30"
  paidAmount: number
  balance: number // total - paidAmount
  
  // Fechas
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  
  // Archivos y documentos
  pdfUrl?: string
  pdfGenerated: boolean
  
  // Notas
  notes?: string
  termsAndConditions?: string
  
  // Referencias
  referenceNumber?: string // Número de referencia externo
  purchaseOrderNumber?: string
  
  // Tipo de cambio (para facturas en USD)
  exchangeRate?: number // Tasa DOP/USD al momento de la factura
  equivalentInDOP?: number // Monto equivalente en pesos dominicanos
  
  // Auditoría
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  cancelledAt?: Date
  cancelReason?: string
}

export interface InvoiceCustomer {
  id?: string
  type: 'individual' | 'business'
  
  // Información personal
  firstName?: string
  lastName?: string
  businessName?: string // Para empresas
  
  // Contacto
  email: string
  phone?: string
  
  // Documentos fiscales (República Dominicana)
  rnc?: string // RNC para empresas
  cedula?: string // Cédula para personas físicas
  taxId?: string // ID fiscal genérico
  
  // Dirección
  address: InvoiceAddress
}

export interface InvoiceAddress {
  street: string
  streetNumber?: string
  apartment?: string
  sector?: string // Sector en RD
  city: string
  province: string // Provincia en RD
  postalCode?: string
  country: string
  countryCode: string
}

export interface InvoiceItem {
  id: string
  productId?: string
  productName: string
  description?: string
  sku?: string
  
  // Cantidad y precios
  quantity: number
  unitPrice: number
  discount: number
  discountPercentage?: number
  subtotal: number // (quantity * unitPrice) - discount
  tax: number
  taxRate: number
  total: number // subtotal + tax
  
  // Información adicional
  unit?: string // Ej: "unidad", "kg", "metro"
  notes?: string
}

export interface InvoicePayment {
  id: string
  invoiceId: string
  amount: number
  currency: Currency
  paymentMethod: PaymentMethod
  paymentDate: Date
  reference?: string
  notes?: string
  createdAt: Date
  createdBy: string
}

// Parámetros de búsqueda de facturas
export interface InvoiceFilters {
  storeIds?: string[]
  status?: InvoiceStatus[]
  customerIds?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  currency?: Currency[]
  paymentMethods?: PaymentMethod[]
  isPaid?: boolean
  isOverdue?: boolean
}

export interface InvoiceSearchParams {
  query?: string // Buscar por número, email, nombre, RNC
  filters?: InvoiceFilters
  sortBy?: 'invoice_number' | 'issue_date' | 'due_date' | 'total' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedInvoiceResponse {
  data: Invoice[]
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
    totalOutstanding: number
    averageInvoiceValue: number
    statusCounts: Record<InvoiceStatus, number>
    currencySummary: {
      DOP: { total: number; count: number }
      USD: { total: number; count: number }
    }
  }
}

// Configuración de numeración de facturas
export interface InvoiceNumberingConfig {
  prefix: string // Ej: "INV"
  suffix?: string
  digits: number // Ej: 4 para "0001"
  separator: string // Ej: "-"
  yearFormat?: 'YYYY' | 'YY'
  resetYearly: boolean
  currentSequence: number
  lastYear?: number
}

// Plantilla de factura
export interface InvoiceTemplate {
  id: string
  name: string
  storeId: string
  isDefault: boolean
  
  // Diseño
  layout: 'standard' | 'compact' | 'detailed'
  colorScheme: {
    primary: string
    secondary: string
    text: string
  }
  
  // Logo e información de la empresa
  showLogo: boolean
  logoUrl?: string
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    rnc?: string
  }
  
  // Contenido
  headerText?: string
  footerText?: string
  termsAndConditions?: string
  paymentInstructions?: string
  
  // Opciones
  showItemImages: boolean
  showTaxBreakdown: boolean
  showPaymentQRCode: boolean
  
  createdAt: Date
  updatedAt: Date
}

// Analíticas de facturas
export interface InvoiceAnalytics {
  period: 'today' | '7days' | '30days' | '90days' | '1year'
  
  // General
  totalInvoices: number
  totalRevenue: number
  totalOutstanding: number
  averageInvoiceValue: number
  
  // Por moneda
  revenueByurrency: {
    DOP: number
    USD: number
  }
  
  // Por estado
  invoicesByStatus: Record<InvoiceStatus, number>
  
  // Pagos
  paidInvoices: number
  unpaidInvoices: number
  overdueInvoices: number
  partiallyPaidInvoices: number
  
  // Clientes
  topCustomers: {
    customerId: string
    customerName: string
    totalInvoices: number
    totalRevenue: number
    currency: Currency
  }[]
  
  // Timeline
  revenueByDay: {
    date: string
    invoices: number
    revenue: number
    currency: Currency
  }[]
  
  // Métricas de cobro
  averageDaysToPayment: number
  collectionRate: number // % de facturas pagadas a tiempo
}

// Request para crear factura desde orden
export interface CreateInvoiceFromOrderRequest {
  orderId: string
  dueDate: Date
  paymentTerms?: string
  notes?: string
  applyDiscount?: {
    amount?: number
    percentage?: number
  }
  customItems?: InvoiceItem[]
}

// Request para actualizar factura
export interface UpdateInvoiceRequest {
  status?: InvoiceStatus
  dueDate?: Date
  notes?: string
  paymentMethod?: PaymentMethod
  termsAndConditions?: string
}

// Request para registrar pago
export interface RecordPaymentRequest {
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: Date
  reference?: string
  notes?: string
}

// Configuración de impuestos por país
export interface TaxConfiguration {
  country: string
  countryCode: string
  defaultTaxRate: number
  taxName: string // Ej: "ITBIS", "IVA", "VAT"
  taxIdLabel: string // Ej: "RNC", "NIT", "VAT Number"
  taxRates: {
    standard: number
    reduced?: number
    zero?: number
  }
}

// Configuración de República Dominicana
export const DOMINICAN_TAX_CONFIG: TaxConfiguration = {
  country: 'República Dominicana',
  countryCode: 'DO',
  defaultTaxRate: 0.18, // ITBIS 18%
  taxName: 'ITBIS',
  taxIdLabel: 'RNC',
  taxRates: {
    standard: 0.18,
    reduced: 0.16, // Para algunos productos
    zero: 0, // Exentos
  },
}

// Tipos de cambio
export interface ExchangeRate {
  id: string
  fromCurrency: Currency
  toCurrency: Currency
  rate: number
  date: Date
  source: string // Ej: "Banco Central", "Manual"
  createdAt: Date
}

// Helper types para cálculos
export interface InvoiceCalculation {
  subtotal: number
  discount: number
  taxableAmount: number
  tax: number
  shipping: number
  total: number
  currency: Currency
  exchangeRate?: number
  equivalentInDOP?: number
}
















