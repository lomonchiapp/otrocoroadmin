// Hook personalizado para obtener información de la tienda actual
import { useStoreStore } from '@/stores/store-store'
import type { Store } from '@/types'

export const useCurrentStore = () => {
  const { currentStore, isLoading, error } = useStoreStore()
  
  const storeName = currentStore?.name || 'Sin tienda seleccionada'
  const storeColor = currentStore?.primaryColor || '#8B5CF6'
  const storeType = currentStore?.type || null
  
  return {
    store: currentStore,
    storeName,
    storeColor,
    storeType,
    isLoading,
    error,
    hasStore: !!currentStore,
  }
}

