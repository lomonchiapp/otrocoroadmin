import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  Timestamp,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PosSession, PosTransaction } from '@/types/pos'

class PosService {
  private sessionsCollection = 'pos_sessions'
  private transactionsCollection = 'pos_transactions'

  /**
   * Abre un nuevo turno de caja
   */
  async openSession(
    userId: string, 
    storeId: string, 
    registerId: string,
    registerName: string,
    openingBalance: number, 
    notes?: string
  ): Promise<string> {
    // Verificar si ya hay una sesión abierta para esta caja específica
    const activeSession = await this.getActiveSessionByRegister(storeId, registerId)
    if (activeSession) {
      throw new Error(`La caja ${registerName} ya está abierta.`)
    }

    const now = new Date()
    const sessionData: Omit<PosSession, 'id'> = {
      storeId,
      registerId,
      registerName,
      userId,
      status: 'open',
      openingBalance,
      totalCash: 0,
      totalCard: 0,
      totalTransfer: 0,
      totalOther: 0,
      openingNotes: notes,
      openedAt: now,
      createdAt: now,
      updatedAt: now
    }

    const docRef = await addDoc(collection(db, this.sessionsCollection), sessionData)
    return docRef.id
  }

  /**
   * Obtiene la sesión activa actual del usuario en una tienda específica
   */
  async getActiveSession(userId: string, storeId: string): Promise<PosSession | null> {
    const q = query(
      collection(db, this.sessionsCollection),
      where('userId', '==', userId),
      where('storeId', '==', storeId),
      where('status', '==', 'open'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      ...data,
      openedAt: data.openedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as PosSession
  }

  /**
   * Obtiene la sesión activa por caja (registerId)
   */
  async getActiveSessionByRegister(storeId: string, registerId: string): Promise<PosSession | null> {
    const q = query(
      collection(db, this.sessionsCollection),
      where('storeId', '==', storeId),
      where('registerId', '==', registerId),
      where('status', '==', 'open'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      ...data,
      openedAt: data.openedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as PosSession
  }

  /**
   * Obtiene todas las cajas activas de una tienda
   */
  async getActiveSessionsByStore(storeId: string): Promise<PosSession[]> {
    const q = query(
      collection(db, this.sessionsCollection),
      where('storeId', '==', storeId),
      where('status', '==', 'open'),
      orderBy('openedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        openedAt: data.openedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as PosSession
    })
  }

  /**
   * Cierra el turno de caja
   */
  async closeSession(
    sessionId: string, 
    closingBalance: number, 
    cashCount?: Record<string, number>, 
    notes?: string
  ): Promise<void> {
    const sessionRef = doc(db, this.sessionsCollection, sessionId)
    const sessionSnap = await getDoc(sessionRef)
    
    if (!sessionSnap.exists()) throw new Error('Sesión no encontrada')
    
    const sessionData = sessionSnap.data() as PosSession
    
    // Calcular balance esperado (Solo efectivo afecta el arqueo físico)
    // Expected = Fondo Inicial + Ventas Efectivo - Retiros Efectivo + Depósitos Efectivo
    // NOTA: totalCash ya debería incluir las ventas en efectivo registradas
    const expectedBalance = sessionData.openingBalance + sessionData.totalCash
    
    const discrepancy = closingBalance - expectedBalance

    await updateDoc(sessionRef, {
      status: 'closed',
      closingBalance,
      expectedBalance,
      discrepancy,
      cashCount,
      closingNotes: notes,
      closedAt: new Date(),
      updatedAt: new Date()
    })
  }

  /**
   * Registra una transacción (Venta, Retiro, etc.)
   * Actualiza automáticamente los totales de la sesión
   */
  async registerTransaction(transaction: Omit<PosTransaction, 'id' | 'createdAt'>): Promise<string> {
    const now = new Date()
    const newTransaction = {
      ...transaction,
      createdAt: now
    }

    // 1. Guardar transacción
    const docRef = await addDoc(collection(db, this.transactionsCollection), newTransaction)

    // 2. Actualizar totales de la sesión si es venta o movimiento de dinero
    if (transaction.sessionId) {
      const sessionRef = doc(db, this.sessionsCollection, transaction.sessionId)
      const sessionSnap = await getDoc(sessionRef)
      
      if (sessionSnap.exists()) {
        const session = sessionSnap.data() as PosSession
        const updates: Partial<PosSession> = { updatedAt: now }
        
        // Si es venta, sumar al total correspondiente
        if (transaction.type === 'sale') {
          if (transaction.paymentMethod === 'cash') {
            updates.totalCash = (session.totalCash || 0) + transaction.amount
          } else if (transaction.paymentMethod === 'card') {
            updates.totalCard = (session.totalCard || 0) + transaction.amount
          } else if (transaction.paymentMethod === 'transfer') {
            updates.totalTransfer = (session.totalTransfer || 0) + transaction.amount
          } else {
            updates.totalOther = (session.totalOther || 0) + transaction.amount
          }
        } 
        // Si es reembolso (restar)
        else if (transaction.type === 'refund') {
           if (transaction.paymentMethod === 'cash') {
            updates.totalCash = (session.totalCash || 0) - transaction.amount
          }
          // ... lógica para otros métodos si aplica
        }
        // Si es retiro manual de efectivo
        else if (transaction.type === 'withdrawal' && transaction.paymentMethod === 'cash') {
           updates.totalCash = (session.totalCash || 0) - transaction.amount
        }
        // Si es ingreso manual de efectivo
        else if (transaction.type === 'deposit' && transaction.paymentMethod === 'cash') {
           updates.totalCash = (session.totalCash || 0) + transaction.amount
        }

        await updateDoc(sessionRef, updates)
      }
    }

    return docRef.id
  }

  /**
   * Obtiene transacciones de una sesión
   */
  async getSessionTransactions(sessionId: string): Promise<PosTransaction[]> {
    const q = query(
      collection(db, this.transactionsCollection),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as PosTransaction[]
  }
}

export const posService = new PosService()

