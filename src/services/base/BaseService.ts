/**
 * Clase base para todos los servicios
 * Proporciona funcionalidad común y reutilizable
 */

import type { 
  CollectionReference, 
  DocumentData,
  Query,
  QueryConstraint,
  Unsubscribe 
} from 'firebase/firestore'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query as firestoreQuery,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export abstract class BaseService<T extends { id: string }> {
  protected collectionRef: CollectionReference<DocumentData>
  protected collectionName: string

  constructor(collectionName: string, firestore: Firestore = db) {
    this.collectionName = collectionName
    this.collectionRef = collection(firestore, collectionName)
  }

  /**
   * Obtener un documento por ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(this.collectionRef, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return this.mapDocumentData({
          id: docSnap.id,
          ...docSnap.data()
        })
      }

      return null
    } catch (error) {
      this.handleError('getById', error)
      throw error
    }
  }

  /**
   * Obtener todos los documentos con query opcional
   */
  async getAll(constraints?: QueryConstraint[]): Promise<T[]> {
    try {
      const q = constraints && constraints.length > 0
        ? firestoreQuery(this.collectionRef, ...constraints)
        : this.collectionRef

      const querySnapshot = await getDocs(q)
      const results: T[] = []

      querySnapshot.forEach((doc) => {
        results.push(this.mapDocumentData({
          id: doc.id,
          ...doc.data()
        }))
      })

      return results
    } catch (error) {
      this.handleError('getAll', error)
      throw error
    }
  }

  /**
   * Crear un nuevo documento
   */
  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      const cleanData = this.cleanObject(data as Record<string, unknown>)
      const now = new Date()

      const docData = {
        ...cleanData,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(this.collectionRef, docData)
      console.log(`✅ ${this.collectionName} created:`, docRef.id)
      return docRef.id
    } catch (error) {
      this.handleError('create', error)
      throw error
    }
  }

  /**
   * Actualizar un documento
   */
  async update(id: string, updates: Partial<T>): Promise<void> {
    try {
      const cleanUpdates = this.cleanObject(updates as Record<string, unknown>)
      cleanUpdates.updatedAt = new Date()

      const docRef = doc(this.collectionRef, id)
      await updateDoc(docRef, cleanUpdates)
      console.log(`✅ ${this.collectionName} updated:`, id)
    } catch (error) {
      this.handleError('update', error)
      throw error
    }
  }

  /**
   * Eliminar un documento
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id)
      await deleteDoc(docRef)
      console.log(`✅ ${this.collectionName} deleted:`, id)
    } catch (error) {
      this.handleError('delete', error)
      throw error
    }
  }

  /**
   * Suscribirse a cambios en tiempo real de un documento
   */
  subscribeById(id: string, callback: (data: T | null) => void): Unsubscribe {
    const docRef = doc(this.collectionRef, id)
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(this.mapDocumentData({
          id: doc.id,
          ...doc.data()
        }))
      } else {
        callback(null)
      }
    })
  }

  /**
   * Suscribirse a cambios en tiempo real de una colección
   */
  subscribeToCollection(
    callback: (data: T[]) => void,
    constraints?: QueryConstraint[]
  ): Unsubscribe {
    const q = constraints && constraints.length > 0
      ? firestoreQuery(this.collectionRef, ...constraints)
      : this.collectionRef

    return onSnapshot(q, (snapshot) => {
      const results: T[] = []
      snapshot.forEach((doc) => {
        results.push(this.mapDocumentData({
          id: doc.id,
          ...doc.data()
        }))
      })
      callback(results)
    })
  }

  /**
   * Limpiar objeto removiendo undefined
   */
  protected cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          cleaned[key] = this.cleanObject(value as Record<string, unknown>)
        } else {
          cleaned[key] = value
        }
      }
    }

    return cleaned
  }

  /**
   * Mapear datos del documento (convertir timestamps, etc.)
   * Debe ser implementado por clases hijas
   */
  protected abstract mapDocumentData(data: any): T

  /**
   * Manejo centralizado de errores
   */
  protected handleError(operation: string, error: unknown): void {
    console.error(`❌ Error in ${this.collectionName}.${operation}:`, error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }

  /**
   * Convertir Firestore Timestamp a Date
   */
  protected toDate(timestamp: any): Date {
    return timestamp?.toDate?.() || new Date()
  }
}





