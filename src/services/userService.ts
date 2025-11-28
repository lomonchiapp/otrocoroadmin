/**
 * Servicio para gestionar usuarios del sistema (admins, editores, vendedores)
 * Este servicio maneja usuarios del panel admin, no clientes
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import type { User } from '@/features/users/data/schema'

export interface CreateUserData {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  role: User['role']
  password: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phoneNumber?: string
  role?: User['role']
  status?: User['status']
  password?: string
}

export interface InviteUserData {
  email: string
  role: User['role']
  desc?: string
}

class UserService {
  private collectionName = 'systemUsers'

  /**
   * Obtener todos los usuarios del sistema
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[]
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collectionName, userId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }
      
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  }

  /**
   * Crear un nuevo usuario del sistema
   * Usa Firebase Functions para crear el usuario en Auth y Firestore de forma segura
   */
  async createUser(userData: CreateUserData): Promise<string> {
    try {
      // Llamar a la Firebase Function para crear el usuario
      const createUserFunction = httpsCallable(functions, 'createSystemUser')
      const result = await createUserFunction({
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        password: userData.password,
      })

      const { userId } = result.data as { userId: string }
      return userId
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  /**
   * Actualizar un usuario existente
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId)
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      }

      // Si se está actualizando la contraseña, usar Firebase Function
      if (updates.password) {
        const updatePasswordFunction = httpsCallable(functions, 'updateUserPassword')
        await updatePasswordFunction({
          userId,
          password: updates.password,
        })
        // Remover password del objeto de actualización
        delete updateData.password
      }

      // Si se está actualizando el email, usar Firebase Function
      if (updates.email) {
        const updateEmailFunction = httpsCallable(functions, 'updateUserEmail')
        await updateEmailFunction({
          userId,
          email: updates.email,
        })
        // Remover email del objeto de actualización (se actualiza en Auth)
        delete updateData.email
      }

      await updateDoc(userRef, updateData)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  /**
   * Eliminar un usuario del sistema
   * Usa Firebase Function para eliminar de Auth y Firestore
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Llamar a la Firebase Function para eliminar el usuario
      const deleteUserFunction = httpsCallable(functions, 'deleteSystemUser')
      await deleteUserFunction({ userId })
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  /**
   * Invitar un usuario por email
   * Crea un usuario con estado "invited" y envía un email de invitación
   */
  async inviteUser(inviteData: InviteUserData): Promise<string> {
    try {
      // Llamar a la Firebase Function para enviar invitación
      const inviteUserFunction = httpsCallable(functions, 'inviteSystemUser')
      const result = await inviteUserFunction({
        email: inviteData.email,
        role: inviteData.role,
        description: inviteData.desc || '',
      })

      const { userId } = result.data as { userId: string }
      return userId
    } catch (error) {
      console.error('Error inviting user:', error)
      throw error
    }
  }

  /**
   * Cambiar el estado de un usuario
   */
  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId)
      await updateDoc(userRef, {
        status,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  /**
   * Buscar usuarios por email o username
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const users = await this.getAllUsers()
      const term = searchTerm.toLowerCase()
      
      return users.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }
}

export const userService = new UserService()



