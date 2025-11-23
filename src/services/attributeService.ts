// Servicio para gestión de atributos de productos
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
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Attribute,
  AttributeValue
} from '@/types';
import {
  FASHION_ATTRIBUTES_TEMPLATE,
  JEWELRY_ATTRIBUTES_TEMPLATE,
  DEFAULT_ATTRIBUTE_VALUES
} from '@/types';

class AttributeService {
  // ============= GESTIÓN DE ATRIBUTOS =============
  
  async createAttribute(storeId: string, attributeData: Omit<Attribute, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const data = {
        ...attributeData,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'attributes'), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating attribute:', error);
      throw error;
    }
  }

  async updateAttribute(attributeId: string, updates: Partial<Attribute>): Promise<void> {
    try {
      const docRef = doc(db, 'attributes', attributeId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating attribute:', error);
      throw error;
    }
  }

  async deleteAttribute(attributeId: string): Promise<void> {
    try {
      const docRef = doc(db, 'attributes', attributeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting attribute:', error);
      throw error;
    }
  }

  async getAttributesByStore(storeId: string): Promise<Attribute[]> {
    try {
      const q = query(
        collection(db, 'attributes'),
        where('storeId', '==', storeId),
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attribute));
    } catch (error) {
      console.error('Error getting attributes by store:', error);
      throw error;
    }
  }

  async getAttributesByProductType(storeId: string, productType: string): Promise<Attribute[]> {
    try {
      const allAttributes = await this.getAttributesByStore(storeId);
      return allAttributes.filter(attr => 
        attr.productTypes.includes(productType as any) || 
        attr.productTypes.includes('all')
      );
    } catch (error) {
      console.error('Error getting attributes by product type:', error);
      throw error;
    }
  }

  async getVariationAttributes(storeId: string, productType?: string): Promise<Attribute[]> {
    try {
      const attributes = productType 
        ? await this.getAttributesByProductType(storeId, productType)
        : await this.getAttributesByStore(storeId);
        
      return attributes.filter(attr => attr.isVariationAttribute);
    } catch (error) {
      console.error('Error getting variation attributes:', error);
      throw error;
    }
  }

  // ============= GESTIÓN DE VALORES DE ATRIBUTOS =============

  async createAttributeValue(attributeId: string, valueData: Omit<AttributeValue, 'id' | 'attributeId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const data = {
        ...valueData,
        attributeId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'attribute_values'), data);
      
      // Actualizar el atributo para incluir este valor
      await this.addValueToAttribute(attributeId, docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating attribute value:', error);
      throw error;
    }
  }

  async updateAttributeValue(valueId: string, updates: Partial<AttributeValue>): Promise<void> {
    try {
      const docRef = doc(db, 'attribute_values', valueId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating attribute value:', error);
      throw error;
    }
  }

  async deleteAttributeValue(valueId: string): Promise<void> {
    try {
      // Obtener el valor para saber a qué atributo pertenece
      const valueDoc = await getDoc(doc(db, 'attribute_values', valueId));
      if (valueDoc.exists()) {
        const valueData = valueDoc.data() as AttributeValue;
        
        // Remover del atributo
        await this.removeValueFromAttribute(valueData.attributeId, valueId);
        
        // Eliminar el valor
        await deleteDoc(doc(db, 'attribute_values', valueId));
      }
    } catch (error) {
      console.error('Error deleting attribute value:', error);
      throw error;
    }
  }

  private async addValueToAttribute(attributeId: string, valueId: string): Promise<void> {
    const attributeRef = doc(db, 'attributes', attributeId);
    const attributeDoc = await getDoc(attributeRef);
    
    if (attributeDoc.exists()) {
      const attributeData = attributeDoc.data() as Attribute;
      const currentValues = attributeData.values || [];
      
      // Obtener los datos del valor
      const valueDoc = await getDoc(doc(db, 'attribute_values', valueId));
      if (valueDoc.exists()) {
        const valueData = { id: valueId, ...valueDoc.data() } as AttributeValue;
        
        await updateDoc(attributeRef, {
          values: [...currentValues, valueData],
          updatedAt: new Date()
        });
      }
    }
  }

  private async removeValueFromAttribute(attributeId: string, valueId: string): Promise<void> {
    const attributeRef = doc(db, 'attributes', attributeId);
    const attributeDoc = await getDoc(attributeRef);
    
    if (attributeDoc.exists()) {
      const attributeData = attributeDoc.data() as Attribute;
      const updatedValues = attributeData.values.filter(value => value.id !== valueId);
      
      await updateDoc(attributeRef, {
        values: updatedValues,
        updatedAt: new Date()
      });
    }
  }

  // ============= INICIALIZACIÓN DE TIENDA =============

  async initializeStoreAttributes(storeId: string, storeType: 'fashion' | 'jewelry'): Promise<void> {
    try {
      const template = storeType === 'fashion' ? FASHION_ATTRIBUTES_TEMPLATE : JEWELRY_ATTRIBUTES_TEMPLATE;
      const batch = writeBatch(db);

      for (const attributeTemplate of template.defaultAttributes) {
        // Crear el atributo
        const attributeRef = doc(collection(db, 'attributes'));
        const attributeData = {
          ...attributeTemplate,
          id: attributeRef.id,
          storeId,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system'
        };

        // Crear valores predefinidos según el tipo
        const values: AttributeValue[] = [];
        const defaultValues = this.getDefaultValuesForAttribute(attributeTemplate.type);
        
        for (const [index, defaultValue] of defaultValues.entries()) {
          const valueId = `${attributeRef.id}_value_${index}`;
          values.push({
            id: valueId,
            attributeId: attributeRef.id,
            value: defaultValue.value,
            displayValue: defaultValue.displayValue,
            hexCode: defaultValue.hexCode,
            measurements: defaultValue.measurements,
            sortOrder: index,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        attributeData.values = values;
        batch.set(attributeRef, attributeData);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error initializing store attributes:', error);
      throw error;
    }
  }

  private getDefaultValuesForAttribute(attributeType: string): any[] {
    switch (attributeType) {
      case 'color':
        return DEFAULT_ATTRIBUTE_VALUES.colors;
      case 'size':
        return DEFAULT_ATTRIBUTE_VALUES.clothingSizes;
      case 'material':
        return DEFAULT_ATTRIBUTE_VALUES.materials;
      case 'gender':
        return DEFAULT_ATTRIBUTE_VALUES.genders;
      case 'season':
        return DEFAULT_ATTRIBUTE_VALUES.seasons;
      case 'fit':
        return DEFAULT_ATTRIBUTE_VALUES.fits;
      case 'metal':
        return DEFAULT_ATTRIBUTE_VALUES.metals;
      case 'gemstone':
        return DEFAULT_ATTRIBUTE_VALUES.gemstones;
      default:
        return [];
    }
  }

  // ============= UTILIDADES =============

  async duplicateAttributeToStore(sourceAttributeId: string, targetStoreId: string): Promise<string> {
    try {
      const sourceDoc = await getDoc(doc(db, 'attributes', sourceAttributeId));
      if (!sourceDoc.exists()) {
        throw new Error('Source attribute not found');
      }

      const sourceData = sourceDoc.data() as Attribute;
      const { id, storeId, createdAt, updatedAt, createdBy, updatedBy, ...attributeData } = sourceData;

      return await this.createAttribute(targetStoreId, {
        ...attributeData,
        name: `${attributeData.name} (Copia)`,
        slug: `${attributeData.slug}_copy`,
        createdBy: 'system',
        updatedBy: 'system'
      });
    } catch (error) {
      console.error('Error duplicating attribute:', error);
      throw error;
    }
  }

  async reorderAttributes(storeId: string, attributeIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      for (const [index, attributeId] of attributeIds.entries()) {
        const attributeRef = doc(db, 'attributes', attributeId);
        batch.update(attributeRef, {
          sortOrder: index,
          updatedAt: new Date()
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error reordering attributes:', error);
      throw error;
    }
  }
}

export const attributeService = new AttributeService();
export default attributeService;
