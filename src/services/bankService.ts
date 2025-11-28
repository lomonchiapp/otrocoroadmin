import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Bank,
  BankAccount,
  BankCreateInput,
  BankAccountCreateInput,
  BankUpdateInput,
  BankAccountUpdateInput,
} from '@/types/payments'

class BankService {
  private banksCollection = 'banks'
  private accountsCollection = 'bank_accounts'

  // ============= BANCOS =============

  async getAllBanks(): Promise<Bank[]> {
    try {
      const snapshot = await getDocs(collection(db, this.banksCollection))

      const banks = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const bankData = docSnap.data()
          const accounts = await this.getAccountsByBankId(docSnap.id)

          return {
            id: docSnap.id,
            name: bankData.name,
            code: bankData.code,
            logo: bankData.logo || '',
            isActive: bankData.isActive ?? true,
            accounts,
            createdAt: bankData.createdAt?.toDate() || new Date(),
            updatedAt: bankData.updatedAt?.toDate() || new Date(),
          } as Bank
        })
      )

      // Ordenar por fecha de creación (más reciente primero)
      return banks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('Error getting banks:', error)
      throw error
    }
  }

  async getBank(bankId: string): Promise<Bank | null> {
    try {
      const docRef = doc(db, this.banksCollection, bankId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const bankData = docSnap.data()
      const accounts = await this.getAccountsByBankId(bankId)

      return {
        id: docSnap.id,
        name: bankData.name,
        code: bankData.code,
        logo: bankData.logo || '',
        isActive: bankData.isActive ?? true,
        accounts,
        createdAt: bankData.createdAt?.toDate() || new Date(),
        updatedAt: bankData.updatedAt?.toDate() || new Date(),
      } as Bank
    } catch (error) {
      console.error('Error getting bank:', error)
      throw error
    }
  }

  async createBank(bankData: BankCreateInput): Promise<string> {
    try {
      const newBank = {
        name: bankData.name,
        code: bankData.code,
        logo: bankData.logo || '',
        isActive: bankData.isActive ?? true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, this.banksCollection), newBank)
      return docRef.id
    } catch (error) {
      console.error('Error creating bank:', error)
      throw error
    }
  }

  async updateBank(bankId: string, updates: BankUpdateInput): Promise<void> {
    try {
      const docRef = doc(db, this.banksCollection, bankId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating bank:', error)
      throw error
    }
  }

  async deleteBank(bankId: string): Promise<void> {
    try {
      // Primero eliminar todas las cuentas del banco
      const accounts = await this.getAccountsByBankId(bankId)
      await Promise.all(accounts.map((account) => this.deleteAccount(account.id)))

      // Luego eliminar el banco
      const docRef = doc(db, this.banksCollection, bankId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting bank:', error)
      throw error
    }
  }

  // ============= CUENTAS BANCARIAS =============

  async getAccountsByBankId(bankId: string): Promise<BankAccount[]> {
    try {
      const q = query(
        collection(db, this.accountsCollection),
        where('bankId', '==', bankId)
      )
      const snapshot = await getDocs(q)

      const accounts = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          bankId: data.bankId,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
          accountHolder: data.accountHolder,
          currency: data.currency,
          isActive: data.isActive ?? true,
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as BankAccount
      })

      // Ordenar por fecha de creación (más reciente primero)
      return accounts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error('Error getting accounts by bank:', error)
      return []
    }
  }

  async getAccount(accountId: string): Promise<BankAccount | null> {
    try {
      const docRef = doc(db, this.accountsCollection, accountId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()
      return {
        id: docSnap.id,
        bankId: data.bankId,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        accountHolder: data.accountHolder,
        currency: data.currency,
        isActive: data.isActive ?? true,
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BankAccount
    } catch (error) {
      console.error('Error getting account:', error)
      throw error
    }
  }

  async createAccount(accountData: BankAccountCreateInput): Promise<string> {
    try {
      const newAccount = {
        bankId: accountData.bankId,
        accountNumber: accountData.accountNumber,
        accountType: accountData.accountType,
        accountHolder: accountData.accountHolder,
        currency: accountData.currency,
        isActive: accountData.isActive ?? true,
        notes: accountData.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(
        collection(db, this.accountsCollection),
        newAccount
      )
      return docRef.id
    } catch (error) {
      console.error('Error creating account:', error)
      throw error
    }
  }

  async updateAccount(
    accountId: string,
    updates: BankAccountUpdateInput
  ): Promise<void> {
    try {
      const docRef = doc(db, this.accountsCollection, accountId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating account:', error)
      throw error
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      const docRef = doc(db, this.accountsCollection, accountId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    }
  }
}

export const bankService = new BankService()

