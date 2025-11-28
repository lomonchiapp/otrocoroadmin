import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Store, StoreType, StoreSettings } from '@/types/stores'

export interface CreateStoreData {
  name: string
  slug: string
  type: StoreType
  description: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  timezone: string
  defaultTaxRate: number
}

class StoreService {
  private collectionName = 'stores'

  // ============= GESTIÓN DE TIENDAS =============

  async getAllStores(): Promise<Store[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Store[]
    } catch (error) {
      console.error('Error getting stores:', error)
      throw error
    }
  }

  async getStore(storeId: string): Promise<Store | null> {
    try {
      const docRef = doc(db, this.collectionName, storeId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Store
    } catch (error) {
      console.error('Error getting store:', error)
      throw error
    }
  }

  async getStoreBySlug(slug: string): Promise<Store | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Store
    } catch (error) {
      console.error('Error getting store by slug:', error)
      throw error
    }
  }

  async createStore(storeData: CreateStoreData): Promise<string> {
    try {
      // Verificar que el slug no exista
      const existingStore = await this.getStoreBySlug(storeData.slug)
      if (existingStore) {
        throw new Error('Ya existe una tienda con ese slug')
      }

      // Configuración por defecto
      const defaultSettings: StoreSettings = {
        allowBackorders: false,
        trackInventory: true,
        defaultTaxRate: storeData.defaultTaxRate,
        shippingZones: [],
        shippingAgencies: [],
        paymentMethods: [],
        notifications: {
          emailOnNewOrder: true,
          emailOnLowStock: true,
          emailOnOutOfStock: true,
          smsNotifications: false,
        },
      }

      const newStore = {
        name: storeData.name,
        slug: storeData.slug,
        type: storeData.type,
        description: storeData.description,
        logo: storeData.logo || '',
        primaryColor: storeData.primaryColor,
        secondaryColor: storeData.secondaryColor,
        currency: storeData.currency,
        isActive: true,
        settings: defaultSettings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, this.collectionName), newStore)
      
      // Setup automático de Firebase
      await this.setupStoreCollections(docRef.id, storeData.type)

      return docRef.id
    } catch (error) {
      console.error('Error creating store:', error)
      throw error
    }
  }

  async updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, storeId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating store:', error)
      throw error
    }
  }

  async toggleStoreStatus(storeId: string, isActive: boolean): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, storeId)
      await updateDoc(docRef, {
        isActive,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error toggling store status:', error)
      throw error
    }
  }

  // ============= SETUP AUTOMÁTICO =============

  async setupStoreCollections(storeId: string, storeType: StoreType): Promise<void> {
    try {
      const batch = writeBatch(db)

      // Crear categorías iniciales según el tipo de tienda
      const categories = this.getDefaultCategories(storeType)
      for (const category of categories) {
        const categoryRef = doc(collection(db, 'categories'))
        batch.set(categoryRef, {
          ...category,
          storeId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      }

      // Crear configuración inicial de la tienda
      const storeConfigRef = doc(db, 'store_configs', storeId)
      batch.set(storeConfigRef, {
        storeId,
        emailTemplates: this.getDefaultEmailTemplates(),
        seoSettings: {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: [],
        },
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          whatsapp: '',
        },
        businessHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '14:00', isOpen: true },
          sunday: { open: '00:00', close: '00:00', isOpen: false },
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      await batch.commit()
    } catch (error) {
      console.error('Error setting up store collections:', error)
      throw error
    }
  }

  private getDefaultCategories(storeType: StoreType) {
    if (storeType === 'fashion') {
      return [
        {
          name: 'Ropa',
          slug: 'ropa',
          description: 'Prendas de vestir',
          isActive: true,
          order: 1,
        },
        {
          name: 'Calzado',
          slug: 'calzado',
          description: 'Zapatos y zapatillas',
          isActive: true,
          order: 2,
        },
        {
          name: 'Accesorios',
          slug: 'accesorios',
          description: 'Complementos de moda',
          isActive: true,
          order: 3,
        },
      ]
    } else {
      return [
        {
          name: 'Anillos',
          slug: 'anillos',
          description: 'Anillos de oro y plata',
          isActive: true,
          order: 1,
        },
        {
          name: 'Collares',
          slug: 'collares',
          description: 'Collares y cadenas',
          isActive: true,
          order: 2,
        },
        {
          name: 'Aretes',
          slug: 'aretes',
          description: 'Aretes y pendientes',
          isActive: true,
          order: 3,
        },
        {
          name: 'Pulseras',
          slug: 'pulseras',
          description: 'Pulseras y brazaletes',
          isActive: true,
          order: 4,
        },
      ]
    }
  }

  private getDefaultEmailTemplates() {
    return {
      orderConfirmation: {
        subject: 'Confirmación de Pedido #{{orderNumber}}',
        body: 'Gracias por tu compra. Tu pedido ha sido confirmado.',
      },
      orderShipped: {
        subject: 'Tu pedido #{{orderNumber}} ha sido enviado',
        body: 'Tu pedido está en camino. Tracking: {{trackingNumber}}',
      },
      orderDelivered: {
        subject: 'Tu pedido #{{orderNumber}} ha sido entregado',
        body: 'Tu pedido ha sido entregado exitosamente.',
      },
    }
  }

  // ============= UTILIDADES =============

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export const storeService = new StoreService()



