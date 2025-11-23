/**
 * Hook para gestión de Combos/Bundles con React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { bundleService } from '@/services/bundleService'
import type {
  Bundle,
  BundleSearchParams,
  CreateBundleDTO,
} from '@/types/bundle'

export function useBundles(storeId?: string, searchParams?: BundleSearchParams) {
  const queryClient = useQueryClient()
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Suscripción en tiempo real a combos
  useEffect(() => {
    if (!storeId) {
      setBundles([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    const filters = {
      ...searchParams?.filters,
      storeId,
    }
    
    const unsubscribe = bundleService.subscribeToBundles(
      (updatedBundles) => {
        setBundles(updatedBundles)
        setIsLoading(false)
      },
      filters
    )

    return () => {
      unsubscribe()
    }
  }, [storeId, searchParams?.filters])

  // Mutación para crear combo
  const createBundleMutation = useMutation({
    mutationFn: (bundleData: CreateBundleDTO) =>
      bundleService.createBundle(bundleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
    },
  })

  // Mutación para actualizar combo
  const updateBundleMutation = useMutation({
    mutationFn: ({ bundleId, updates }: { bundleId: string; updates: Partial<CreateBundleDTO> }) =>
      bundleService.updateBundle(bundleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
    },
  })

  // Mutación para eliminar combo
  const deleteBundleMutation = useMutation({
    mutationFn: (bundleId: string) => bundleService.deleteBundle(bundleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
    },
  })

  // Mutación para duplicar combo
  const duplicateBundleMutation = useMutation({
    mutationFn: (bundleId: string) => bundleService.duplicateBundle(bundleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
    },
  })

  return {
    // Datos
    bundles,
    isLoading,

    // Mutaciones
    createBundle: createBundleMutation.mutate,
    updateBundle: updateBundleMutation.mutate,
    deleteBundle: deleteBundleMutation.mutate,
    duplicateBundle: duplicateBundleMutation.mutate,

    // Estados de mutaciones
    isCreating: createBundleMutation.isPending,
    isUpdating: updateBundleMutation.isPending,
    isDeleting: deleteBundleMutation.isPending,
    isDuplicating: duplicateBundleMutation.isPending,
  }
}

/**
 * Hook para obtener un combo específico
 */
export function useBundle(bundleId: string | undefined) {
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!bundleId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    const unsubscribe = bundleService.subscribeToBundle(bundleId, (updatedBundle) => {
      setBundle(updatedBundle)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [bundleId])

  return {
    bundle,
    isLoading,
  }
}

export default useBundles
