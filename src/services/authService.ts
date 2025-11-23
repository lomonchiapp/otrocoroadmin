/**
 * Servicio de autenticación para gestionar usuarios de Firebase Auth
 * Este servicio se usa cuando el admin crea usuarios desde el panel
 */

import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth'
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

/**
 * Token de invitación para establecer contraseña
 */
export interface PasswordSetupToken {
  id: string
  userId: string
  email: string
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

/**
 * Datos para enviar email de bienvenida
 */
export interface WelcomeEmailData {
  to: string
  message: {
    subject: string
    html: string
  }
}

class AuthService {
  private tokensCollection = collection(db, 'passwordSetupTokens')
  private mailCollection = collection(db, 'mail')

  /**
   * Genera un token único para establecer contraseña
   */
  private generateToken(): string {
    return crypto.randomUUID() + '-' + Date.now().toString(36)
  }

  /**
   * Crea un token de setup de contraseña y lo guarda en Firestore
   */
  async createPasswordSetupToken(userId: string, email: string): Promise<string> {
    try {
      const token = this.generateToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 72) // Expira en 72 horas

      const tokenDoc: PasswordSetupToken = {
        id: token,
        userId,
        email,
        token,
        expiresAt,
        used: false,
        createdAt: new Date(),
      }

      await setDoc(doc(this.tokensCollection, token), tokenDoc)
      return token
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating password setup token:', error)
      throw error
    }
  }

  /**
   * Verifica si un token es válido
   */
  async verifyPasswordSetupToken(token: string): Promise<PasswordSetupToken | null> {
    try {
      const tokenDoc = await getDoc(doc(this.tokensCollection, token))
      
      if (!tokenDoc.exists()) {
        return null
      }

      const data = tokenDoc.data() as PasswordSetupToken
      
      // Verificar si está usado o expirado
      if (data.used || new Date(data.expiresAt) < new Date()) {
        return null
      }

      return data
    } catch (error) {
      console.error('Error verifying token:', error)
      return null
    }
  }

  /**
   * Marca un token como usado
   */
  async markTokenAsUsed(token: string): Promise<void> {
    try {
      await updateDoc(doc(this.tokensCollection, token), {
        used: true,
        usedAt: new Date(),
      })
    } catch (error) {
      console.error('Error marking token as used:', error)
      throw error
    }
  }

  /**
   * Envía un email de bienvenida con el link para establecer contraseña
   * Usa la extensión "Trigger Email" de Firebase
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    token: string
  ): Promise<void> {
    try {
      // URL base dependiendo del entorno
      const baseUrl = import.meta.env.VITE_ECOMMERCE_URL || 'http://localhost:5173'
      const setupUrl = `${baseUrl}/auth/set-password?token=${token}`

      // Crear documento en la colección 'mail' para que Firebase lo procese
      const emailDoc = {
        to: email,
        message: {
          subject: '¡Bienvenido a Otrocoro Fashion! 🎉',
          html: this.getWelcomeEmailTemplate(firstName, setupUrl),
        },
        // Metadatos adicionales
        template: {
          name: 'welcome',
          data: {
            firstName,
            setupUrl,
          },
        },
        createdAt: serverTimestamp(),
      }

      await setDoc(doc(this.mailCollection, crypto.randomUUID()), emailDoc)

      console.log('✅ Email de bienvenida encolado para:', email)
    } catch (error) {
      console.error('❌ Error al enviar email de bienvenida:', error)
      throw error
    }
  }

  /**
   * Template HTML para el email de bienvenida
   */
  private getWelcomeEmailTemplate(firstName: string, setupUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #667eea;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #555;
    }
    .button {
      display: inline-block;
      margin: 30px 0;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .info-box {
      background: #f8f9ff;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Bienvenido a Otrocoro Fashion!</h1>
    </div>
    
    <div class="content">
      <h2>Hola ${firstName},</h2>
      
      <p>
        Estamos emocionados de tenerte con nosotros. Tu cuenta ha sido creada exitosamente.
      </p>
      
      <p>
        Para comenzar a disfrutar de todos nuestros productos y ofertas exclusivas, 
        necesitas establecer tu contraseña haciendo clic en el botón de abajo:
      </p>
      
      <center>
        <a href="${setupUrl}" class="button">
          🔐 Establecer mi Contraseña
        </a>
      </center>
      
      <div class="info-box">
        <p>
          <strong>⏰ Este enlace expira en 72 horas.</strong><br>
          Si no fuiste tú quien solicitó esta cuenta, por favor ignora este email.
        </p>
      </div>
      
      <p>
        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
      </p>
      <p style="word-break: break-all; color: #667eea; font-size: 14px;">
        ${setupUrl}
      </p>
      
      <p style="margin-top: 40px;">
        ¡Gracias por unirte a nuestra comunidad!<br>
        <strong>El equipo de Otrocoro Fashion</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Otrocoro Fashion. Todos los derechos reservados.
      </p>
      <p>
        <a href="#">Política de Privacidad</a> | 
        <a href="#">Términos de Servicio</a> | 
        <a href="#">Contacto</a>
      </p>
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Crea la contraseña del usuario en Firebase Auth
   * Este método se llama desde la página de "establecer contraseña"
   */
  async setupUserPassword(
    email: string,
    password: string,
    token: string
  ): Promise<FirebaseUser> {
    try {
      // Verificar el token
      const tokenData = await this.verifyPasswordSetupToken(token)
      if (!tokenData) {
        throw new Error('Token inválido o expirado')
      }

      if (tokenData.email !== email) {
        throw new Error('Email no coincide con el token')
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      // Marcar token como usado
      await this.markTokenAsUsed(token)

      // Actualizar el documento del customer en Firestore
      await updateDoc(doc(db, 'customers', tokenData.userId), {
        passwordSet: true,
        emailVerified: true,
        status: 'active',
        updatedAt: new Date(),
      })

      console.log('✅ Contraseña establecida para:', email)
      return userCredential.user
    } catch (error) {
      console.error('❌ Error al establecer contraseña:', error)
      throw error
    }
  }

  /**
   * Envía un email para restablecer contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
      console.log('✅ Email de recuperación enviado a:', email)
    } catch (error) {
      console.error('❌ Error al enviar email de recuperación:', error)
      throw error
    }
  }
}

export const authService = new AuthService()
