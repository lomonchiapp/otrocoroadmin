// Servicio para gestión de órdenes
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
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
import type {
  Order,
  OrderSearchParams,
  PaginatedOrderResponse,
  OrderUpdate,
  RefundRequest,
  OrderAnalytics,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '@/types'

class OrderService {
  // ============= GESTIÓN DE ÓRDENES =============

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const cleanData = this.cleanObject(orderData)

      const now = new Date()
      const data = {
        ...cleanData,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(collection(db, 'orders'), data)
      return docRef.id
    } catch (error) {
      this.handleError('creating order', error)
    }
  }

  async updateOrder(orderId: string, updates: OrderUpdate): Promise<void> {
    try {
      const cleanUpdates = this.cleanObject(updates)
      cleanUpdates.updatedAt = new Date()

      const docRef = doc(db, 'orders', orderId)
      await updateDoc(docRef, cleanUpdates)
    } catch (error) {
      this.handleError('updating order', error)
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId)
      await deleteDoc(docRef)
    } catch (error) {
      this.handleError('deleting order', error)
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, 'orders', orderId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data() as Omit<Order, 'id'>
      return { ...data, id: docSnap.id }
    } catch (error) {
      this.handleError('getting order', error)
    }
  }

  // Suscripción en tiempo real a órdenes
  subscribe(
    constraints: unknown[] = [],
    onNext: (items: Order[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = query(collection(db, 'orders'), ...(constraints as any[]))

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const items = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<Order, 'id'>
          return {
            ...data,
            id: docSnapshot.id,
          }
        }) as Order[]
        onNext(items)
      },
      (error) => {
        onError?.(error)
      },
    )

    return unsubscribe
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('storeId', '==', storeId),
        firestoreOrderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Order, 'id'>
        return {
          ...data,
          id: docSnapshot.id,
        }
      })
    } catch (error) {
      this.handleError('getting orders by store', error)
    }
  }

  async searchOrders(params: OrderSearchParams): Promise<PaginatedOrderResponse> {
    try {
      const constraints: unknown[] = [collection(db, 'orders')]

      // Filtro por storeId (requerido)
      if (params.filters?.storeIds?.length) {
        if (params.filters.storeIds.length === 1) {
          constraints.push(where('storeId', '==', params.filters.storeIds[0]))
        } else {
          constraints.push(where('storeId', 'in', params.filters.storeIds.slice(0, 10)))
        }
      }

      // Filtro por estado de orden
      if (params.filters?.status?.length) {
        if (params.filters.status.length === 1) {
          constraints.push(where('status', '==', params.filters.status[0]))
        } else {
          constraints.push(where('status', 'in', params.filters.status.slice(0, 10)))
        }
      }

      // Filtro por estado de pago
      if (params.filters?.paymentStatus?.length) {
        if (params.filters.paymentStatus.length === 1) {
          constraints.push(where('paymentStatus', '==', params.filters.paymentStatus[0]))
        } else {
          constraints.push(where('paymentStatus', 'in', params.filters.paymentStatus.slice(0, 10)))
        }
      }

      // Filtro por estado de envío
      if (params.filters?.fulfillmentStatus?.length) {
        if (params.filters.fulfillmentStatus.length === 1) {
          constraints.push(where('fulfillmentStatus', '==', params.filters.fulfillmentStatus[0]))
        } else {
          constraints.push(where('fulfillmentStatus', 'in', params.filters.fulfillmentStatus.slice(0, 10)))
        }
      }

      // Ordenamiento
      const sortBy = params.sortBy || 'created_at'
      const sortOrder = params.sortOrder || 'desc'
      
      // Mapear sortBy a campos de Firebase
      const sortField = sortBy === 'created_at' ? 'createdAt' :
                       sortBy === 'updated_at' ? 'updatedAt' :
                       sortBy === 'total_amount' ? 'totalAmount' :
                       sortBy === 'order_number' ? 'orderNumber' : 'createdAt'
      
      constraints.push(firestoreOrderBy(sortField, sortOrder))

      // Paginación
      const page = Math.max(params.page || 1, 1)
      const limit = Math.min(Math.max(params.limit || 20, 1), 100)
      constraints.push(firestoreLimit(limit))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q = query(...(constraints as any[]))
      const querySnapshot = await getDocs(q)
      
      let orders = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Order, 'id'>
        return {
          ...data,
          id: docSnapshot.id,
        }
      })

      // Filtros adicionales (client-side)
      if (params.query) {
        const searchTerm = params.query.toLowerCase()
        orders = orders.filter(order =>
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.customer.email.toLowerCase().includes(searchTerm) ||
          `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm)
        )
      }

      if (params.filters?.dateRange) {
        const { start, end } = params.filters.dateRange
        orders = orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= start && orderDate <= end
        })
      }

      if (params.filters?.amountRange) {
        const { min, max } = params.filters.amountRange
        orders = orders.filter(order =>
          order.totalAmount >= min && order.totalAmount <= max
        )
      }

      // Calcular count total
      const countConstraints: unknown[] = [collection(db, 'orders')]
      if (params.filters?.storeIds?.length) {
        if (params.filters.storeIds.length === 1) {
          countConstraints.push(where('storeId', '==', params.filters.storeIds[0]))
        }
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const countSnapshot = await getCountFromServer(query(...(countConstraints as any[])))
      const total = countSnapshot.data().count

      // Calcular agregaciones
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

      const statusCounts: Record<OrderStatus, number> = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        partially_refunded: 0,
      }

      const paymentStatusCounts: Record<PaymentStatus, number> = {
        pending: 0,
        authorized: 0,
        paid: 0,
        partially_paid: 0,
        failed: 0,
        cancelled: 0,
        refunded: 0,
      }

      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
        paymentStatusCounts[order.paymentStatus] = (paymentStatusCounts[order.paymentStatus] || 0) + 1
      })

      return {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        aggregations: {
          totalRevenue,
          averageOrderValue,
          statusCounts,
          paymentStatusCounts,
        },
      }
    } catch (error) {
      this.handleError('searching orders', error)
    }
  }

  // ============= ACTUALIZACIÓN DE ESTADOS =============

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: new Date(),
      }

      if (notes) {
        updates.internalNotes = notes
      }

      if (status === 'cancelled') {
        updates.cancelledAt = new Date()
      }

      if (status === 'refunded' || status === 'partially_refunded') {
        updates.refundedAt = new Date()
      }

      const docRef = doc(db, 'orders', orderId)
      await updateDoc(docRef, updates)
    } catch (error) {
      this.handleError('updating order status', error)
    }
  }

  async updatePaymentStatus(orderId: string, status: string, notes?: string): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        paymentStatus: status,
        updatedAt: new Date(),
      }

      if (notes) {
        const order = await this.getOrder(orderId)
        updates.internalNotes = order?.internalNotes
          ? `${order.internalNotes}\n\n[${new Date().toISOString()}] Payment: ${notes}`
          : `[${new Date().toISOString()}] Payment: ${notes}`
      }

      const docRef = doc(db, 'orders', orderId)
      await updateDoc(docRef, updates)
    } catch (error) {
      this.handleError('updating payment status', error)
    }
  }

  async updateFulfillmentStatus(orderId: string, status: string, notes?: string): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        fulfillmentStatus: status,
        updatedAt: new Date(),
      }

      if (status === 'delivered') {
        updates.actualDeliveryDate = new Date()
      }

      if (notes) {
        const order = await this.getOrder(orderId)
        updates.internalNotes = order?.internalNotes
          ? `${order.internalNotes}\n\n[${new Date().toISOString()}] Fulfillment: ${notes}`
          : `[${new Date().toISOString()}] Fulfillment: ${notes}`
      }

      const docRef = doc(db, 'orders', orderId)
      await updateDoc(docRef, updates)
    } catch (error) {
      this.handleError('updating fulfillment status', error)
    }
  }

  // ============= REEMBOLSOS =============

  async processRefund(orderId: string, refundData: RefundRequest): Promise<void> {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      // Calcular monto del reembolso
      let refundAmount = 0
      refundData.items.forEach(refundItem => {
        const orderItem = order.items.find(item => item.id === refundItem.orderItemId)
        if (orderItem) {
          const itemRefundAmount = refundItem.amount || (orderItem.unitPrice * refundItem.quantity)
          refundAmount += itemRefundAmount
        }
      })

      if (refundData.refundShipping) {
        refundAmount += order.shippingAmount
      }

      const batch = writeBatch(db)

      // Actualizar orden
      const orderRef = doc(db, 'orders', orderId)
      const isFullRefund = refundAmount >= order.totalAmount
      
      batch.update(orderRef, {
        status: isFullRefund ? 'refunded' : 'partially_refunded',
        refundedAt: new Date(),
        updatedAt: new Date(),
        internalNotes: order.internalNotes
          ? `${order.internalNotes}\n\n[${new Date().toISOString()}] Refund: ${refundData.reason}\nAmount: $${refundAmount}`
          : `[${new Date().toISOString()}] Refund: ${refundData.reason}\nAmount: $${refundAmount}`,
      })

      await batch.commit()

      // TODO: Integrar con pasarela de pago para procesar reembolso real
    } catch (error) {
      this.handleError('processing refund', error)
    }
  }

  // ============= ANALÍTICAS =============

  async getOrderAnalytics(storeId: string, period: string = '30days'): Promise<OrderAnalytics> {
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
        collection(db, 'orders'),
        where('storeId', '==', storeId),
        where('createdAt', '>=', startDate),
        firestoreOrderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const orders = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Order, 'id'>
        return { ...data, id: docSnapshot.id }
      })

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calcular órdenes por estado
      const ordersByStatus: Record<OrderStatus, number> = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        partially_refunded: 0,
      }

      orders.forEach(order => {
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1
      })

      // Productos más vendidos
      const productMap = new Map<string, { name: string; quantity: number; revenue: number; count: number }>()
      orders.forEach(order => {
        order.items.forEach(item => {
          const existing = productMap.get(item.productId)
          if (existing) {
            existing.quantity += item.quantity
            existing.revenue += item.totalPrice
            existing.count += 1
          } else {
            productMap.set(item.productId, {
              name: item.productSnapshot.name,
              quantity: item.quantity,
              revenue: item.totalPrice,
              count: 1,
            })
          }
        })
      })

      const topProducts = Array.from(productMap.entries())
        .map(([productId, data]) => ({
          productId,
          productName: data.name,
          quantitySold: data.quantity,
          revenue: data.revenue,
          averagePrice: data.revenue / data.quantity,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Revenue por día
      const revenueByDayMap = new Map<string, { orders: number; revenue: number }>()
      orders.forEach(order => {
        const dateKey = new Date(order.createdAt).toISOString().split('T')[0]
        const existing = revenueByDayMap.get(dateKey)
        if (existing) {
          existing.orders += 1
          existing.revenue += order.totalAmount
        } else {
          revenueByDayMap.set(dateKey, { orders: 1, revenue: order.totalAmount })
        }
      })

      const revenueByDay = Array.from(revenueByDayMap.entries())
        .map(([date, data]) => ({
          date,
          orders: data.orders,
          revenue: data.revenue,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Clientes nuevos vs recurrentes
      const customerIds = new Set(orders.map(o => o.customerId))
      const newCustomers = orders.filter(o => o.customer.totalOrders === 1).length
      const returningCustomers = orders.length - newCustomers

      return {
        period: period as OrderAnalytics['period'],
        totalOrders,
        totalRevenue,
        averageOrderValue,
        topProducts,
        revenueByDay,
        ordersByStatus,
        customerAcquisition: {
          new: newCustomers,
          returning: returningCustomers,
        },
      }
    } catch (error) {
      this.handleError('getting order analytics', error)
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

export const orderService = new OrderService()
export default orderService
















