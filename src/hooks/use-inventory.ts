import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import inventoryService from '@/services/inventoryService';
import type {
  InventoryLocation,
  StockItem,
  StockMovement,
  InventorySearchParams,
  InventoryFilters,
  StockTransfer
} from '@/types';

export const useInventory = (storeId?: string) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<InventorySearchParams>({
    filters: {
      storeId: storeId,
    },
    page: 1,
    limit: 10,
  });

  // Consulta principal para obtener inventario
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['inventory', searchParams],
    queryFn: () => inventoryService.searchStock(searchParams),
    enabled: !!storeId,
  });

  // Obtener ubicaciones
  const {
    data: locations,
    isLoading: isLoadingLocations,
  } = useQuery({
    queryKey: ['inventoryLocations', storeId],
    queryFn: () => inventoryService.getLocationsByStore(storeId || ''),
    enabled: !!storeId,
  });

  // Crear ubicación
  const createLocationMutation = useMutation({
    mutationFn: (locationData: Omit<InventoryLocation, 'id' | 'storeId' | 'currentStock' | 'createdAt' | 'updatedAt'>) => 
      inventoryService.createLocation(storeId || '', locationData),
    onSuccess: () => {
      toast.success('Ubicación creada con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventoryLocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al crear ubicación: ${error.message}`);
    },
  });

  // Actualizar ubicación
  const updateLocationMutation = useMutation({
    mutationFn: ({ locationId, updates }: { locationId: string; updates: Partial<InventoryLocation> }) => 
      inventoryService.updateLocation(locationId, updates),
    onSuccess: () => {
      toast.success('Ubicación actualizada con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventoryLocations'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar ubicación: ${error.message}`);
    },
  });

  // Añadir stock
  const addStockMutation = useMutation({
    mutationFn: (stockData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt' | 'lastMovementAt' | 'availableQuantity'>) => 
      inventoryService.addStock(stockData),
    onSuccess: () => {
      toast.success('Stock añadido con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al añadir stock: ${error.message}`);
    },
  });

  // Actualizar cantidad de stock
  const updateStockQuantityMutation = useMutation({
    mutationFn: ({ 
      stockItemId, 
      newQuantity, 
      reason, 
      userId, 
      userName 
    }: { 
      stockItemId: string; 
      newQuantity: number; 
      reason: string; 
      userId: string; 
      userName: string 
    }) => 
      inventoryService.updateStockQuantity(stockItemId, newQuantity, reason, userId, userName),
    onSuccess: () => {
      toast.success('Cantidad de stock actualizada con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar cantidad: ${error.message}`);
    },
  });

  // Reservar stock
  const reserveStockMutation = useMutation({
    mutationFn: ({ 
      stockItemId, 
      quantity, 
      userId, 
      userName 
    }: { 
      stockItemId: string; 
      quantity: number; 
      userId: string; 
      userName: string 
    }) => 
      inventoryService.reserveStock(stockItemId, quantity, userId, userName),
    onSuccess: () => {
      toast.success('Stock reservado con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al reservar stock: ${error.message}`);
    },
  });

  // Liberar stock reservado
  const releaseReservedStockMutation = useMutation({
    mutationFn: ({ 
      stockItemId, 
      quantity, 
      userId, 
      userName 
    }: { 
      stockItemId: string; 
      quantity: number; 
      userId: string; 
      userName: string 
    }) => 
      inventoryService.releaseReservedStock(stockItemId, quantity, userId, userName),
    onSuccess: () => {
      toast.success('Reserva de stock liberada con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al liberar reserva: ${error.message}`);
    },
  });

  // Crear transferencia
  const createTransferMutation = useMutation({
    mutationFn: (transferData: Omit<StockTransfer, 'id' | 'createdAt' | 'updatedAt'>) => 
      inventoryService.createTransfer(transferData),
    onSuccess: () => {
      toast.success('Transferencia creada con éxito');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al crear transferencia: ${error.message}`);
    },
  });

  // Procesar transferencia
  const processTransferMutation = useMutation({
    mutationFn: ({ 
      transferId, 
      action, 
      userId, 
      userName 
    }: { 
      transferId: string; 
      action: 'ship' | 'receive'; 
      userId: string; 
      userName: string 
    }) => 
      inventoryService.processTransfer(transferId, action, userId, userName),
    onSuccess: (_, variables) => {
      const actionText = variables.action === 'ship' ? 'enviada' : 'recibida';
      toast.success(`Transferencia ${actionText} con éxito`);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al procesar transferencia: ${error.message}`);
    },
  });

  // Obtener movimientos de stock
  const getStockMovements = useCallback((stockItemId: string) => {
    return queryClient.fetchQuery({
      queryKey: ['stockMovements', stockItemId],
      queryFn: () => inventoryService.getStockMovements(stockItemId),
    });
  }, [queryClient]);

  // Obtener stock por producto
  const getStockByProduct = useCallback((productId: string) => {
    return queryClient.fetchQuery({
      queryKey: ['productStock', productId],
      queryFn: () => inventoryService.getStockByProduct(productId, storeId || ''),
      enabled: !!storeId,
    });
  }, [queryClient, storeId]);

  // Obtener stock por variación
  const getStockByVariation = useCallback((productId: string, variationId: string) => {
    return queryClient.fetchQuery({
      queryKey: ['variationStock', productId, variationId],
      queryFn: () => inventoryService.getStockByVariation(productId, variationId, storeId || ''),
      enabled: !!storeId,
    });
  }, [queryClient, storeId]);

  // Funciones de utilidad
  const updateSearchParams = useCallback((newParams: Partial<InventorySearchParams>) => {
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

  const setFilters = useCallback((filters: Partial<InventoryFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters,
      },
      page: 1,
    }));
  }, []);

  return {
    // Datos
    inventory: data?.data || [],
    pagination: data?.pagination,
    summary: data?.summary,
    locations: locations || [],
    isLoading,
    isLoadingLocations,
    isError,
    error,

    // Acciones para ubicaciones
    createLocation: createLocationMutation.mutate,
    updateLocation: updateLocationMutation.mutate,

    // Acciones para stock
    addStock: addStockMutation.mutate,
    updateStockQuantity: updateStockQuantityMutation.mutate,
    reserveStock: reserveStockMutation.mutate,
    releaseReservedStock: releaseReservedStockMutation.mutate,
    
    // Acciones para transferencias
    createTransfer: createTransferMutation.mutate,
    processTransfer: processTransferMutation.mutate,
    
    // Consultas específicas
    getStockMovements,
    getStockByProduct,
    getStockByVariation,

    // Estado de las mutaciones
    isCreatingLocation: createLocationMutation.isPending,
    isUpdatingLocation: updateLocationMutation.isPending,
    isAddingStock: addStockMutation.isPending,
    isUpdatingStockQuantity: updateStockQuantityMutation.isPending,
    isReservingStock: reserveStockMutation.isPending,
    isReleasingStock: releaseReservedStockMutation.isPending,
    isCreatingTransfer: createTransferMutation.isPending,
    isProcessingTransfer: processTransferMutation.isPending,

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

export default useInventory;


