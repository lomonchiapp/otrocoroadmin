/**
 * Firebase Functions para gestión de usuarios del sistema
 * Estas funciones deben desplegarse en Firebase Functions
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { generatePasswordResetLink } from 'firebase-admin/auth'

admin.initializeApp()

/**
 * Crea un nuevo usuario del sistema (admin, editor, vendedor)
 * Esta función crea el usuario en Firebase Auth y guarda sus datos en Firestore
 */
export const createSystemUser = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario esté autenticado y sea admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado')
  }

  const callerUid = context.auth.uid
  const callerDoc = await admin.firestore().collection('systemUsers').doc(callerUid).get()
  
  if (!callerDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Usuario no autorizado')
  }

  const callerData = callerDoc.data()
  if (callerData?.role !== 'superadmin' && callerData?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Solo administradores pueden crear usuarios')
  }

  const { firstName, lastName, username, email, phoneNumber, role, password } = data

  // Validar datos requeridos
  if (!firstName || !lastName || !username || !email || !phoneNumber || !role || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan datos requeridos')
  }

  try {
    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false,
      disabled: false,
    })

    // Guardar datos del usuario en Firestore
    const userData = {
      id: userRecord.uid,
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      role,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await admin.firestore().collection('systemUsers').doc(userRecord.uid).set(userData)

    // Enviar email de bienvenida
    try {
      const resetLink = await generatePasswordResetLink(email)
      // Aquí puedes usar un servicio de email como SendGrid, Mailgun, etc.
      // Por ahora solo logueamos el link
      console.log('Password reset link:', resetLink)
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // No fallar la creación del usuario si falla el email
    }

    return { userId: userRecord.uid, success: true }
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'El email ya está registrado')
    }
    
    throw new functions.https.HttpsError('internal', 'Error al crear usuario: ' + error.message)
  }
})

/**
 * Invita un usuario por email
 * Crea un usuario con estado "invited" y envía un email de invitación
 */
export const inviteSystemUser = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario esté autenticado y sea admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado')
  }

  const callerUid = context.auth.uid
  const callerDoc = await admin.firestore().collection('systemUsers').doc(callerUid).get()
  
  if (!callerDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Usuario no autorizado')
  }

  const callerData = callerDoc.data()
  if (callerData?.role !== 'superadmin' && callerData?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Solo administradores pueden invitar usuarios')
  }

  const { email, role, description } = data

  if (!email || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Email y rol son requeridos')
  }

  try {
    // Generar un token único para la invitación
    const inviteToken = admin.firestore().collection('invitations').doc().id
    
    // Crear usuario temporal en Firestore con estado "invited"
    const userData = {
      email,
      role,
      status: 'invited',
      inviteToken,
      invitedBy: callerUid,
      invitedAt: admin.firestore.FieldValue.serverTimestamp(),
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Guardar en una colección temporal de invitaciones
    await admin.firestore().collection('userInvitations').doc(inviteToken).set(userData)

    // Enviar email de invitación
    try {
      const inviteLink = `https://otrocoroadmin.com/auth/setup-password?token=${inviteToken}`
      // Aquí puedes usar un servicio de email como SendGrid, Mailgun, etc.
      // Por ahora solo logueamos el link
      console.log('Invitation link:', inviteLink)
      
      // Ejemplo de cómo enviar email con Firebase Extensions o servicio externo
      await admin.firestore().collection('mail').add({
        to: email,
        message: {
          subject: 'Invitación a OtroCoro Admin',
          html: `
            <h1>Has sido invitado a OtroCoro Admin</h1>
            <p>Has sido invitado como ${role}.</p>
            ${description ? `<p>${description}</p>` : ''}
            <p>Haz clic en el siguiente enlace para establecer tu contraseña:</p>
            <a href="${inviteLink}">Establecer Contraseña</a>
            <p>Este enlace expira en 72 horas.</p>
          `,
        },
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // No fallar la invitación si falla el email
    }

    return { userId: inviteToken, success: true }
  } catch (error: any) {
    console.error('Error inviting user:', error)
    throw new functions.https.HttpsError('internal', 'Error al invitar usuario: ' + error.message)
  }
})

/**
 * Actualiza la contraseña de un usuario
 */
export const updateUserPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado')
  }

  const callerUid = context.auth.uid
  const callerDoc = await admin.firestore().collection('systemUsers').doc(callerUid).get()
  
  if (!callerDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Usuario no autorizado')
  }

  const callerData = callerDoc.data()
  const { userId, password } = data

  // Solo el mismo usuario o un admin puede cambiar la contraseña
  if (callerUid !== userId && callerData?.role !== 'superadmin' && callerData?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para cambiar esta contraseña')
  }

  if (!password || password.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'La contraseña debe tener al menos 8 caracteres')
  }

  try {
    await admin.auth().updateUser(userId, { password })
    return { success: true }
  } catch (error: any) {
    console.error('Error updating password:', error)
    throw new functions.https.HttpsError('internal', 'Error al actualizar contraseña: ' + error.message)
  }
})

/**
 * Actualiza el email de un usuario
 */
export const updateUserEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado')
  }

  const callerUid = context.auth.uid
  const callerDoc = await admin.firestore().collection('systemUsers').doc(callerUid).get()
  
  if (!callerDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Usuario no autorizado')
  }

  const callerData = callerDoc.data()
  const { userId, email } = data

  // Solo el mismo usuario o un admin puede cambiar el email
  if (callerUid !== userId && callerData?.role !== 'superadmin' && callerData?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para cambiar este email')
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Email inválido')
  }

  try {
    await admin.auth().updateUser(userId, { email, emailVerified: false })
    
    // Actualizar email en Firestore
    await admin.firestore().collection('systemUsers').doc(userId).update({
      email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error updating email:', error)
    
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'El email ya está registrado')
    }
    
    throw new functions.https.HttpsError('internal', 'Error al actualizar email: ' + error.message)
  }
})

/**
 * Elimina un usuario del sistema
 */
export const deleteSystemUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado')
  }

  const callerUid = context.auth.uid
  const callerDoc = await admin.firestore().collection('systemUsers').doc(callerUid).get()
  
  if (!callerDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Usuario no autorizado')
  }

  const callerData = callerDoc.data()
  if (callerData?.role !== 'superadmin' && callerData?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Solo administradores pueden eliminar usuarios')
  }

  const { userId } = data

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'ID de usuario requerido')
  }

  // No permitir que un usuario se elimine a sí mismo
  if (callerUid === userId) {
    throw new functions.https.HttpsError('invalid-argument', 'No puedes eliminarte a ti mismo')
  }

  try {
    // Eliminar de Firebase Auth
    await admin.auth().deleteUser(userId)
    
    // Eliminar de Firestore
    await admin.firestore().collection('systemUsers').doc(userId).delete()
    
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    throw new functions.https.HttpsError('internal', 'Error al eliminar usuario: ' + error.message)
  }
})



