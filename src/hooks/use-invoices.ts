import { useState, useCallback, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderBy as firestoreOrderBy, where } from 'firebase/firestore'

import invoiceService from '@/services/invoiceService'
import type {
  CreateInvoiceFromOrderRequest,
  Currency,
  Invoice,
  InvoiceAnalytics,
  InvoiceFilters,
  InvoiceSearchParams,
  InvoiceStatus,
  RecordPaymentRequest,
  UpdateInvoiceRequest,
} from '@/types/invoices'

// Hook para suscripción a facturas en tiempo real
export const useInvoiceSubscription = (storeId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeId) {
      setInvoices([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const constraints = [
      where('storeId', '==', storeId),
      firestoreOrderBy('issueDate', 'desc'),
    ]

    const unsubscribe = invoiceService.subscribe(
      constraints,
      (incomingInvoices) => {
        setInvoices(incomingInvoices)
        setIsLoading(false)
        setError(null)
      },
      (_err) => {
        setError('Error al cargar facturas')
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [storeId])

  return { invoices, isLoading, error }
}

export const useInvoices = (storeId?: string) => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<InvoiceSearchParams>({
    filters: {
      storeIds: storeId ? [storeId] : [],
    },
    page: 1,
    limit: 10,
  })

  // Usar suscripción en tiempo real
  const { invoices, isLoading, error } = useInvoiceSubscription(storeId)

  // Obtener una factura específica
  const getInvoice = useCallback(
    (invoiceId: string) => {
      return queryClient.fetchQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => invoiceService.getInvoice(invoiceId),
      })
    },
    [queryClient],
  )

  // Crear factura
  const createMutation = useMutation({
    mutationFn: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) =>
      invoiceService.createInvoice(invoiceData),
    onSuccess: () => {
      toast.success('Factura creada con éxito')
    },
    onError: (err: Error) => {
      toast.error(`Error al crear factura: ${err.message}`)
    },
  })

  // Crear factura desde orden
  const createFromOrderMutation = useMutation({
    mutationFn: ({
      request,
      userId,
    }: {
      request: CreateInvoiceFromOrderRequest
      userId: string
    }) => invoiceService.createInvoiceFromOrder(request, storeId || '', userId),
    onSuccess: () => {
      toast.success('Factura generada desde orden')
    },
    onError: (err: Error) => {
      toast.error(`Error al generar factura: ${err.message}`)
    },
  })

  // Actualizar factura
  const updateMutation = useMutation({
    mutationFn: ({
      invoiceId,
      updates,
    }: {
      invoiceId: string
      updates: UpdateInvoiceRequest
    }) => invoiceService.updateInvoice(invoiceId, updates),
    onSuccess: () => {
      toast.success('Factura actualizada con éxito')
    },
    onError: (err: Error) => {
      toast.error(`Error al actualizar factura: ${err.message}`)
    },
  })

  // Eliminar factura
  const deleteMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceService.deleteInvoice(invoiceId),
    onSuccess: () => {
      toast.success('Factura eliminada con éxito')
    },
    onError: (err: Error) => {
      toast.error(`Error al eliminar factura: ${err.message}`)
    },
  })

  // Registrar pago
  const recordPaymentMutation = useMutation({
    mutationFn: ({ request, userId }: { request: RecordPaymentRequest; userId: string }) =>
      invoiceService.recordPayment(request, userId),
    onSuccess: () => {
      toast.success('Pago registrado con éxito')
    },
    onError: (err: Error) => {
      toast.error(`Error al registrar pago: ${err.message}`)
    },
  })

  // Analíticas de facturas
  const { data: invoiceAnalytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['invoiceAnalytics', storeId],
    queryFn: () => invoiceService.getInvoiceAnalytics(storeId || ''),
    enabled: !!storeId,
  })

  // Funciones de utilidad
  const updateSearchParams = useCallback((newParams: Partial<InvoiceSearchParams>) => {
    setSearchParams((prev) => ({
      ...prev,
      ...newParams,
      filters: {
        ...prev.filters,
        ...newParams.filters,
      },
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearchParams({
      filters: {
        storeIds: storeId ? [storeId] : [],
      },
      page: 1,
      limit: 10,
    })
  }, [storeId])

  const setPage = useCallback((page: number) => {
    setSearchParams((prev) => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setSearchParams((prev) => ({ ...prev, limit, page: 1 }))
  }, [])

  const setSortBy = useCallback(
    (
      sortBy: InvoiceSearchParams['sortBy'],
      sortOrder: 'asc' | 'desc' = 'desc',
    ) => {
      setSearchParams((prev) => ({ ...prev, sortBy, sortOrder }))
    },
    [],
  )

  const setFilters = useCallback((filters: Partial<InvoiceFilters>) => {
    setSearchParams((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters,
      },
      page: 1,
    }))
  }, [])

  const refetch = useCallback(() => {
    // La suscripción se actualiza automáticamente
  }, [])

  // Filtrar y paginar facturas client-side
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices]

    // Búsqueda por texto
    if (searchParams.query) {
      const searchTerm = searchParams.query.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
          invoice.customer.email.toLowerCase().includes(searchTerm) ||
          `${invoice.customer.firstName || ''} ${invoice.customer.lastName || ''}`
            .toLowerCase()
            .includes(searchTerm) ||
          invoice.customer.businessName?.toLowerCase().includes(searchTerm),
      )
    }

    // Filtros de estado
    if (searchParams.filters?.status?.length) {
      filtered = filtered.filter((invoice) =>
        searchParams.filters!.status!.includes(invoice.status),
      )
    }

    // Filtros de moneda
    if (searchParams.filters?.currency?.length) {
      filtered = filtered.filter((invoice) =>
        searchParams.filters!.currency!.includes(invoice.currency),
      )
    }

    // Filtros de fecha
    if (searchParams.filters?.dateRange) {
      const { start, end } = searchParams.filters.dateRange
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.issueDate)
        return invoiceDate >= start && invoiceDate <= end
      })
    }

    // Filtros de monto
    if (searchParams.filters?.amountRange) {
      const { min, max } = searchParams.filters.amountRange
      filtered = filtered.filter(
        (invoice) => invoice.total >= min && invoice.total <= max,
      )
    }

    // Filtro de pagadas/no pagadas
    if (searchParams.filters?.isPaid !== undefined) {
      filtered = filtered.filter((invoice) =>
        searchParams.filters!.isPaid
          ? invoice.status === 'paid'
          : invoice.status !== 'paid',
      )
    }

    // Filtro de vencidas
    if (searchParams.filters?.isOverdue !== undefined && searchParams.filters.isOverdue) {
      const now = new Date()
      filtered = filtered.filter(
        (invoice) =>
          invoice.status !== 'paid' &&
          invoice.status !== 'cancelled' &&
          new Date(invoice.dueDate) < now,
      )
    }

    // Ordenamiento
    const sortBy = searchParams.sortBy || 'issue_date'
    const sortOrder = searchParams.sortOrder || 'desc'

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'invoice_number':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber)
          break
        case 'issue_date':
          comparison =
            new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
          break
        case 'due_date':
          comparison =
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'total':
          comparison = a.total - b.total
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Paginación
    const page = searchParams.page || 1
    const limit = searchParams.limit || 10
    const startIndex = (page - 1) * limit
    const paginatedInvoices = filtered.slice(startIndex, startIndex + limit)

    // Calcular agregaciones
    const totalRevenue = filtered.reduce((sum, invoice) => sum + invoice.total, 0)
    const totalOutstanding = filtered.reduce(
      (sum, invoice) => sum + invoice.balance,
      0,
    )
    const averageInvoiceValue =
      filtered.length > 0 ? totalRevenue / filtered.length : 0

    const statusCounts: Record<InvoiceStatus, number> = {
      draft: 0,
      issued: 0,
      paid: 0,
      partially_paid: 0,
      overdue: 0,
      cancelled: 0,
      refunded: 0,
    }

    filtered.forEach((invoice) => {
      statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1
    })

    const currencySummary = {
      DOP: {
        total: filtered
          .filter((inv) => inv.currency === 'DOP')
          .reduce((sum, inv) => sum + inv.total, 0),
        count: filtered.filter((inv) => inv.currency === 'DOP').length,
      },
      USD: {
        total: filtered
          .filter((inv) => inv.currency === 'USD')
          .reduce((sum, inv) => sum + inv.total, 0),
        count: filtered.filter((inv) => inv.currency === 'USD').length,
      },
    }

    return {
      data: paginatedInvoices,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: page * limit < filtered.length,
        hasPrev: page > 1,
      },
      aggregations: {
        totalRevenue,
        totalOutstanding,
        averageInvoiceValue,
        statusCounts,
        currencySummary,
      },
    }
  }, [invoices, searchParams])

  return {
    // Datos
    invoices: filteredInvoices.data,
    pagination: filteredInvoices.pagination,
    aggregations: filteredInvoices.aggregations,
    invoiceAnalytics,
    isLoading,
    isLoadingAnalytics,
    isError: !!error,
    error,

    // Acciones
    getInvoice,
    createInvoice: createMutation.mutate,
    createInvoiceFromOrder: createFromOrderMutation.mutate,
    updateInvoice: updateMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
    recordPayment: recordPaymentMutation.mutate,

    // Estado de las mutaciones
    isCreating: createMutation.isPending,
    isCreatingFromOrder: createFromOrderMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRecordingPayment: recordPaymentMutation.isPending,

    // Gestión de búsqueda y filtros
    searchParams,
    updateSearchParams,
    resetFilters,
    setPage,
    setLimit,
    setSortBy,
    setFilters,
    refetch,
  }
}
















