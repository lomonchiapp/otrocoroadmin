// Hook para gestión de clientes con React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { customerService } from '@/services/customerService'
import type {
  Customer,
  CustomerSearchParams,
  CustomerUpdate,
  CustomerAddress,
  CustomerNote,
} from '@/types/customers'

export function useCustomers(searchParams?: CustomerSearchParams) {
  const queryClient = useQueryClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Suscripción en tiempo real a clientes
  useEffect(() => {
    setIsLoading(true)
    
    const unsubscribe = customerService.subscribeToCustomers(
      (updatedCustomers) => {
        setCustomers(updatedCustomers)
        setIsLoading(false)
      },
      searchParams?.filters
    )

    return () => {
      unsubscribe()
    }
  }, [searchParams?.filters])

  // Mutación para crear cliente
  const createCustomerMutation = useMutation({
    mutationFn: ({ 
      customer, 
      sendWelcomeEmail = true 
    }: { 
      customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
      sendWelcomeEmail?: boolean 
    }) =>
      customerService.createCustomer(customer, sendWelcomeEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Mutación para actualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: ({ customerId, updates }: { customerId: string; updates: CustomerUpdate }) =>
      customerService.updateCustomer(customerId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Mutación para eliminar cliente
  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: string) => customerService.deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Mutación para agregar dirección
  const addAddressMutation = useMutation({
    mutationFn: ({ customerId, address }: { customerId: string; address: Omit<CustomerAddress, 'id' | 'customerId'> }) =>
      customerService.addAddress(customerId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Mutación para actualizar dirección
  const updateAddressMutation = useMutation({
    mutationFn: ({ customerId, addressId, updates }: { customerId: string; addressId: string; updates: Partial<CustomerAddress> }) =>
      customerService.updateAddress(customerId, addressId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Mutación para eliminar dirección
  const deleteAddressMutation = useMutation({
    mutationFn: ({ customerId, addressId }: { customerId: string; addressId: string }) =>
      customerService.deleteAddress(customerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Mutación para agregar nota
  const addNoteMutation = useMutation({
    mutationFn: ({ customerId, note }: { customerId: string; note: Omit<CustomerNote, 'id' | 'customerId' | 'createdAt'> }) =>
      customerService.addNote(customerId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  return {
    // Datos
    customers,
    isLoading,

    // Mutaciones
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    addNote: addNoteMutation.mutate,

    // Estados de mutaciones
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
    isAddingAddress: addAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
  }
}

/**
 * Hook para obtener un cliente específico
 */
export function useCustomer(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getCustomer(customerId!),
    enabled: !!customerId,
  })
}
