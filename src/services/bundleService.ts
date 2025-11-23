/**
 * Servicio para gestión de Combos/Bundles
 */
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
  onSnapshot,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type {
  Bundle,
  BundleSearchParams,
  PaginatedBundleResponse,
  CreateBundleDTO,
  BundleValidation,
  BundleItem,
} from '@/types/bundle'

class BundleService {
  private bundlesCollection = collection(db, 'bundles')

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
   * Calcular precios del combo
   */
  private calculateBundlePricing(
    items: BundleItem[],
    discount: Bundle['discount']
  ): {
    totalOriginalPrice: number
    bundlePrice: number
    savings: number
    savingsPercentage: number
  } {
    const totalOriginalPrice = items.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    )

    let bundlePrice: number

    switch (discount.type) {
      case 'percentage':
        bundlePrice = totalOriginalPrice * (1 - discount.value / 100)
        break
      case 'fixed':
        bundlePrice = Math.max(0, totalOriginalPrice - discount.value)
        break
      case 'bundle_price':
        bundlePrice = discount.value
        break
      default:
        bundlePrice = totalOriginalPrice
    }

    const savings = totalOriginalPrice - bundlePrice
    const savingsPercentage = (savings / totalOriginalPrice) * 100

    return {
      totalOriginalPrice,
      bundlePrice,
      savings,
      savingsPercentage,
    }
  }

  /**
   * Validar combo antes de crear/actualizar
   */
  async validateBundle(bundleData: Partial<CreateBundleDTO>): Promise<BundleValidation> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validaciones básicas
    if (!bundleData.name || bundleData.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres')
    }

    if (!bundleData.items || bundleData.items.length < 2) {
      errors.push('Un combo debe tener al menos 2 productos')
    }

    if (bundleData.discount) {
      if (bundleData.discount.type === 'percentage' && 
          (bundleData.discount.value < 0 || bundleData.discount.value > 100)) {
        errors.push('El descuento porcentual debe estar entre 0 y 100')
      }

      if (bundleData.discount.type === 'fixed' && bundleData.discount.value < 0) {
        errors.push('El descuento fijo no puede ser negativo')
      }
    }

    // Validar fechas
    if (bundleData.startDate && bundleData.endDate) {
      if (new Date(bundleData.endDate) <= new Date(bundleData.startDate)) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio')
      }
    }

    // Warnings
    if (bundleData.items && bundleData.items.length > 10) {
      warnings.push('Los combos con más de 10 productos pueden ser confusos para el cliente')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Enriquecer items del combo con datos de productos
   */
  private async enrichBundleItems(
    items: Omit<BundleItem, 'productName' | 'productImage' | 'originalPrice'>[]
  ): Promise<BundleItem[]> {
    const enrichedItems: BundleItem[] = []

    for (const item of items) {
      try {
        const productDoc = await getDoc(doc(db, 'products', item.productId))
        
        if (!productDoc.exists()) {
          console.warn(`Producto ${item.productId} no encontrado`)
          continue
        }

        const product = productDoc.data()
        let originalPrice = product.basePrice || 0
        let variationName: string | undefined

        // Si es una variación específica, buscar su precio
        if (item.variationId && product.variations) {
          const variation = product.variations.find((v: any) => v.id === item.variationId)
          if (variation) {
            originalPrice = variation.price || product.basePrice || 0
            variationName = variation.sku || `${variation.size || ''} ${variation.color || ''}`.trim()
          }
        }

        enrichedItems.push({
          ...item,
          productName: product.name,
          productImage: product.images?.[0]?.url,
          originalPrice,
          variationName,
        })
      } catch (error) {
        console.error(`Error al enriquecer item ${item.productId}:`, error)
      }
    }

    return enrichedItems
  }

  /**
   * Crear un nuevo combo
   */
  async createBundle(bundleData: CreateBundleDTO): Promise<string> {
    try {
      // Validar
      const validation = await this.validateBundle(bundleData)
      if (!validation.isValid) {
        throw new Error(`Validación fallida: ${validation.errors.join(', ')}`)
      }

      // Enriquecer items con datos de productos
      const enrichedItems = await this.enrichBundleItems(bundleData.items)

      if (enrichedItems.length < 2) {
        throw new Error('No se pudieron cargar suficientes productos válidos para el combo')
      }

      // Calcular precios
      const pricing = this.calculateBundlePricing(enrichedItems, bundleData.discount)

      // Calcular stock disponible (el mínimo de todos los items)
      const availableQuantity = Math.min(
        ...enrichedItems.map(item => Math.floor(100 / item.quantity)) // TODO: obtener stock real
      )

      const now = new Date()
      const cleanData = this.cleanObject({
        ...bundleData,
        items: enrichedItems,
        ...pricing,
        availableQuantity,
        isInStock: availableQuantity > 0,
        viewCount: 0,
        purchaseCount: 0,
        revenue: 0,
        createdAt: now,
        updatedAt: now,
      })

      const docRef = await addDoc(this.bundlesCollection, cleanData)
      console.log('✅ Combo creado:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Error al crear combo:', error)
      throw error
    }
  }

  /**
   * Obtener un combo por ID
   */
  async getBundle(bundleId: string): Promise<Bundle | null> {
    try {
      const docRef = doc(this.bundlesCollection, bundleId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          startDate: data.startDate?.toDate?.(),
          endDate: data.endDate?.toDate?.(),
        } as Bundle
      }

      return null
    } catch (error) {
      console.error('Error al obtener combo:', error)
      throw error
    }
  }

  /**
   * Obtener combos con filtros y paginación
   */
  async getBundles(params: BundleSearchParams = {}): Promise<PaginatedBundleResponse> {
    try {
      const {
        filters,
        sortBy = 'created_at',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = params

      let q = query(
        this.bundlesCollection,
        orderBy(sortBy === 'created_at' ? 'createdAt' : sortBy, sortOrder),
        firestoreLimit(limit)
      )

      // Aplicar filtros
      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status))
      }

      if (filters?.isFeatured !== undefined) {
        q = query(q, where('isFeatured', '==', filters.isFeatured))
      }

      if (filters?.inStock !== undefined) {
        q = query(q, where('isInStock', '==', filters.inStock))
      }

      const querySnapshot = await getDocs(q)
      const data: Bundle[] = []

      querySnapshot.forEach((doc) => {
        const docData = doc.data()
        data.push({
          id: doc.id,
          ...docData,
          createdAt: docData.createdAt?.toDate?.() || new Date(),
          updatedAt: docData.updatedAt?.toDate?.() || new Date(),
          startDate: docData.startDate?.toDate?.(),
          endDate: docData.endDate?.toDate?.(),
        } as Bundle)
      })

      // Filtros adicionales en memoria
      let filteredData = data

      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filteredData = filteredData.filter(
          (bundle) =>
            bundle.name.toLowerCase().includes(search) ||
            bundle.description?.toLowerCase().includes(search)
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
      console.error('Error al obtener combos:', error)
      throw error
    }
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToBundle(bundleId: string, callback: (bundle: Bundle | null) => void): () => void {
    const docRef = doc(this.bundlesCollection, bundleId)
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        callback({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          startDate: data.startDate?.toDate?.(),
          endDate: data.endDate?.toDate?.(),
        } as Bundle)
      } else {
        callback(null)
      }
    })

    return unsubscribe
  }

  /**
   * Suscribirse a lista de combos en tiempo real
   */
  subscribeToBundles(
    callback: (bundles: Bundle[]) => void,
    filters?: BundleSearchParams['filters']
  ): () => void {
    const constraints = []

    // ✅ Filtrar por storeId (requerido)
    if (filters?.storeId) {
      constraints.push(where('storeId', '==', filters.storeId))
    }

    // Filtrar por status
    if (filters?.status && filters.status.length > 0) {
      constraints.push(where('status', 'in', filters.status))
    }

    // Ordenar
    constraints.push(orderBy('createdAt', 'desc'))

    const q = query(this.bundlesCollection, ...constraints)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bundles: Bundle[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        bundles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          startDate: data.startDate?.toDate?.(),
          endDate: data.endDate?.toDate?.(),
        } as Bundle)
      })
      callback(bundles)
    })

    return unsubscribe
  }

  /**
   * Actualizar un combo
   */
  async updateBundle(
    bundleId: string,
    updates: Partial<CreateBundleDTO>
  ): Promise<void> {
    try {
      const docRef = doc(this.bundlesCollection, bundleId)
      const cleanUpdates = this.cleanObject({
        ...updates,
        updatedAt: new Date(),
      })

      // Si se actualizan items o descuento, recalcular precios
      if (updates.items || updates.discount) {
        const currentBundle = await this.getBundle(bundleId)
        if (currentBundle) {
          const items = updates.items 
            ? await this.enrichBundleItems(updates.items)
            : currentBundle.items
          
          const discount = updates.discount || currentBundle.discount
          const pricing = this.calculateBundlePricing(items, discount)

          Object.assign(cleanUpdates, pricing)
          if (updates.items) {
            cleanUpdates.items = items
          }
        }
      }

      await updateDoc(docRef, cleanUpdates)
      console.log('✅ Combo actualizado:', bundleId)
    } catch (error) {
      console.error('❌ Error al actualizar combo:', error)
      throw error
    }
  }

  /**
   * Eliminar un combo
   */
  async deleteBundle(bundleId: string): Promise<void> {
    try {
      const docRef = doc(this.bundlesCollection, bundleId)
      await deleteDoc(docRef)
      console.log('✅ Combo eliminado:', bundleId)
    } catch (error) {
      console.error('❌ Error al eliminar combo:', error)
      throw error
    }
  }

  /**
   * Duplicar un combo
   */
  async duplicateBundle(bundleId: string): Promise<string> {
    try {
      const bundle = await this.getBundle(bundleId)
      if (!bundle) {
        throw new Error('Combo no encontrado')
      }

      const duplicatedData: CreateBundleDTO = {
        name: `${bundle.name} (Copia)`,
        slug: `${bundle.slug}-copy-${Date.now()}`,
        description: bundle.description,
        shortDescription: bundle.shortDescription,
        status: 'draft',
        isFeatured: false,
        startDate: bundle.startDate,
        endDate: bundle.endDate,
        items: bundle.items.map(item => ({
          productId: item.productId,
          variationId: item.variationId,
          quantity: item.quantity,
        })),
        discount: bundle.discount,
        restrictions: bundle.restrictions,
        images: bundle.images,
        seoTitle: bundle.seoTitle,
        seoDescription: bundle.seoDescription,
        tags: bundle.tags,
        categoryIds: bundle.categoryIds,
      }

      return await this.createBundle(duplicatedData)
    } catch (error) {
      console.error('❌ Error al duplicar combo:', error)
      throw error
    }
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

export const bundleService = new BundleService()
