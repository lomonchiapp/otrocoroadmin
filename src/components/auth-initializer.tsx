import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Componente que inicializa el estado de autenticación
 * Debe ser usado en el root o layout principal
 */
export function AuthInitializer() {
  const { auth } = useAuthStore()

  useEffect(() => {
    // Inicializar el listener de autenticación
    const unsubscribe = auth.initialize()

    // Cleanup al desmontar
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [auth])

  return null
}



