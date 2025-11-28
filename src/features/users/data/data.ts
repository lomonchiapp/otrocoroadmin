import { Shield, UserCheck, Users, CreditCard, Edit, ShoppingBag, User } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const roles = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: Shield,
    description: 'Acceso completo al sistema',
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: UserCheck,
    description: 'Administración completa excepto configuración del sistema',
  },
  {
    label: 'Editor',
    value: 'editor',
    icon: Edit,
    description: 'Puede crear y editar productos, órdenes y contenido',
  },
  {
    label: 'Vendedor',
    value: 'vendedor',
    icon: ShoppingBag,
    description: 'Puede gestionar órdenes y clientes',
  },
  {
    label: 'Cliente',
    value: 'cliente',
    icon: User,
    description: 'Acceso limitado, solo visualización',
  },
  // Mantener para compatibilidad
  {
    label: 'Manager',
    value: 'manager',
    icon: Users,
    description: 'Gestión de equipo',
  },
  {
    label: 'Cashier',
    value: 'cashier',
    icon: CreditCard,
    description: 'Cajero',
  },
] as const
