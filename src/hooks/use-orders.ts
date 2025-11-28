import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { where, orderBy as firestoreOrderBy } from 'firebase/firestore';

import orderService from '@/services/orderService';
import type {
  Order,
  OrderSearchParams,
  OrderFilters,
  OrderUpdate,
  RefundRequest,
  OrderStatus,
} from '@/types';

// Hook para suscripción a órdenes en tiempo real
export const useOrderSubscription = (storeId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Construir constraints dinámicamente
    const constraints: unknown[] = [];
    
    // Si hay storeId, filtrar por él O por null/undefined (órdenes sin tienda asignada)
    // Firestore no permite múltiples where para el mismo campo con OR, así que:
    // - Si hay storeId: obtenemos órdenes con ese storeId Y órdenes sin storeId
    // - Si no hay storeId: obtenemos todas las órdenes
    if (storeId) {
      // Filtrar por storeId específico
      constraints.push(where('storeId', '==', storeId));
    }
    // Si no hay storeId, no agregamos filtro y obtenemos todas las órdenes
    
    constraints.push(firestoreOrderBy('createdAt', 'desc'));

    const unsubscribe = orderService.subscribe(
      constraints,
      (incomingOrders) => {
        // Si hay storeId, también incluir órdenes sin storeId (null/undefined)
        // para que se muestren en todas las tiendas
        let filteredOrders = incomingOrders;
        if (storeId) {
          filteredOrders = incomingOrders.filter(order => 
            !order.storeId || order.storeId === storeId
          );
        }
        
        setOrders(filteredOrders);
        setIsLoading(false);
        setError(null);
      },
      (_err) => {
        setError('Error al cargar órdenes');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  return { orders, isLoading, error };
};

export const useOrders = (storeId?: string) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    filters: {
      storeIds: storeId ? [storeId] : [],
    },
    page: 1,
    limit: 10,
  });

  // Usar suscripción en tiempo real
  const { orders, isLoading, error } = useOrderSubscription(storeId);

  // Obtener una orden específica
  const getOrder = useCallback((orderId: string) => {
    return queryClient.fetchQuery({
      queryKey: ['order', orderId],
      queryFn: () => orderService.getOrder(orderId),
    });
  }, [queryClient]);

  // Actualizar orden
  const updateMutation = useMutation({
    mutationFn: ({ orderId, updates }: { orderId: string; updates: OrderUpdate }) => 
      orderService.updateOrder(orderId, updates),
    onSuccess: () => {
      toast.success('Orden actualizada con éxito');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar orden: ${error.message}`);
    },
  });

  // Actualizar estado de la orden
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: OrderStatus; notes?: string }) => 
      orderService.updateOrderStatus(orderId, status, notes),
    onSuccess: (_, variables) => {
      toast.success(`Estado de orden actualizado a: ${variables.status}`);
      // No es necesario invalidar, la suscripción se actualiza sola
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar estado: ${error.message}`);
    },
  });

  // Actualizar estado de pago
  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => 
      orderService.updatePaymentStatus(orderId, status, notes),
    onSuccess: (_, variables) => {
      toast.success(`Estado de pago actualizado a: ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar estado de pago: ${error.message}`);
    },
  });

  // Actualizar estado de envío
  const updateFulfillmentStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => 
      orderService.updateFulfillmentStatus(orderId, status, notes),
    onSuccess: (_, variables) => {
      toast.success(`Estado de envío actualizado a: ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar estado de envío: ${error.message}`);
    },
  });

  // Procesar reembolso
  const processRefundMutation = useMutation({
    mutationFn: ({ orderId, refundData }: { orderId: string; refundData: RefundRequest }) => 
      orderService.processRefund(orderId, refundData),
    onSuccess: () => {
      toast.success('Reembolso procesado con éxito');
    },
    onError: (error: Error) => {
      toast.error(`Error al procesar reembolso: ${error.message}`);
    },
  });

  // Analíticas de órdenes
  const {
    data: orderAnalytics,
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: ['orderAnalytics', storeId],
    queryFn: () => orderService.getOrderAnalytics(storeId || ''),
    enabled: !!storeId,
  });

  // Funciones de utilidad
  const updateSearchParams = useCallback((newParams: Partial<OrderSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      filters: {
        ...prev.filters,
        ...newParams.filters,
      }
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchParams({
      filters: {
        storeId: storeId,
      },
      page: 1,
      limit: 10,
    });
  }, [storeId]);

  const setPage = useCallback((page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setSearchParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setSearchParams(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const setFilters = useCallback((filters: Partial<OrderFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters,
      },
      page: 1,
    }));
  }, []);

  const refetch = useCallback(() => {
    // La suscripción se actualiza automáticamente
  }, []);

  // Filtrar y paginar órdenes client-side
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Búsqueda por texto
    if (searchParams.query) {
      const searchTerm = searchParams.query.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customer.email.toLowerCase().includes(searchTerm) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm)
      );
    }

    // Filtros de estado
    if (searchParams.filters?.status?.length) {
      filtered = filtered.filter(order =>
        searchParams.filters!.status!.includes(order.status)
      );
    }

    if (searchParams.filters?.paymentStatus?.length) {
      filtered = filtered.filter(order =>
        searchParams.filters!.paymentStatus!.includes(order.paymentStatus)
      );
    }

    if (searchParams.filters?.fulfillmentStatus?.length) {
      filtered = filtered.filter(order =>
        searchParams.filters!.fulfillmentStatus!.includes(order.fulfillmentStatus)
      );
    }

    // Filtros de fecha
    if (searchParams.filters?.dateRange) {
      const { start, end } = searchParams.filters.dateRange;
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Filtros de monto
    if (searchParams.filters?.amountRange) {
      const { min, max } = searchParams.filters.amountRange;
      filtered = filtered.filter(order =>
        order.totalAmount >= min && order.totalAmount <= max
      );
    }

    // Ordenamiento
    const sortBy = searchParams.sortBy || 'created_at';
    const sortOrder = searchParams.sortOrder || 'desc';
    
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'total_amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'order_number':
          comparison = a.orderNumber.localeCompare(b.orderNumber);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginación
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = filtered.slice(startIndex, startIndex + limit);

    // Calcular agregaciones
    const totalRevenue = filtered.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;

    const statusCounts: Record<OrderStatus, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      partially_refunded: 0,
    };

    filtered.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return {
      data: paginatedOrders,
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
        averageOrderValue,
        statusCounts,
      },
    };
  }, [orders, searchParams]);

  return {
    // Datos
    orders: filteredOrders.data,
    pagination: filteredOrders.pagination,
    aggregations: filteredOrders.aggregations,
    orderAnalytics,
    isLoading,
    isLoadingAnalytics,
    isError: !!error,
    error,

    // Acciones
    getOrder,
    updateOrder: updateMutation.mutate,
    updateOrderStatus: updateStatusMutation.mutate,
    updatePaymentStatus: updatePaymentStatusMutation.mutate,
    updateFulfillmentStatus: updateFulfillmentStatusMutation.mutate,
    processRefund: processRefundMutation.mutate,

    // Estado de las mutaciones
    isUpdating: updateMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingPayment: updatePaymentStatusMutation.isPending,
    isUpdatingFulfillment: updateFulfillmentStatusMutation.isPending,
    isProcessingRefund: processRefundMutation.isPending,

    // Gestión de búsqueda y filtros
    searchParams,
    updateSearchParams,
    resetFilters,
    setPage,
    setLimit,
    setSortBy,
    setFilters,
    refetch,
  };
};

export default useOrders;

