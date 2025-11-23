// Servicio para gestión de productos
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit as firestoreLimit,
  onSnapshot,
  orderBy,
  query,
  type QuerySnapshot,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type {
  Brand,
  Category,
  PaginatedProductResponse,
  Product,
  ProductSearchParams,
} from '@/types'

// Tipo para estadísticas de productos
export interface ProductStatSummary {
  totalProducts: number
  activeProducts: number
  draftProducts: number
  outOfStockProducts: number
  totalValue: number
}

class ProductService {
  // ============= GESTIÓN DE PRODUCTOS =============
  
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'totalInventory'>): Promise<string> {
    try {
      const cleanData = this.cleanObject(productData)

      const now = new Date()
      const data = {
        ...cleanData,
        totalInventory: 0,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(collection(db, 'products'), data)

      if (data.categoryId) {
        await this.incrementCategoryProductCount(data.categoryId, 1)
      }

      return docRef.id
    } catch (error) {
      this.handleError('creating product', error)
      throw error
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      const cleanUpdates = this.cleanObject(updates)
      cleanUpdates.updatedAt = new Date()

      const docRef = doc(db, 'products', productId)
      await updateDoc(docRef, cleanUpdates)
    } catch (error) {
      this.handleError('updating product', error)
      throw error
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId)
      const productSnap = await getDoc(productRef)

      if (productSnap.exists()) {
        const product = productSnap.data() as Product
        if (product.categoryId) {
          await this.incrementCategoryProductCount(product.categoryId, -1)
        }
        if (product.storeId) {
          await this.logAuditEvent({
            action: 'delete',
            resource: 'product',
            resourceId: productId,
            storeId: product.storeId,
            oldValues: product as unknown as Record<string, unknown>,
          })
        }
      }

      await deleteDoc(productRef)
    } catch (error) {
      this.handleError('deleting product', error)
      throw error
    }
  }

  async getProduct(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data() as Product
      return { ...data, id: docSnap.id }
    } catch (error) {
      this.handleError('getting product', error)
      throw error
    }
  }

  subscribe(
    constraints: Parameters<typeof query>[1][] = [],
    onNext: (items: Product[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = query(collection(db, 'products'), ...(constraints as any[]))

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const items = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as Product[]
        onNext(items)
      },
      (error) => {
        // Error subscribing to products
        onError?.(error)
      },
    )

    return unsubscribe
  }

  async getProductsByStore(storeId: string, productType?: Product['type']): Promise<Product[]> {
    try {
      let q = query(collection(db, 'products'), where('storeId', '==', storeId), orderBy('createdAt', 'desc'))

      if (productType) {
        q = query(q, where('type', '==', productType))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Product, 'id'>
        return {
          ...data,
          id: docSnapshot.id,
        }
      })
    } catch (error) {
      this.handleError('getting products by store', error)
      throw error
    }
  }

  async searchProducts(params: ProductSearchParams): Promise<PaginatedProductResponse> {
    try {
      const constraints: Parameters<typeof query> = [collection(db, 'products')]

      if (params.filters?.storeId) {
        constraints.push(where('storeId', '==', params.filters.storeId))
      }

      if (params.filters?.type) {
        constraints.push(where('type', '==', params.filters.type))
      }

      if (params.filters?.categoryIds?.length) {
        const [primaryCategoryId, ...additionalIds] = params.filters.categoryIds
        constraints.push(where('categoryId', '==', primaryCategoryId))

        if (additionalIds.length > 0) {
          constraints.push(where('subcategoryId', 'in', additionalIds.slice(0, 10)))
        }
      }

      if (params.filters?.status?.length) {
        constraints.push(where('status', 'in', params.filters.status))
      }

      if (params.filters?.isFeatured !== undefined) {
        constraints.push(where('isFeatured', '==', params.filters.isFeatured))
      }

      if (params.filters?.hasStock !== undefined) {
        constraints.push(where('totalInventory', params.filters.hasStock ? '>' : '==', params.filters.hasStock ? 0 : 0))
      }

      const sortBy = params.sortBy || 'createdAt'
      const sortOrder = params.sortOrder || 'desc'
      constraints.push(orderBy(sortBy, sortOrder))

      const page = Math.max(params.page || 1, 1)
      const limit = Math.min(Math.max(params.limit || 20, 1), 100)
      
      constraints.push(firestoreLimit(limit))

      const q = query(...constraints)
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Product, 'id'>
        return {
          ...data,
          id: docSnapshot.id,
        }
      })

      const countConstraints: Parameters<typeof query> = [collection(db, 'products')]
      if (params.filters?.storeId) {
        countConstraints.push(where('storeId', '==', params.filters.storeId))
      }
      if (params.filters?.type) {
        countConstraints.push(where('type', '==', params.filters.type))
      }
      if (params.filters?.status?.length) {
        countConstraints.push(where('status', 'in', params.filters.status))
      }
      const countSnapshot = await getCountFromServer(query(...countConstraints))
      const total = countSnapshot.data().count

      const summary = {
        totalValue: products.reduce((sum, product) => sum + (product.basePrice || 0), 0),
        averagePrice:
          products.length > 0
            ? products.reduce((sum, product) => sum + (product.basePrice || 0), 0) / products.length
            : 0,
        stockStatus: {
          inStock: products.filter((product) => product.totalInventory > 0).length,
          lowStock: products.filter((product) => product.totalInventory > 0 && product.totalInventory <= 5).length,
          outOfStock: products.filter((product) => product.totalInventory === 0).length,
        },
      }

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        aggregations: summary,
      }
    } catch (error) {
      this.handleError('searching products', error)
      throw error
    }
  }

  // ============= GESTIÓN DE CATEGORÍAS =============

  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>): Promise<string> {
    try {
      const cleanData = this.cleanObject(categoryData)

      const data = {
        ...cleanData,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'categories'), data);

      return docRef.id;
    } catch (error) {
      this.handleError('creating category', error)
    }
  }

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    try {
      const cleanUpdates = this.cleanObject(updates)

      const docRef = doc(db, 'categories', categoryId);
      await updateDoc(docRef, {
        ...cleanUpdates,
        updatedAt: new Date()
      });
    } catch (error) {
      this.handleError('updating category', error)
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Verificar si la categoría tiene productos
      const productsInCategory = await getDocs(
        query(
          collection(db, 'products'),
          where('categoryId', '==', categoryId)
        )
      );

      if (!productsInCategory.empty) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${productsInCategory.size} producto(s) asociado(s)`);
      }

      // Verificar si la categoría tiene subcategorías
      const subcategories = await getDocs(
        query(
          collection(db, 'categories'),
          where('parentId', '==', categoryId)
        )
      );

      if (!subcategories.empty) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${subcategories.size} subcategoría(s)`);
      }

      // Si pasa todas las validaciones, eliminar la categoría
      const docRef = doc(db, 'categories', categoryId);
      await deleteDoc(docRef);
    } catch (error) {
      this.handleError('deleting category', error);
      throw error;
    }
  }

  async getCategoriesByStore(storeId: string): Promise<Category[]> {
    try {
      const q = query(
        collection(db, 'categories'),
        where('storeId', '==', storeId),
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data() as Omit<Category, 'id'>
        return {
          ...data,
          id: docSnapshot.id,
        }
      });
    } catch (_error) {
      return [] // Retornar array vacío en caso de error
    }
  }

  subscribeToCategories(
    constraints: unknown[] = [],
    onNext: (items: Category[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = query(collection(db, 'categories'), ...(constraints as any[]))

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const items = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as Category[]
        onNext(items)
      },
      (error) => {
        onError?.(error)
      },
    )

    return unsubscribe
  }

  // ============= GESTIÓN DE MARCAS =============

  async createBrand(brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>): Promise<string> {
    try {
      const data = {
        ...brandData,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'brands'), data);
      return docRef.id;
    } catch (error) {
      this.handleError('creating brand', error)
    }
  }

  async updateBrand(brandId: string, updates: Partial<Brand>): Promise<void> {
    try {
      const docRef = doc(db, 'brands', brandId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      this.handleError('updating brand', error)
    }
  }

  async getBrands(): Promise<Brand[]> {
    try {
      const q = query(collection(db, 'brands'), where('isActive', '==', true), orderBy('name', 'asc'))

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Brand),
      }))
    } catch (error) {
      this.handleError('getting brands', error)
      throw error
    }
  }

  // ============= GESTIÓN DE VARIACIONES =============

  async updateProductVariations(productId: string, variations: Record<string, unknown>[]): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Calcular inventario total
      const totalInventory = variations.reduce((sum, variation) => sum + ((variation.inventoryQuantity as number) || 0), 0);
      
      await updateDoc(productRef, {
        variations,
        totalInventory,
        updatedAt: new Date()
      });
    } catch (error) {
      this.handleError('updating product variations', error)
    }
  }

  // ============= OPERACIONES BULK =============

  async bulkUpdateProducts(productIds: string[], updates: Partial<Product>): Promise<{ success: number; errors: string[] }> {
    try {
      const batch = writeBatch(db);
      const errors: string[] = [];
      let success = 0;

      for (const productId of productIds) {
        try {
          const productRef = doc(db, 'products', productId);
          batch.update(productRef, {
            ...updates,
            updatedAt: new Date()
          });
          success++;
        } catch (error) {
          errors.push(`Product ${productId}: ${error}`);
        }
      }

      await batch.commit();
      return { success, errors };
    } catch (error) {
      this.handleError('bulk updating products', error)
    }
  }

  async bulkDeleteProducts(productIds: string[]): Promise<{ success: number; errors: string[] }> {
    try {
      const batch = writeBatch(db);
      const errors: string[] = [];
      let success = 0;

      for (const productId of productIds) {
        try {
          const productRef = doc(db, 'products', productId);
          batch.delete(productRef);
          success++;
        } catch (error) {
          errors.push(`Product ${productId}: ${error}`);
        }
      }

      await batch.commit();
      return { success, errors };
    } catch (error) {
      this.handleError('bulk deleting products', error)
    }
  }

  // ============= UTILIDADES =============

  async updateProductInventory(productId: string): Promise<void> {
    try {
      // Obtener todas las variaciones del producto
      const product = await this.getProduct(productId);
      if (!product) return;

      // Calcular inventario total basado en las variaciones
      const totalInventory = product.variations.reduce((sum, variation) => sum + (variation.inventoryQuantity || 0), 0);
      
      // Actualizar el producto
      await this.updateProduct(productId, { totalInventory });
    } catch (error) {
      this.handleError('updating product inventory', error)
    }
  }

  async duplicateProduct(sourceProductId: string, newName: string, newSlug: string): Promise<string> {
    try {
      const sourceProduct = await this.getProduct(sourceProductId);
      if (!sourceProduct) {
        throw new Error('Source product not found');
      }

      const { id, createdAt, updatedAt, createdBy, updatedBy, ...productData } = sourceProduct;
      
      return await this.createProduct({
        ...productData,
        name: newName,
        slug: newSlug,
        status: 'draft',
        createdBy: 'system',
        updatedBy: 'system'
      });
    } catch (error) {
      this.handleError('duplicating product', error)
    }
  }

  async getProductStats(storeId: string): Promise<ProductStatSummary> {
    try {
      const products = await this.getProductsByStore(storeId)

      return {
        totalProducts: products.length,
        publishedProducts: products.filter((product) => product.status === 'published').length,
        draftProducts: products.filter((product) => product.status === 'draft').length,
        outOfStockProducts: products.filter((product) => product.totalInventory === 0).length,
        totalValue: products.reduce((sum, product) => sum + (product.basePrice || 0), 0),
      }
    } catch (error) {
      this.handleError('getting product stats', error)
      throw error
    }
  }

  // ============= UTILIDADES PRIVADAS =============

  private cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key as keyof T] = value as T[keyof T]
      }
    }
    return cleaned
  }

  private handleError(operation: string, error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Error ${operation}: ${errorMessage}`)
  }

  private async incrementCategoryProductCount(categoryId: string, incrementValue: number): Promise<void> {
    try {
      const categoryRef = doc(db, 'categories', categoryId)
      await updateDoc(categoryRef, {
        productCount: increment(incrementValue)
      })
    } catch {
      // No lanzar error aquí para no interrumpir el flujo principal
    }
  }

  private async logAuditEvent(event: {
    action: string
    resource: string
    resourceId: string
    storeId: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        ...event,
        timestamp: new Date(),
        userId: 'system' // TODO: Obtener userId del contexto de autenticación
      })
    } catch {
      // No lanzar error aquí para no interrumpir el flujo principal
    }
  }
}

export const productService = new ProductService();
export default productService;