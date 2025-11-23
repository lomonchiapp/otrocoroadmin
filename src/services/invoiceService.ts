// Servicio para gestión de facturas con soporte multi-moneda
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit as firestoreLimit,
  onSnapshot,
  orderBy as firestoreOrderBy,
  query,
  type QuerySnapshot,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import orderService from './orderService'
import type { Order } from '@/types'
import type {
  Invoice,
  InvoiceSearchParams,
  PaginatedInvoiceResponse,
  UpdateInvoiceRequest,
  RecordPaymentRequest,
  InvoiceAnalytics,
  InvoiceStatus,
  Currency,
  CreateInvoiceFromOrderRequest,
  InvoiceNumberingConfig,
  ExchangeRate,
  InvoiceCalculation,
  DOMINICAN_TAX_CONFIG,
} from '@/types/invoices'

class InvoiceService {
  // Configuración de impuestos (República Dominicana)
  private readonly TAX_RATE = 0.18 // ITBIS 18%
  
  // ============= GESTIÓN DE FACTURAS =============

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const cleanData = this.cleanObject(invoiceData)

      const now = new Date()
      const data = {
        ...cleanData,
        pdfGenerated: false,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(collection(db, 'invoices'), data)
      return docRef.id
    } catch (error) {
      this.handleError('creating invoice', error)
    }
  }

  async createInvoiceFromOrder(request: CreateInvoiceFromOrderRequest, storeId: string, userId: string): Promise<string> {
    try {
      const order = await orderService.getOrder(request.orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      // Generar número de factura
      const invoiceNumber = await this.generateInvoiceNumber(storeId)

      // Convertir items de orden a items de factura
      const invoiceItems = order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productSnapshot.name,
        description: item.productSnapshot.description,
        sku: item.variantSnapshot.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        subtotal: item.totalPrice,
        tax: item.totalPrice * this.TAX_RATE,
        taxRate: this.TAX_RATE,
        total: item.totalPrice * (1 + this.TAX_RATE),
      }))

      // Aplicar descuento si se especifica
      let discountAmount = 0
      if (request.applyDiscount) {
        if (request.applyDiscount.amount) {
          discountAmount = request.applyDiscount.amount
        } else if (request.applyDiscount.percentage) {
          discountAmount = order.subtotal * (request.applyDiscount.percentage / 100)
        }
      }

      // Calcular totales
      const subtotal = order.subtotal - discountAmount
      const tax = subtotal * this.TAX_RATE
      const total = subtotal + tax + order.shippingAmount

      const invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        invoiceNumber,
        storeId,
        orderId: order.id,
        status: 'issued',
        customer: {
          id: order.customer.id,
          type: 'individual',
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email,
          phone: order.customer.phone,
          address: {
            street: order.shippingAddress.address1,
            city: order.shippingAddress.city,
            province: order.shippingAddress.state,
            country: order.shippingAddress.country,
            countryCode: order.shippingAddress.countryCode,
            postalCode: order.shippingAddress.postalCode,
          },
        },
        items: request.customItems || invoiceItems,
        currency: (order.currency as Currency) || 'DOP',
        subtotal,
        discount: discountAmount,
        tax,
        taxRate: this.TAX_RATE,
        shippingCost: order.shippingAmount,
        total,
        paidAmount: 0,
        balance: total,
        issueDate: new Date(),
        dueDate: request.dueDate,
        paymentTerms: request.paymentTerms,
        notes: request.notes,
        termsAndConditions: 'Pago dentro de 30 días. Intereses moratorios del 2% mensual después del vencimiento.',
        pdfGenerated: false,
        createdBy: userId,
        updatedBy: userId,
      }

      return await this.createInvoice(invoice)
    } catch (error) {
      this.handleError('creating invoice from order', error)
    }
  }

  async updateInvoice(invoiceId: string, updates: UpdateInvoiceRequest): Promise<void> {
    try {
      const cleanUpdates = this.cleanObject(updates)
      cleanUpdates.updatedAt = new Date()

      const docRef = doc(db, 'invoices', invoiceId)
      await updateDoc(docRef, cleanUpdates)
    } catch (error) {
      this.handleError('updating invoice', error)
    }
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      const docRef = doc(db, 'invoices', invoiceId)
      await deleteDoc(docRef)
    } catch (error) {
      this.handleError('deleting invoice', error)
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    try {
      const docRef = doc(db, 'invoices', invoiceId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data() as Omit<Invoice, 'id'>
      return { ...data, id: docSnap.id }
    } catch (error) {
      this.handleError('getting invoice', error)
    }
  }

  // Suscripción en tiempo real a facturas
  subscribe(
    constraints: unknown[] = [],
    onNext: (items: Invoice[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = query(collection(db, 'invoices'), ...(constraints as any[]))

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const items = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<Invoice, 'id'>
          return {
            ...data,
            id: docSnapshot.id,
          }
        }) as Invoice[]
        onNext(items)
      },
      (error) => {
        onError?.(error)
      },
    )

    return unsubscribe
  }

  async getInvoicesByStore(storeId: string): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('storeId', '==', storeId),
        firestoreOrderBy('issueDate', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Invoice, 'id'>
        return {
          ...data,
          id: docSnapshot.id,
        }
      })
    } catch (error) {
      this.handleError('getting invoices by store', error)
    }
  }

  // ============= PAGOS =============

  async recordPayment(request: RecordPaymentRequest, userId: string): Promise<void> {
    try {
      const invoice = await this.getInvoice(request.invoiceId)
      if (!invoice) {
        throw new Error('Invoice not found')
      }

      const newPaidAmount = invoice.paidAmount + request.amount
      const newBalance = invoice.total - newPaidAmount

      let newStatus: InvoiceStatus = invoice.status
      if (newBalance <= 0) {
        newStatus = 'paid'
      } else if (newPaidAmount > 0 && newBalance > 0) {
        newStatus = 'partially_paid'
      }

      // Actualizar factura
      await updateDoc(doc(db, 'invoices', request.invoiceId), {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        paidDate: newBalance <= 0 ? request.paymentDate : null,
        paymentMethod: request.paymentMethod,
        updatedAt: new Date(),
        updatedBy: userId,
      })

      // Registrar el pago en colección separada
      await addDoc(collection(db, 'invoice_payments'), {
        invoiceId: request.invoiceId,
        amount: request.amount,
        currency: invoice.currency,
        paymentMethod: request.paymentMethod,
        paymentDate: request.paymentDate,
        reference: request.reference,
        notes: request.notes,
        createdAt: new Date(),
        createdBy: userId,
      })
    } catch (error) {
      this.handleError('recording payment', error)
    }
  }

  // ============= NUMERACIÓN =============

  async generateInvoiceNumber(storeId: string): Promise<string> {
    try {
      const configRef = doc(db, 'invoice_configs', storeId)
      const configSnap = await getDoc(configRef)

      let config: InvoiceNumberingConfig
      const currentYear = new Date().getFullYear()

      if (!configSnap.exists()) {
        // Crear configuración por defecto
        config = {
          prefix: 'INV',
          digits: 4,
          separator: '-',
          yearFormat: 'YYYY',
          resetYearly: true,
          currentSequence: 1,
          lastYear: currentYear,
        }
        await addDoc(collection(db, 'invoice_configs'), { ...config, storeId })
      } else {
        config = configSnap.data() as InvoiceNumberingConfig
        
        // Resetear si es nuevo año y está configurado para resetear
        if (config.resetYearly && config.lastYear !== currentYear) {
          config.currentSequence = 1
          config.lastYear = currentYear
        }
      }

      // Generar número
      const sequence = config.currentSequence.toString().padStart(config.digits, '0')
      const year = config.yearFormat === 'YY' ? currentYear.toString().slice(-2) : currentYear.toString()
      const invoiceNumber = `${config.prefix}${config.separator}${year}${config.separator}${sequence}`

      // Incrementar secuencia
      await updateDoc(configRef, {
        currentSequence: increment(1),
        lastYear: currentYear,
      })

      return invoiceNumber
    } catch (error) {
      this.handleError('generating invoice number', error)
    }
  }

  // ============= CONVERSIÓN DE MONEDA =============

  async convertCurrency(amount: number, from: Currency, to: Currency): Promise<number> {
    if (from === to) return amount

    try {
      // Obtener tasa de cambio más reciente
      const q = query(
        collection(db, 'exchange_rates'),
        where('fromCurrency', '==', from),
        where('toCurrency', '==', to),
        firestoreOrderBy('date', 'desc'),
        firestoreLimit(1)
      )

      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        // Tasa por defecto (aproximada)
        const defaultRate = from === 'USD' && to === 'DOP' ? 58.5 : 1 / 58.5
        return amount * defaultRate
      }

      const rate = querySnapshot.docs[0].data().rate
      return amount * rate
    } catch (error) {
      this.handleError('converting currency', error)
    }
  }

  async getLatestExchangeRate(from: Currency, to: Currency): Promise<number> {
    try {
      const q = query(
        collection(db, 'exchange_rates'),
        where('fromCurrency', '==', from),
        where('toCurrency', '==', to),
        firestoreOrderBy('date', 'desc'),
        firestoreLimit(1)
      )

      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        // Tasa por defecto DOP/USD ≈ 58.5 (puede variar)
        return from === 'USD' && to === 'DOP' ? 58.5 : 1 / 58.5
      }

      return querySnapshot.docs[0].data().rate
    } catch (error) {
      this.handleError('getting exchange rate', error)
    }
  }

  // ============= CÁLCULOS =============

  calculateInvoice(items: Invoice['items'], currency: Currency, shippingCost: number = 0): InvoiceCalculation {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const discount = items.reduce((sum, item) => sum + item.discount, 0)
    const taxableAmount = subtotal - discount
    const tax = taxableAmount * this.TAX_RATE
    const total = taxableAmount + tax + shippingCost

    return {
      subtotal,
      discount,
      taxableAmount,
      tax,
      shipping: shippingCost,
      total,
      currency,
    }
  }

  // ============= ANALÍTICAS =============

  async getInvoiceAnalytics(storeId: string, period: string = '30days'): Promise<InvoiceAnalytics> {
    try {
      const now = new Date()
      let startDate = new Date()

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case '7days':
          startDate.setDate(now.getDate() - 7)
          break
        case '30days':
          startDate.setDate(now.getDate() - 30)
          break
        case '90days':
          startDate.setDate(now.getDate() - 90)
          break
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      const q = query(
        collection(db, 'invoices'),
        where('storeId', '==', storeId),
        where('issueDate', '>=', startDate),
        firestoreOrderBy('issueDate', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const invoices = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Invoice, 'id'>
        return { ...data, id: docSnapshot.id }
      })

      // Implementar el resto de las analíticas...
      // (similar a orderService pero para facturas)

      return {
        period: period as InvoiceAnalytics['period'],
        totalInvoices: invoices.length,
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
        totalOutstanding: invoices.reduce((sum, inv) => sum + inv.balance, 0),
        averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
        revenueByurrency: {
          DOP: invoices.filter(inv => inv.currency === 'DOP').reduce((sum, inv) => sum + inv.total, 0),
          USD: invoices.filter(inv => inv.currency === 'USD').reduce((sum, inv) => sum + inv.total, 0),
        },
        invoicesByStatus: {} as Record<InvoiceStatus, number>,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        unpaidInvoices: invoices.filter(inv => inv.status === 'issued').length,
        overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
        partiallyPaidInvoices: invoices.filter(inv => inv.status === 'partially_paid').length,
        topCustomers: [],
        revenueByDay: [],
        averageDaysToPayment: 0,
        collectionRate: 0,
      }
    } catch (error) {
      this.handleError('getting invoice analytics', error)
    }
  }

  // ============= UTILIDADES PRIVADAS =============

  private cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key as keyof T] = value as T[keyof T]
      }
    }
    return cleaned
  }

  private handleError(operation: string, error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Error ${operation}: ${errorMessage}`)
  }
}

export const invoiceService = new InvoiceService()
export default invoiceService
















