import { create } from 'zustand'
import { notificationService } from '@/services/notificationService'
import type { Notification } from '@/types/notifications'
import { playNotificationSound } from '@/lib/sound'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  
  // Actions
  initializeListeners: (userId: string, userRoles: string[]) => () => void
  markAsRead: (id: string, userId: string) => Promise<void>
  markAllAsRead: (userId: string, userRoles: string[]) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  initializeListeners: (userId: string, userRoles: string[]) => {
    set({ loading: true })
    
    const handleUpdate = (newNotifications: Notification[]) => {
      const currentNotifications = get().notifications
      
      // Detectar si hay nuevas notificaciones para reproducir sonido
      if (newNotifications.length > currentNotifications.length) {
        // Verificar si la más reciente es nueva y no leída
        const latest = newNotifications[0]
        const isNew = !currentNotifications.find(n => n.id === latest.id)
        if (isNew && !latest.read) {
          playNotificationSound()
        }
      } else {
        // Verificar si alguna notificación cambió de no leída a leída
        const newUnread = newNotifications.filter(n => !n.read)
        const currentUnread = currentNotifications.filter(n => !n.read)
        if (newUnread.length > currentUnread.length) {
          // Hay nuevas no leídas
          const newIds = newUnread.map(n => n.id)
          const currentIds = currentUnread.map(n => n.id)
          const trulyNew = newIds.filter(id => !currentIds.includes(id))
          if (trulyNew.length > 0) {
            playNotificationSound()
          }
        }
      }

      // Calcular no leídas
      const unreadCount = newNotifications.filter(n => !n.read).length
      
      set({ 
        notifications: newNotifications, 
        unreadCount,
        loading: false 
      })
    }

    const unsubscribe = notificationService.subscribeToNotifications(
      userId,
      userRoles,
      handleUpdate
    )

    return unsubscribe
  },

  markAsRead: async (id: string, userId: string) => {
    // Optimistic update
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true, readAt: new Date(), readBy: userId } : n
    )
    const unreadCount = updatedNotifications.filter(n => !n.read).length
    
    set({ notifications: updatedNotifications, unreadCount })
    
    // Persist
    await notificationService.markAsRead(id, userId)
  },

  markAllAsRead: async (userId: string, userRoles: string[]) => {
    // Optimistic
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => ({ 
      ...n, 
      read: true,
      readAt: new Date(),
      readBy: userId
    }))
    
    set({ notifications: updatedNotifications, unreadCount: 0 })
    
    // Persist
    await notificationService.markAllAsRead(userId, userRoles)
  },
}))



