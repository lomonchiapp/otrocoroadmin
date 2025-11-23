import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { where, orderBy } from 'firebase/firestore';

import productService from '@/services/productService';
import type {
  Product,
  ProductSearchParams,
  ProductFilters,
} from '@/types';

// Hook personalizado para suscripción a productos
export const useProductSubscription = (storeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 useProductSubscription - storeId recibido:', storeId)
    
    if (!storeId) {
      console.warn('⚠️ useProductSubscription - NO HAY STOREID, no se pueden traer productos')
      setProducts([]);
      setIsLoading(false);
      return;
    }

    console.log('🔄 useProductSubscription - Iniciando suscripción para store:', storeId)
    setIsLoading(true);
    setError(null);

    // ✅ FILTRAR POR STORE ID
    const constraints = [
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    ];

    const unsubscribe = productService.subscribe(
      constraints,
      (incomingProducts) => {
        console.log('✅ useProductSubscription - Productos recibidos:', incomingProducts.length, 'productos para store:', storeId)
        console.log('📦 Primeros 3 productos:', incomingProducts.slice(0, 3).map(p => ({ id: p.id, name: p.name, storeId: p.storeId })))
        setProducts(incomingProducts);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ useProductSubscription - Error en suscripción:', err)
        setError('Error al cargar productos');
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🔌 useProductSubscription - Cerrando suscripción para store:', storeId)
      unsubscribe();
    };
  }, [storeId]);

  return {
    products,
    isLoading,
    error,
    refetch: () => {
      // Con suscripción en tiempo real, no es necesario refetch manual
      // Los datos se actualizan automáticamente
      // Solo resetear el error si existe
      if (error) {
        setError(null);
      }
    }
  };
};

