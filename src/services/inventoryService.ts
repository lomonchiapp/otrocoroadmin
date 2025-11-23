// Servicio para gestión de inventario y stock
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  InventoryLocation,
  StockItem,
  StockMovement,
  StockAdjustment,
  StockTransfer,
  LowStockAlert,
  InventoryFilters,
  InventorySearchParams,
  PaginatedInventoryResponse,
  InventoryStatus,
  LocationType,
  StockMovementType
} from '@/types';

class InventoryService {
  // ============= GESTIÓN DE UBICACIONES =============
  
  async createLocation(storeId: string, locationData: Omit<InventoryLocation, 'id' | 'storeId' | 'currentStock' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const data = {
        ...locationData,
        storeId,
        currentStock: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'inventory_locations'), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  async updateLocation(locationId: string, updates: Partial<InventoryLocation>): Promise<void> {
    try {
      const docRef = doc(db, 'inventory_locations', locationId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async getLocationsByStore(storeId: string): Promise<InventoryLocation[]> {
    try {
      const q = query(
        collection(db, 'inventory_locations'),
        where('storeId', '==', storeId),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryLocation));
    } catch (error) {
      console.error('Error getting locations by store:', error);
      throw error;
    }
  }

  // ============= GESTIÓN DE STOCK =============

  async addStock(stockData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt' | 'lastMovementAt' | 'availableQuantity'>): Promise<string> {
    try {
      const data = {
        ...stockData,
        availableQuantity: stockData.quantity - stockData.reservedQuantity,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMovementAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'stock_items'), data);
      
      // Crear movimiento de entrada
      await this.createStockMovement({
        storeId: stockData.storeId,
        stockItemId: docRef.id,
        productId: stockData.productId,
        variationId: stockData.variationId,
        type: 'inbound',
        quantity: stockData.quantity,
        previousQuantity: 0,
        newQuantity: stockData.quantity,
        reason: 'Stock inicial',
        userId: stockData.createdBy,
        userName: 'Sistema'
      });

      // Actualizar contador de ubicación
      await this.updateLocationStockCount(stockData.locationId, stockData.quantity);

      return docRef.id;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  }

  async updateStockQuantity(stockItemId: string, newQuantity: number, reason: string, userId: string, userName: string): Promise<void> {
    try {
      const stockRef = doc(db, 'stock_items', stockItemId);
      const stockDoc = await getDoc(stockRef);
      
      if (!stockDoc.exists()) {
        throw new Error('Stock item not found');
      }

      const stockData = stockDoc.data() as StockItem;
      const previousQuantity = stockData.quantity;
      const quantityDifference = newQuantity - previousQuantity;

      // Actualizar stock
      await updateDoc(stockRef, {
        quantity: newQuantity,
        availableQuantity: newQuantity - stockData.reservedQuantity,
        updatedAt: new Date(),
        lastMovementAt: new Date(),
        updatedBy: userId
      });

      // Crear movimiento
      await this.createStockMovement({
        storeId: stockData.storeId,
        stockItemId,
        productId: stockData.productId,
        variationId: stockData.variationId,
        type: quantityDifference > 0 ? 'inbound' : 'outbound',
        quantity: Math.abs(quantityDifference),
        previousQuantity,
        newQuantity,
        reason,
        userId,
        userName
      });

      // Actualizar contador de ubicación
      await this.updateLocationStockCount(stockData.locationId, quantityDifference);

      // Verificar alertas de bajo stock
      await this.checkLowStockAlert(stockItemId, newQuantity);
    } catch (error) {
      console.error('Error updating stock quantity:', error);
      throw error;
    }
  }

  async reserveStock(stockItemId: string, quantity: number, userId: string, userName: string): Promise<void> {
    try {
      const stockRef = doc(db, 'stock_items', stockItemId);
      const stockDoc = await getDoc(stockRef);
      
      if (!stockDoc.exists()) {
        throw new Error('Stock item not found');
      }

      const stockData = stockDoc.data() as StockItem;
      
      if (stockData.availableQuantity < quantity) {
        throw new Error('Insufficient available stock');
      }

      const newReservedQuantity = stockData.reservedQuantity + quantity;
      const newAvailableQuantity = stockData.quantity - newReservedQuantity;

      await updateDoc(stockRef, {
        reservedQuantity: newReservedQuantity,
        availableQuantity: newAvailableQuantity,
        updatedAt: new Date(),
        lastMovementAt: new Date(),
        updatedBy: userId
      });

      // Crear movimiento de reserva
      await this.createStockMovement({
        storeId: stockData.storeId,
        stockItemId,
        productId: stockData.productId,
        variationId: stockData.variationId,
        type: 'outbound',
        quantity,
        previousQuantity: stockData.quantity,
        newQuantity: stockData.quantity,
        reason: 'Reserva de stock',
        userId,
        userName
      });
    } catch (error) {
      console.error('Error reserving stock:', error);
      throw error;
    }
  }

  async releaseReservedStock(stockItemId: string, quantity: number, userId: string, userName: string): Promise<void> {
    try {
      const stockRef = doc(db, 'stock_items', stockItemId);
      const stockDoc = await getDoc(stockRef);
      
      if (!stockDoc.exists()) {
        throw new Error('Stock item not found');
      }

      const stockData = stockDoc.data() as StockItem;
      
      if (stockData.reservedQuantity < quantity) {
        throw new Error('Cannot release more stock than reserved');
      }

      const newReservedQuantity = stockData.reservedQuantity - quantity;
      const newAvailableQuantity = stockData.quantity - newReservedQuantity;

      await updateDoc(stockRef, {
        reservedQuantity: newReservedQuantity,
        availableQuantity: newAvailableQuantity,
        updatedAt: new Date(),
        lastMovementAt: new Date(),
        updatedBy: userId
      });

      // Crear movimiento de liberación
      await this.createStockMovement({
        storeId: stockData.storeId,
        stockItemId,
        productId: stockData.productId,
        variationId: stockData.variationId,
        type: 'inbound',
        quantity,
        previousQuantity: stockData.quantity,
        newQuantity: stockData.quantity,
        reason: 'Liberación de reserva',
        userId,
        userName
      });
    } catch (error) {
      console.error('Error releasing reserved stock:', error);
      throw error;
    }
  }

  // ============= GESTIÓN DE MOVIMIENTOS =============

  async createStockMovement(movementData: Omit<StockMovement, 'id' | 'createdAt'>): Promise<string> {
    try {
      const data = {
        ...movementData,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'stock_movements'), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  }

  async getStockMovements(stockItemId: string): Promise<StockMovement[]> {
    try {
      const q = query(
        collection(db, 'stock_movements'),
        where('stockItemId', '==', stockItemId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
    } catch (error) {
      console.error('Error getting stock movements:', error);
      throw error;
    }
  }

  // ============= GESTIÓN DE TRANSFERENCIAS =============

  async createTransfer(transferData: Omit<StockTransfer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const data = {
        ...transferData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'stock_transfers'), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  async processTransfer(transferId: string, action: 'ship' | 'receive', userId: string, userName: string): Promise<void> {
    try {
      const transferRef = doc(db, 'stock_transfers', transferId);
      const transferDoc = await getDoc(transferRef);
      
      if (!transferDoc.exists()) {
        throw new Error('Transfer not found');
      }

      const transferData = transferDoc.data() as StockTransfer;
      
      if (action === 'ship') {
        if (transferData.status !== 'pending') {
          throw new Error('Transfer is not in pending status');
        }

        // Actualizar estado a en tránsito
        await updateDoc(transferRef, {
          status: 'in_transit',
          shippedAt: new Date(),
          shippedBy: userId,
          updatedAt: new Date()
        });

        // Reducir stock de ubicación origen
        for (const item of transferData.items) {
          await this.updateStockQuantity(
            item.stockItemId,
            item.quantity - item.quantity,
            `Transferencia enviada - ${transferId}`,
            userId,
            userName
          );
        }
      } else if (action === 'receive') {
        if (transferData.status !== 'in_transit') {
          throw new Error('Transfer is not in transit');
        }

        // Actualizar estado a completado
        await updateDoc(transferRef, {
          status: 'completed',
          receivedAt: new Date(),
          receivedBy: userId,
          updatedAt: new Date()
        });

        // Agregar stock a ubicación destino
        for (const item of transferData.items) {
          await this.addStock({
            storeId: transferData.storeId,
            productId: item.productId,
            variationId: item.variationId,
            locationId: transferData.toLocationId,
            locationName: 'Nueva ubicación', // Obtener nombre real
            quantity: item.quantity,
            reservedQuantity: 0,
            status: 'available',
            variationAttributes: item.variationAttributes,
            receivedAt: new Date(),
            createdBy: userId,
            updatedBy: userId
          });
        }
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
      throw error;
    }
  }

  // ============= GESTIÓN DE ALERTAS =============

  async checkLowStockAlert(stockItemId: string, currentQuantity: number): Promise<void> {
    try {
      const stockRef = doc(db, 'stock_items', stockItemId);
      const stockDoc = await getDoc(stockRef);
      
      if (!stockDoc.exists()) return;

      const stockData = stockDoc.data() as StockItem;
      const threshold = 5; // Configurable

      if (currentQuantity <= threshold) {
        // Crear o actualizar alerta
        const alertQuery = query(
          collection(db, 'low_stock_alerts'),
          where('stockItemId', '==', stockItemId),
          where('status', '==', 'active')
        );
        
        const alertSnapshot = await getDocs(alertQuery);
        
        if (alertSnapshot.empty) {
          // Crear nueva alerta
          await addDoc(collection(db, 'low_stock_alerts'), {
            storeId: stockData.storeId,
            productId: stockData.productId,
            variationId: stockData.variationId,
            stockItemId,
            currentQuantity,
            thresholdQuantity: threshold,
            thresholdType: 'absolute',
            status: 'active',
            notificationSent: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else {
        // Resolver alertas existentes
        const alertQuery = query(
          collection(db, 'low_stock_alerts'),
          where('stockItemId', '==', stockItemId),
          where('status', '==', 'active')
        );
        
        const alertSnapshot = await getDocs(alertQuery);
        const batch = writeBatch(db);
        
        alertSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, {
            status: 'resolved',
            updatedAt: new Date()
          });
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error('Error checking low stock alert:', error);
      throw error;
    }
  }

  // ============= BÚSQUEDA Y FILTROS =============

  async searchStock(params: InventorySearchParams): Promise<PaginatedInventoryResponse> {
    try {
      let q = query(collection(db, 'stock_items'));
      
      if (params.filters?.storeId) {
        q = query(q, where('storeId', '==', params.filters.storeId));
      }
      
      if (params.filters?.locationIds?.length) {
        q = query(q, where('locationId', 'in', params.filters.locationIds));
      }
      
      if (params.filters?.status?.length) {
        q = query(q, where('status', 'in', params.filters.status));
      }
      
      if (params.filters?.lowStock) {
        q = query(q, where('availableQuantity', '<=', 5));
      }

      // Ordenamiento
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      q = query(q, orderBy(sortBy, sortOrder));

      const querySnapshot = await getDocs(q);
      const allItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockItem));

      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = allItems.slice(startIndex, endIndex);

      // Resumen
      const summary = {
        totalValue: allItems.reduce((sum, item) => sum + (item.sellingPrice || 0) * item.quantity, 0),
        totalQuantity: allItems.reduce((sum, item) => sum + item.quantity, 0),
        lowStockCount: allItems.filter(item => item.availableQuantity <= 5).length,
        outOfStockCount: allItems.filter(item => item.availableQuantity <= 0).length
      };

      return {
        data: paginatedItems,
        pagination: {
          page,
          limit,
          total: allItems.length,
          totalPages: Math.ceil(allItems.length / limit),
          hasNext: endIndex < allItems.length,
          hasPrev: page > 1
        },
        summary
      };
    } catch (error) {
      console.error('Error searching stock:', error);
      throw error;
    }
  }

  // ============= UTILIDADES =============

  private async updateLocationStockCount(locationId: string, quantityChange: number): Promise<void> {
    try {
      const locationRef = doc(db, 'inventory_locations', locationId);
      await updateDoc(locationRef, {
        currentStock: increment(quantityChange),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating location stock count:', error);
      throw error;
    }
  }

  async getStockByProduct(productId: string, storeId: string): Promise<StockItem[]> {
    try {
      const q = query(
        collection(db, 'stock_items'),
        where('productId', '==', productId),
        where('storeId', '==', storeId),
        orderBy('locationName', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockItem));
    } catch (error) {
      console.error('Error getting stock by product:', error);
      throw error;
    }
  }

  async getStockByVariation(productId: string, variationId: string, storeId: string): Promise<StockItem[]> {
    try {
      const q = query(
        collection(db, 'stock_items'),
        where('productId', '==', productId),
        where('variationId', '==', variationId),
        where('storeId', '==', storeId),
        orderBy('locationName', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockItem));
    } catch (error) {
      console.error('Error getting stock by variation:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;