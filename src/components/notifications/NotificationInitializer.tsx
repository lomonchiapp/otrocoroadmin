import { useEffect } from 'react'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Componente que inicializa los listeners de notificaciones
 * Debe ser usado en el layout autenticado
 */
export function NotificationInitializer() {
  const { auth } = useAuthStore()
  const { initializeListeners } = useNotificationStore()

  useEffect(() => {
    if (!auth.user?.accountNo || !auth.user?.role) {
      return
    }

    const userId = auth.user.accountNo
    const userRoles = Array.isArray(auth.user.role) ? auth.user.role : [auth.user.role]

    // Inicializar listeners de notificaciones
    const unsubscribe = initializeListeners(userId, userRoles)

    // Cleanup al desmontar o cambiar usuario
    return () => {
      unsubscribe()
    }
  }, [auth.user?.accountNo, auth.user?.role, initializeListeners])

  return null
}



