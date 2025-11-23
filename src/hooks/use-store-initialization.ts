import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useStoreStore } from '@/stores/store-store'
import { mockStores, initializeMockData } from '@/data/mock-stores'
import type { Store } from '@/types'

// Hook para inicializar las tiendas desde Firebase
export const useStoreInitialization = () => {
  const { currentStore, setCurrentStore, availableStores, setAvailableStores } = useStoreStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Prevenir inicialización múltiple
    if (hasInitialized) {
      console.log('⚠️ Store initialization ya ejecutado, saltando...')
      return
    }
    
    const initializeStore = async () => {
      console.log('🔄 Inicializando stores desde Firebase...')
      setHasInitialized(true)
      setIsLoading(true)
      
      try {
        // 1. Intentar cargar stores desde Firebase
        let firebaseStores: Store[] = []
        try {
          const storesSnapshot = await getDocs(collection(db, 'stores'))
          firebaseStores = storesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Store))
          
          console.log('✅ Stores cargadas desde Firebase:', firebaseStores.length, 'stores')
          console.log('📋 Stores disponibles:', firebaseStores.map(s => ({ id: s.id, name: s.name })))
        } catch (firebaseError) {
          console.warn('⚠️ Firebase no disponible, usando datos mock:', firebaseError)
          // Inicializar datos mock
          initializeMockData()
          firebaseStores = mockStores
          console.log('✅ Stores cargadas desde mock data:', firebaseStores.length, 'stores')
        }
        
        // Guardar stores disponibles en Zustand (eliminar duplicados)
        if (firebaseStores.length > 0) {
          // Eliminar duplicados por ID
          const uniqueStores = firebaseStores.filter((store, index, self) => 
            index === self.findIndex(s => s.id === store.id)
          )
          setAvailableStores(uniqueStores)
        }
        
        // 2. Si ya hay una tienda actual, mantenerla
        if (currentStore) {
          console.log('ℹ️ Ya hay una tienda actual:', currentStore.name)
          setIsInitialized(true)
          setIsLoading(false)
          return
        }
        
        // 3. Intentar cargar desde localStorage
        const storedStore = localStorage.getItem('otrocoro-admin-current-store')
        if (storedStore) {
          try {
            const parsedStore = JSON.parse(storedStore) as Store
            console.log('📦 Tienda cargada desde localStorage:', parsedStore.name)
            setCurrentStore(parsedStore)
            setIsInitialized(true)
            setIsLoading(false)
            return
          } catch (error) {
            console.error('❌ Error parsing stored store:', error)
            localStorage.removeItem('otrocoro-admin-current-store')
          }
        }
        
        // 4. Si hay tiendas de Firebase, usar la primera
        if (firebaseStores.length > 0) {
          console.log('🏪 Usando la primera tienda de Firebase:', firebaseStores[0].name)
          setCurrentStore(firebaseStores[0])
          setIsInitialized(true)
          setIsLoading(false)
          return
        }
        
        // 5. Si hay tiendas disponibles en Zustand, usar la primera
        if (availableStores.length > 0) {
          console.log('🏪 Usando la primera tienda disponible:', availableStores[0].name)
          setCurrentStore(availableStores[0])
          setIsInitialized(true)
          setIsLoading(false)
          return
        }
        
        console.warn('⚠️ No se encontraron tiendas. Crea una en Firebase.')
        setIsInitialized(true)
        setIsLoading(false)
        
      } catch (error) {
        console.error('❌ Error inicializando stores:', error)
        setIsInitialized(true)
        setIsLoading(false)
      }
    }

    initializeStore()
  }, [hasInitialized]) // Solo ejecutar una vez al montar

  return {
    currentStore,
    availableStores,
    isInitialized,
    isLoading,
    hasStore: !!currentStore
  }
}


