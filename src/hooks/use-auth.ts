import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from '@/services/authService'
import type { User as FirebaseUser } from 'firebase/auth'

export function useAuth() {
  const { auth } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      auth.initialize().then(() => {
        setIsInitialized(true)
      })
    }
  }, [isInitialized, auth])

  return {
    user: auth.user,
    firebaseUser: auth.firebaseUser,
    loading: auth.loading || !isInitialized,
    isAuthenticated: !!auth.user && !!auth.firebaseUser,
    isAdmin: !!auth.user?.adminUser,
    role: auth.user?.adminUser?.role,
    signOut: authService.signOut.bind(authService),
  }
}



