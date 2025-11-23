// Servicio para gestión de clientes (usuarios registrados del ecommerce)
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  type QuerySnapshot,
  onSnapshot,
  writeBatch,
  increment,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type {
  Customer,
  CustomerSearchParams,
  PaginatedCustomerResponse,
  CustomerUpdate,
  CustomerAddress,
  CustomerNote,
} from '@/types/customers'

class CustomerService {
  private customersCollection = collection(db, 'customers')

  // ============= GESTIÓN DE CLIENTES =============

  /**
   * Obtener un cliente por ID
   */
  async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const docRef = doc(this.customersCollection, customerId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
          lastSeenAt: docSnap.data().lastSeenAt?.toDate?.(),
          dateOfBirth: docSnap.data().dateOfBirth?.toDate?.(),
          firstOrderDate: docSnap.data().firstOrderDate?.toDate?.(),
          lastOrderDate: docSnap.data().lastOrderDate?.toDate?.(),
        } as Customer
      }

      return null
    } catch (error) {
      this.handleError('fetching customer', error)
      throw error
    }
  }

  /**
   * Obtener clientes con paginación y filtros
   */
  async getCustomers(params: CustomerSearchParams = {}): Promise<PaginatedCustomerResponse> {
    try {
      const {
        query: searchQuery,
        filters,
        sortBy = 'created_at',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = params

      let q = query(
        this.customersCollection,
        orderBy(sortBy === 'created_at' ? 'createdAt' : sortBy, sortOrder),
        firestoreLimit(limit)
      )

      // Aplicar filtros si existen
      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status))
      }

      if (filters?.segment && filters.segment.length > 0) {
        q = query(q, where('segment', 'in', filters.segment))
      }

      if (filters?.emailVerified !== undefined) {
        q = query(q, where('emailVerified', '==', filters.emailVerified))
      }

      const querySnapshot = await getDocs(q)
      const data: Customer[] = []

      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        } as Customer)
      })

      // TODO: Implementar búsqueda por texto en searchQuery
      let filteredData = data
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredData = data.filter(
          (customer) =>
            customer.email.toLowerCase().includes(query) ||
            customer.firstName.toLowerCase().includes(query) ||
            customer.lastName.toLowerCase().includes(query) ||
            customer.phone?.toLowerCase().includes(query)
        )
      }

      const total = filteredData.length
      const totalPages = Math.ceil(total / limit)

      return {
        data: filteredData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      this.handleError('fetching customers', error)
      throw error
    }
  }

  /**
   * Suscribirse a cambios en tiempo real de clientes
   */
  subscribeToCustomers(
    callback: (customers: Customer[]) => void,
    filters?: CustomerSearchParams['filters']
  ): () => void {
    try {
      let q = query(this.customersCollection, orderBy('createdAt', 'desc'))

      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status))
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const customers: Customer[] = []
        snapshot.forEach((doc) => {
          customers.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
          } as Customer)
        })
        callback(customers)
      })

      return unsubscribe
    } catch (error) {
      this.handleError('subscribing to customers', error)
      throw error
    }
  }

  /**
   * Crear un nuevo cliente (desde el admin o ecommerce)
   * @param sendWelcomeEmail - Si es true, envía email con link para establecer contraseña
   */
  async createCustomer(
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
    sendWelcomeEmail = false
  ): Promise<string> {
    try {
      const cleanData = this.cleanObject(customerData)
      const now = new Date()

      const data = {
        ...cleanData,
        displayName: `${customerData.firstName} ${customerData.lastName}`.trim(),
        status: customerData.status || 'pending_verification',
        segment: customerData.segment || 'new',
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lifetimeValue: 0,
        emailVerified: false, // Se verificará cuando establezca contraseña
        phoneVerified: customerData.phoneVerified || false,
        passwordSet: false, // Nuevo campo para saber si estableció contraseña
        addresses: customerData.addresses || [],
        notes: customerData.notes || [],
        tags: customerData.tags || [],
        customFields: customerData.customFields || {},
        storeHistory: customerData.storeHistory || [],
        marketingConsent: customerData.marketingConsent || {
          email: 'not_set',
          sms: 'not_set',
          push: 'not_set',
          phone: 'not_set',
        },
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(this.customersCollection, data)
      const customerId = docRef.id

      // Si se solicita, enviar email de bienvenida
      if (sendWelcomeEmail) {
        try {
          const { authService } = await import('./authService')
          const token = await authService.createPasswordSetupToken(
            customerId,
            customerData.email
          )
          await authService.sendWelcomeEmail(
            customerData.email,
            customerData.firstName,
            token
          )
          console.log('✅ Email de bienvenida enviado a:', customerData.email)
        } catch (emailError) {
          console.error('⚠️ Error al enviar email, pero usuario creado:', emailError)
          // No lanzamos error para que el usuario se cree de todas formas
        }
      }

      return customerId
    } catch (error) {
      this.handleError('creating customer', error)
      throw error
    }
  }

  /**
   * Actualizar un cliente
   */
  async updateCustomer(customerId: string, updates: CustomerUpdate): Promise<void> {
    try {
      const cleanUpdates = this.cleanObject(updates)
      cleanUpdates.updatedAt = new Date()

      // Actualizar displayName si se cambia firstName o lastName
      if (updates.firstName || updates.lastName) {
        const currentCustomer = await this.getCustomer(customerId)
        if (currentCustomer) {
          const firstName = updates.firstName || currentCustomer.firstName
          const lastName = updates.lastName || currentCustomer.lastName
          cleanUpdates.displayName = `${firstName} ${lastName}`.trim()
        }
      }

      const docRef = doc(this.customersCollection, customerId)
      await updateDoc(docRef, cleanUpdates)
    } catch (error) {
      this.handleError('updating customer', error)
      throw error
    }
  }

  /**
   * Eliminar un cliente
   */
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      const docRef = doc(this.customersCollection, customerId)
      await deleteDoc(docRef)
    } catch (error) {
      this.handleError('deleting customer', error)
      throw error
    }
  }

  // ============= DIRECCIONES =============

  /**
   * Agregar una dirección a un cliente
   */
  async addAddress(customerId: string, address: Omit<CustomerAddress, 'id' | 'customerId'>): Promise<void> {
    try {
      const customer = await this.getCustomer(customerId)
      if (!customer) throw new Error('Customer not found')

      const newAddress: CustomerAddress = {
        ...address,
        id: crypto.randomUUID(),
        customerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const addresses = [...(customer.addresses || []), newAddress]

      await this.updateCustomer(customerId, {
        // @ts-ignore
        addresses,
        lastModifiedBy: 'system',
      })
    } catch (error) {
      this.handleError('adding address', error)
      throw error
    }
  }

  /**
   * Actualizar una dirección
   */
  async updateAddress(customerId: string, addressId: string, updates: Partial<CustomerAddress>): Promise<void> {
    try {
      const customer = await this.getCustomer(customerId)
      if (!customer) throw new Error('Customer not found')

      const addresses = customer.addresses.map((addr) =>
        addr.id === addressId ? { ...addr, ...updates, updatedAt: new Date() } : addr
      )

      await this.updateCustomer(customerId, {
        // @ts-ignore
        addresses,
        lastModifiedBy: 'system',
      })
    } catch (error) {
      this.handleError('updating address', error)
      throw error
    }
  }

  /**
   * Eliminar una dirección
   */
  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    try {
      const customer = await this.getCustomer(customerId)
      if (!customer) throw new Error('Customer not found')

      const addresses = customer.addresses.filter((addr) => addr.id !== addressId)

      await this.updateCustomer(customerId, {
        // @ts-ignore
        addresses,
        lastModifiedBy: 'system',
      })
    } catch (error) {
      this.handleError('deleting address', error)
      throw error
    }
  }

  // ============= NOTAS =============

  /**
   * Agregar una nota al cliente
   */
  async addNote(customerId: string, note: Omit<CustomerNote, 'id' | 'customerId' | 'createdAt'>): Promise<void> {
    try {
      const customer = await this.getCustomer(customerId)
      if (!customer) throw new Error('Customer not found')

      const newNote: CustomerNote = {
        ...note,
        id: crypto.randomUUID(),
        customerId,
        createdAt: new Date(),
      }

      const notes = [...(customer.notes || []), newNote]

      await this.updateCustomer(customerId, {
        // @ts-ignore
        notes,
        lastModifiedBy: note.createdBy,
      })
    } catch (error) {
      this.handleError('adding note', error)
      throw error
    }
  }

  // ============= UTILIDADES =============

  /**
   * Limpiar objeto para Firestore (remover undefined)
   */
  private cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          cleaned[key] = this.cleanObject(value as Record<string, unknown>)
        } else {
          cleaned[key] = value
        }
      }
    }

    return cleaned
  }

  /**
   * Manejo de errores
   */
  private handleError(operation: string, error: unknown): void {
    console.error(`Error ${operation}:`, error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

export const customerService = new CustomerService()
