import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  writeBatch, 
  doc, 
  updateDoc,
  addDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Notification, NotificationType, NotificationTarget } from '@/types/notifications'

class NotificationService {
  private collectionName = 'notifications'

  /**
   * Crear una notificación
   */
  async create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...notification,
        read: false,
        createdAt: Timestamp.now()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Obtener notificaciones de un usuario según su rol
   */
  async getUserNotifications(
    userId: string, 
    userRoles: string[], 
    limitCount = 50
  ): Promise<Notification[]> {
    // Firestore tiene limitaciones con múltiples where, así que usamos el método fallback directamente
    return this.getUserNotificationsFallback(userId, userRoles, limitCount)
  }

  /**
   * Fallback para obtener notificaciones con queries separadas
   */
  private async getUserNotificationsFallback(
    userId: string,
    userRoles: string[],
    limitCount: number
  ): Promise<Notification[]> {
    const allNotifications: Notification[] = []
    const seenIds = new Set<string>()

    // Query 1: Notificaciones personales
    try {
      const q1 = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const snap1 = await getDocs(q1)
      snap1.forEach(doc => {
        const data = doc.data()
        allNotifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
        } as Notification)
        seenIds.add(doc.id)
      })
    } catch (error) {
      console.error('Error getting personal notifications:', error)
    }

    // Query 2: Notificaciones para todos
    try {
      const q2 = query(
        collection(db, this.collectionName),
        where('target', '==', 'all'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const snap2 = await getDocs(q2)
      snap2.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          const data = doc.data()
          allNotifications.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
          } as Notification)
          seenIds.add(doc.id)
        }
      })
    } catch (error) {
      console.error('Error getting all notifications:', error)
    }

    // Query 3: Notificaciones por rol
    for (const role of userRoles) {
      try {
        const q3 = query(
          collection(db, this.collectionName),
          where('target', '==', role),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
        const snap3 = await getDocs(q3)
        snap3.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            const data = doc.data()
            allNotifications.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
            } as Notification)
            seenIds.add(doc.id)
          }
        })
      } catch (error) {
        console.error(`Error getting ${role} notifications:`, error)
      }
    }

    return allNotifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limitCount)
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, notificationId)
      await updateDoc(docRef, { 
        read: true,
        readAt: Timestamp.now(),
        readBy: userId
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: string, userRoles: string[]): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId, userRoles, 1000)
      const unreadNotifications = notifications.filter(n => !n.read)
      
      if (unreadNotifications.length === 0) return

      const batch = writeBatch(db)
      
      unreadNotifications.forEach(notification => {
        const docRef = doc(db, this.collectionName, notification.id)
        batch.update(docRef, { 
          read: true,
          readAt: Timestamp.now(),
          readBy: userId
        })
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Error marking all as read:', error)
      throw error
    }
  }

  /**
   * Listener en tiempo real para notificaciones de un usuario
   */
  subscribeToNotifications(
    userId: string,
    userRoles: string[],
    onUpdate: (notifications: Notification[]) => void
  ): () => void {
    // Usar el método fallback que hace queries separadas
    // y luego combinar resultados en memoria
    const unsubscribes: (() => void)[] = []
    const allNotifications: Notification[] = []
    const seenIds = new Set<string>()

    const updateCombined = () => {
      const sorted = [...allNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50)
      onUpdate(sorted)
    }

    // Listener 1: Notificaciones personales
    try {
      const q1 = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const unsub1 = onSnapshot(q1, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          const notification = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
          } as Notification

          const index = allNotifications.findIndex(n => n.id === notification.id)
          if (index >= 0) {
            allNotifications[index] = notification
          } else {
            allNotifications.push(notification)
            seenIds.add(notification.id)
          }
        })
        updateCombined()
      })
      unsubscribes.push(unsub1)
    } catch (error) {
      console.error('Error subscribing to personal notifications:', error)
    }

    // Listener 2: Notificaciones para todos
    try {
      const q2 = query(
        collection(db, this.collectionName),
        where('target', '==', 'all'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const unsub2 = onSnapshot(q2, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          const notification = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
          } as Notification

          if (!seenIds.has(notification.id)) {
            allNotifications.push(notification)
            seenIds.add(notification.id)
          } else {
            const index = allNotifications.findIndex(n => n.id === notification.id)
            if (index >= 0) {
              allNotifications[index] = notification
            }
          }
        })
        updateCombined()
      })
      unsubscribes.push(unsub2)
    } catch (error) {
      console.error('Error subscribing to all notifications:', error)
    }

    // Listener 3: Notificaciones por rol
    userRoles.forEach(role => {
      try {
        const q3 = query(
          collection(db, this.collectionName),
          where('target', '==', role),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
        const unsub3 = onSnapshot(q3, (snapshot) => {
          snapshot.docs.forEach(doc => {
            const data = doc.data()
            const notification = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
            } as Notification

            if (!seenIds.has(notification.id)) {
              allNotifications.push(notification)
              seenIds.add(notification.id)
            } else {
              const index = allNotifications.findIndex(n => n.id === notification.id)
              if (index >= 0) {
                allNotifications[index] = notification
              }
            }
          })
          updateCombined()
        })
        unsubscribes.push(unsub3)
      } catch (error) {
        console.error(`Error subscribing to ${role} notifications:`, error)
      }
    })

    // Retornar función para desuscribirse de todos los listeners
    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }
}

export const notificationService = new NotificationService()

