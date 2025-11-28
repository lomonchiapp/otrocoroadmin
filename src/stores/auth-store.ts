import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { authService } from '@/services/authService'
import type { User } from '@/features/users/data/schema'
import type { User as FirebaseUser } from 'firebase/auth'

const ACCESS_TOKEN = 'otrocoro-admin-access-token'

interface AuthUser {
  uid: string // Firebase UID
  email: string
  displayName?: string
  photoURL?: string
  adminUser?: User // Datos del usuario admin desde Firestore
}

interface AuthState {
  auth: {
    user: AuthUser | null
    firebaseUser: FirebaseUser | null
    loading: boolean
    setUser: (user: AuthUser | null) => void
    setFirebaseUser: (user: FirebaseUser | null) => void
    setLoading: (loading: boolean) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    initialize: () => Promise<void>
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  return {
    auth: {
      user: null,
      firebaseUser: null,
      loading: true,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      setFirebaseUser: (firebaseUser) =>
        set((state) => ({ ...state, auth: { ...state.auth, firebaseUser } })),
      setLoading: (loading) =>
        set((state) => ({ ...state, auth: { ...state.auth, loading } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              firebaseUser: null,
              accessToken: '' 
            },
          }
        }),
      initialize: async () => {
        set((state) => ({ ...state, auth: { ...state.auth, loading: true } }))
        
        // Escuchar cambios en el estado de autenticación
        const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            // Usuario autenticado - obtener datos del admin
            try {
              const adminUser = await authService.getAdminUserById(firebaseUser.uid)
              
              if (adminUser && adminUser.status === 'active') {
                const authUser: AuthUser = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email!,
                  displayName: firebaseUser.displayName || `${adminUser.firstName} ${adminUser.lastName}`,
                  photoURL: firebaseUser.photoURL || undefined,
                  adminUser,
                }
                
                set((state) => ({
                  ...state,
                  auth: {
                    ...state.auth,
                    user: authUser,
                    firebaseUser,
                    loading: false,
                  },
                }))
              } else {
                // Usuario no es admin o está inactivo
                await authService.signOut()
                set((state) => ({
                  ...state,
                  auth: {
                    ...state.auth,
                    user: null,
                    firebaseUser: null,
                    loading: false,
                  },
                }))
              }
            } catch (error) {
              console.error('Error loading admin user:', error)
              set((state) => ({
                ...state,
                auth: {
                  ...state.auth,
                  user: null,
                  firebaseUser: null,
                  loading: false,
                },
              }))
            }
          } else {
            // Usuario no autenticado
            set((state) => ({
              ...state,
              auth: {
                ...state.auth,
                user: null,
                firebaseUser: null,
                loading: false,
              },
            }))
          }
        })

        // Retornar función de limpieza (se puede usar si es necesario)
        return unsubscribe
      },
    },
  }
})
