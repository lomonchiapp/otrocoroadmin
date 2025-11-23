import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { where, orderBy } from 'firebase/firestore';

import productService from '@/services/productService';
import type { Category } from '@/types';

// Hook para suscripción a categorías en tiempo real
export const useCategorySubscription = (storeId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const constraints = [
      where('storeId', '==', storeId),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    ];

    const unsubscribe = productService.subscribeToCategories(
      constraints,
      (incomingCategories) => {
        setCategories(incomingCategories);
        setIsLoading(false);
        setError(null);
      },
      (_err) => {
        setError('Error al cargar categorías');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  return { categories, isLoading, error };
};

export const useCategories = (storeId?: string) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Usar suscripción en tiempo real
  const { categories, isLoading, error } = useCategorySubscription(storeId);

  const refetch = useCallback(() => {
    // Para refetch manual, no es necesario hacer nada
    // La suscripción se actualiza automáticamente
  }, []);

  // Crear categoría
  const createMutation = useMutation({
    mutationFn: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => 
      productService.createCategory(categoryData),
    onSuccess: () => {
      toast.success('Categoría creada con éxito');
      // No es necesario invalidar queries, la suscripción se actualiza sola
    },
    onError: (error: Error) => {
      toast.error(`Error al crear categoría: ${error.message}`);
    },
  });

  // Actualizar categoría
  const updateMutation = useMutation({
    mutationFn: ({ categoryId, updates }: { categoryId: string; updates: Partial<Category> }) => 
      productService.updateCategory(categoryId, updates),
    onSuccess: () => {
      toast.success('Categoría actualizada con éxito');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar categoría: ${error.message}`);
    },
  });

  // Eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => 
      productService.deleteCategory(categoryId),
    onSuccess: () => {
      toast.success('Categoría eliminada con éxito');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar categoría: ${error.message}`);
    },
  });

  // Utilidades para trabajar con la estructura jerárquica
  const getRootCategories = useCallback(() => {
    return categories?.filter(cat => !cat.parentId) || [];
  }, [categories]);

  const getSubcategories = useCallback((parentId: string) => {
    return categories?.filter(cat => cat.parentId === parentId) || [];
  }, [categories]);

  const getCategoryPath = useCallback((categoryId: string): Category[] => {
    const path: Category[] = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = categories?.find(cat => cat.id === currentId);
      if (!category) break;
      
      path.unshift(category);
      currentId = category.parentId || '';
    }
    
    return path;
  }, [categories]);

  const getCategoryById = useCallback((categoryId: string) => {
    return categories?.find(cat => cat.id === categoryId);
  }, [categories]);

  // Organizar categorías en estructura jerárquica
  const getCategoryTree = useCallback(() => {
    if (!categories) return [];
    
    const buildTree = (parentId?: string, level = 0): any[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          level,
          children: buildTree(cat.id, level + 1)
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    };
    
    return buildTree();
  }, [categories]);

  // Utilidades para la UI
  const selectCategory = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  return {
    // Datos
    categories: categories || [],
    categoryTree: getCategoryTree(),
    selectedCategory,
    isLoading,
    isError: !!error,
    error,

    // Acciones CRUD
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,

    // Estado de las mutaciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Utilidades
    getRootCategories,
    getSubcategories,
    getCategoryPath,
    getCategoryById,
    selectCategory,
    refetch,
  };
};

export default useCategories;