export const useProducts = (storeId?: string) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    filters: {
      storeId: storeId,
    },
    page: 1,
    limit: 10,
  });

  // Usar la nueva suscripción para obtener productos en tiempo real
  const { products, isLoading, error, refetch } = useProductSubscription(storeId);

  // Obtener un producto específico
  const getProduct = useCallback((productId: string) => {
    return queryClient.fetchQuery({
      queryKey: ['product', productId],
      queryFn: () => productService.getProduct(productId),
    });
  }, [queryClient]);

  // Crear producto
  const createMutation = useMutation({
    mutationFn: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'totalInventory'>) => 
      productService.createProduct(productData),
    onSuccess: () => {
      toast.success('Producto creado con éxito');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al crear producto: ${error.message}`);
    },
  });

  // Actualizar producto
  const updateMutation = useMutation({
    mutationFn: ({ productId, updates }: { productId: string; updates: Partial<Product> }) => 
      productService.updateProduct(productId, updates),
    onSuccess: (_, variables) => {
      toast.success('Producto actualizado con éxito');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar producto: ${error.message}`);
    },
  });

  // Eliminar producto
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Producto eliminado con éxito');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar producto: ${error.message}`);
    },
  });

  // Operaciones en lote
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ productIds, updates }: { productIds: string[]; updates: Partial<Product> }) => 
      productService.bulkUpdateProducts(productIds, updates),
    onSuccess: (result) => {
      toast.success(`${result.success} productos actualizados con éxito`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} productos no pudieron ser actualizados`);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(`Error en actualización masiva: ${error.message}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (productIds: string[]) => productService.bulkDeleteProducts(productIds),
    onSuccess: (result) => {
      toast.success(`${result.success} productos eliminados con éxito`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} productos no pudieron ser eliminados`);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(`Error en eliminación masiva: ${error.message}`);
    },
  });

  // Duplicar producto
  const duplicateMutation = useMutation({
    mutationFn: ({ sourceProductId, newName, newSlug }: { sourceProductId: string; newName: string; newSlug: string }) => 
      productService.duplicateProduct(sourceProductId, newName, newSlug),
    onSuccess: () => {
      toast.success('Producto duplicado con éxito');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al duplicar producto: ${error.message}`);
    },
  });

  // Actualizar variaciones de producto
  const updateVariationsMutation = useMutation({
    mutationFn: ({ productId, variations }: { productId: string; variations: Record<string, unknown>[] }) => 
      productService.updateProductVariations(productId, variations),
    onSuccess: (_, variables) => {
      toast.success('Variaciones actualizadas con éxito');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar variaciones: ${error.message}`);
    },
  });

  // Estadísticas de productos
  const {
    data: productStats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['productStats', storeId],
    queryFn: () => productService.getProductStats(storeId || ''),
    enabled: !!storeId,
  });

  // Funciones de utilidad para gestión de parámetros
  const updateSearchParams = useCallback((newParams: Partial<ProductSearchParams>) => {
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

  const setSortBy = useCallback((sortBy: ProductSearchParams['sortBy'], sortOrder: 'asc' | 'desc' = 'desc') => {
    setSearchParams(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const setFilters = useCallback((filters: Partial<ProductFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters,
      },
      page: 1,
    }));
  }, []);

  // Calcular datos basados en la suscripción
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Aplicar filtros de búsqueda
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Aplicar filtros de categoría
    if (searchParams.filters?.categoryIds?.length) {
      const [primaryCategory, ...additionalCategories] = searchParams.filters.categoryIds;
      filtered = filtered.filter(product =>
        product.categoryId === primaryCategory ||
        (additionalCategories.length > 0 && additionalCategories.includes(product.subcategoryId || ''))
      );
    }

    // Aplicar filtros de estado
    if (searchParams.filters?.status?.length) {
      filtered = filtered.filter(product =>
        searchParams.filters!.status!.includes(product.status)
      );
    }

    // Aplicar filtros de featured
    if (searchParams.filters?.isFeatured !== undefined) {
      filtered = filtered.filter(product =>
        product.isFeatured === searchParams.filters!.isFeatured
      );
    }

    // Aplicar filtros de stock
    if (searchParams.filters?.hasStock !== undefined) {
      filtered = filtered.filter(product =>
        searchParams.filters!.hasStock ? product.totalInventory > 0 : product.totalInventory === 0
      );
    }

    // Aplicar filtros de precio
    if (searchParams.filters?.priceRange) {
      const { min, max } = searchParams.filters.priceRange;
      filtered = filtered.filter(product =>
        (product.basePrice || 0) >= min && (product.basePrice || 0) <= max
      );
    }

    // Ordenar
    const sortBy = searchParams.sortBy || 'created_at';
    const sortOrder = searchParams.sortOrder || 'desc';
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.basePrice || 0) - (b.basePrice || 0);
          break;
        case 'created_at':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'inventory_quantity':
          comparison = a.totalInventory - b.totalInventory;
          break;
        case 'featured':
          comparison = (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginación
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    const summary = {
      totalValue: filtered.reduce((sum, product) => sum + (product.basePrice || 0), 0),
      averagePrice: filtered.length > 0 ? filtered.reduce((sum, product) => sum + (product.basePrice || 0), 0) / filtered.length : 0,
      stockStatus: {
        inStock: filtered.filter(p => p.totalInventory > 0).length,
        lowStock: filtered.filter(p => p.totalInventory > 0 && p.totalInventory <= 5).length,
        outOfStock: filtered.filter(p => p.totalInventory === 0).length
      }
    };

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: page * limit < filtered.length,
        hasPrev: page > 1
      },
      aggregations: summary
    };
  }, [products, searchParams]);

  return {
    // Datos
    products: filteredProducts.data,
    pagination: filteredProducts.pagination,
    aggregations: filteredProducts.aggregations,
    productStats,
    isLoading,
    isLoadingStats,
    isError: !!error,
    error,

    // Acciones CRUD
    getProduct,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    bulkUpdateProducts: bulkUpdateMutation.mutate,
    bulkDeleteProducts: bulkDeleteMutation.mutate,
    duplicateProduct: duplicateMutation.mutate,
    updateProductVariations: updateVariationsMutation.mutate,

    // Estado de las mutaciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isUpdatingVariations: updateVariationsMutation.isPending,

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

export default useProducts;
