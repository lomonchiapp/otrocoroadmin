// Store para manejo del estado de tiendas múltiples
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Store, AdminState, AdminUser, Permission } from '@/types'

interface StoreState extends AdminState {
  // Estados
  isLoading: boolean
  error: string | null
  
  // Acciones para stores
  setCurrentStore: (store: Store) => void
  setAvailableStores: (stores: Store[]) => void
  addStore: (store: Store) => void
  updateStore: (storeId: string, updates: Partial<Store>) => void
  removeStore: (storeId: string) => void
  
  // Acciones para usuario admin
  setUser: (user: AdminUser) => void
  setPermissions: (permissions: Permission[]) => void
  
  // Acciones para estados
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Utilidades
  hasStoreAccess: (storeId: string) => boolean
  getCurrentStoreType: () => 'fashion' | 'jewelry' | null
  canManageStore: (storeId: string) => boolean
  
  // Reset
  reset: () => void
}

const initialState = {
  currentStore: null,
  availableStores: [],
  user: null,
  permissions: [],
  isLoading: false,
  error: null,
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Acciones para stores
      setCurrentStore: (store: Store) => {
        set({ 
          currentStore: store, 
          error: null 
        })
        
        // Persistir en localStorage separadamente para acceso rápido
        localStorage.setItem('otrocoro-admin-current-store', JSON.stringify(store))
      },
      
      setAvailableStores: (stores: Store[]) => {
        set({ availableStores: stores })
      },
      
      addStore: (store: Store) => {
        set((state) => ({
          availableStores: [...state.availableStores, store]
        }))
      },
      
      updateStore: (storeId: string, updates: Partial<Store>) => {
        set((state) => ({
          availableStores: state.availableStores.map(store =>
            store.id === storeId 
              ? { ...store, ...updates, updatedAt: new Date() }
              : store
          ),
          currentStore: state.currentStore?.id === storeId
            ? { ...state.currentStore, ...updates, updatedAt: new Date() }
            : state.currentStore
        }))
      },
      
      removeStore: (storeId: string) => {
        set((state) => ({
          availableStores: state.availableStores.filter(store => store.id !== storeId),
          currentStore: state.currentStore?.id === storeId ? null : state.currentStore
        }))
      },
      
      // Acciones para usuario admin
      setUser: (user: AdminUser) => {
        set({ user, error: null })
      },
      
      setPermissions: (permissions: Permission[]) => {
        set({ permissions })
      },
      
      // Acciones para estados
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setError: (error: string | null) => {
        set({ error, isLoading: false })
      },
      
      clearError: () => {
        set({ error: null })
      },
      
      // Utilidades
      hasStoreAccess: (storeId: string) => {
        const { user } = get()
        if (!user) return false
        
        // Super admin tiene acceso a todas las tiendas
        if (user.role === 'super_admin') return true
        
        // Verificar acceso específico a la tienda
        return user.storeAccess.some(access => access.storeId === storeId)
      },
      
      getCurrentStoreType: () => {
        const { currentStore } = get()
        return currentStore?.type || null
      },
      
      canManageStore: (storeId: string): boolean => {
        const { user } = get()
        if (!user) return false
        
        // Super admin puede gestionar todas las tiendas
        if (user.role === 'super_admin') return true
        
        // Verificar rol específico en la tienda
        const storeAccess = user.storeAccess.find(access => access.storeId === storeId)
        return !!(storeAccess && ['store_admin', 'store_manager'].includes(storeAccess.role))
      },
      
      // Reset
      reset: () => {
        set(initialState)
        localStorage.removeItem('otrocoro-admin-current-store')
      }
    }),
    {
      name: 'otrocoro-admin-store-state',
      partialize: (state) => ({
        currentStore: state.currentStore,
        availableStores: state.availableStores,
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
)

// Hook personalizado para obtener información de la tienda actual
export const useCurrentStore = () => {
  const { currentStore, getCurrentStoreType, user } = useStoreStore()
  
  return {
    store: currentStore,
    type: getCurrentStoreType(),
    isLoggedIn: !!user,
    storeName: currentStore?.name || 'Seleccionar tienda',
    storeColor: currentStore?.primaryColor || '#3b82f6',
  }
}

// Hook para verificar permisos
export const useStorePermissions = () => {
  const { hasStoreAccess, canManageStore, user } = useStoreStore()
  
  return {
    hasStoreAccess,
    canManageStore,
    isSuperAdmin: user?.role === 'super_admin',
    userRole: user?.role,
  }
}
