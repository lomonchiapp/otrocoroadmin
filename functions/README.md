# Firebase Functions para Gestión de Usuarios

Este directorio contiene las Firebase Functions necesarias para gestionar usuarios del sistema de forma segura.

## Funciones Disponibles

### `createSystemUser`
Crea un nuevo usuario del sistema (admin, editor, vendedor).
- **Permisos**: Solo superadmin y admin
- **Parámetros**: firstName, lastName, username, email, phoneNumber, role, password
- **Retorna**: userId

### `inviteSystemUser`
Invita un usuario por email. Crea un usuario con estado "invited" y envía un email de invitación.
- **Permisos**: Solo superadmin y admin
- **Parámetros**: email, role, description (opcional)
- **Retorna**: userId (token de invitación)

### `updateUserPassword`
Actualiza la contraseña de un usuario.
- **Permisos**: El mismo usuario o admin
- **Parámetros**: userId, password

### `updateUserEmail`
Actualiza el email de un usuario.
- **Permisos**: El mismo usuario o admin
- **Parámetros**: userId, email

### `deleteSystemUser`
Elimina un usuario del sistema (de Auth y Firestore).
- **Permisos**: Solo superadmin y admin
- **Parámetros**: userId
- **Nota**: Un usuario no puede eliminarse a sí mismo

## Instalación y Despliegue

### 1. Instalar dependencias

```bash
cd functions
npm install
```

### 2. Compilar TypeScript

```bash
npm run build
```

### 3. Desplegar funciones

```bash
# Desplegar todas las funciones
npm run deploy

# O desplegar una función específica
firebase deploy --only functions:createSystemUser
```

### 4. Configurar variables de entorno (si es necesario)

Si necesitas configurar variables de entorno para las funciones:

```bash
firebase functions:config:set sendgrid.api_key="your-api-key"
```

## Estructura de Datos

### Colección: `systemUsers`
```typescript
{
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  role: 'superadmin' | 'admin' | 'editor' | 'vendedor' | 'cliente'
  status: 'active' | 'inactive' | 'invited' | 'suspended'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Colección: `userInvitations`
```typescript
{
  email: string
  role: string
  status: 'invited'
  inviteToken: string
  invitedBy: string
  invitedAt: Timestamp
  description?: string
}
```

## Notas Importantes

1. **Seguridad**: Todas las funciones verifican que el usuario esté autenticado y tenga los permisos necesarios.

2. **Emails**: Las funciones actualmente loguean los links de invitación. Para producción, debes configurar un servicio de email como SendGrid, Mailgun, o usar Firebase Extensions.

3. **Validación**: Las funciones validan los datos de entrada antes de procesarlos.

4. **Errores**: Las funciones retornan errores descriptivos usando `HttpsError` de Firebase Functions.

## Desarrollo Local

Para probar las funciones localmente:

```bash
npm run serve
```

Esto iniciará el emulador de Firebase Functions en `http://localhost:5001`.

## Próximos Pasos

1. Configurar servicio de email (SendGrid, Mailgun, etc.)
2. Agregar logs estructurados
3. Implementar rate limiting
4. Agregar tests unitarios



