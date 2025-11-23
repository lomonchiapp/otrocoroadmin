import {
  LayoutDashboard,
  HelpCircle,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  ShieldCheck,
  Command,
  GalleryVerticalEnd,
  ShoppingCart,
  Package2,
  Warehouse,
  TrendingUp,
  CreditCard,
  Tags,
  Truck,
  Star,
  BarChart3,
  PieChart,
  FileBarChart,
  UserCheck,
  MessageCircle,
  Store,
  PackageOpen,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin Otrocoro',
    email: 'admin@otrocoro.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'Otro Coro Fashion',
      logo: Package,
      plan: 'Tienda de Moda',
    },
    {
      name: 'Otro Coro Oro', 
      logo: GalleryVerticalEnd,
      plan: 'Joyería de Prestigio',
    },
  ],
  navGroups: [
    {
      title: 'Principal',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Órdenes',
          icon: ShoppingCart,
          badge: 'nuevo',
          items: [
            {
              title: 'Todas las Órdenes',
              url: '/orders',
            },
            {
              title: 'Pendientes',
              url: '/orders/pending',
            },
            {
              title: 'En Proceso',
              url: '/orders/processing',
            },
            {
              title: 'Enviadas',
              url: '/orders/shipped',
            },
            {
              title: 'Devoluciones',
              url: '/orders/returns',
            },
          ],
        },
        {
          title: 'Productos',
          icon: Package2,
          items: [
            {
              title: 'Todos los Productos',
              url: '/products',
            },
            {
              title: 'Atributos',
              url: '/attributes',
              icon: Tags,
            },
            {
              title: 'Categorías',
              url: '/categories',
            },
            {
              title: 'Marcas',
              url: '/brands',
            },
            {
              title: 'Combos',
              url: '/bundles',
              icon: PackageOpen,
            },
          ],
        },
        {
          title: 'Inventario',
          icon: Warehouse,
          items: [
            {
              title: 'Stock General',
              url: '/inventory/stock',
            },
            {
              title: 'Bajo Stock',
              url: '/inventory/low-stock',
            },
            {
              title: 'Ajustes de Stock',
              url: '/inventory/adjustments',
            },
            {
              title: 'Transferencias',
              url: '/inventory/transfers',
            },
          ],
        },
        {
          title: 'Clientes',
          icon: Users,
          items: [
            {
              title: 'Todos los Clientes',
              url: '/customers',
            },
            {
              title: 'VIP',
              url: '/customers/vip',
            },
            {
              title: 'Nuevos',
              url: '/customers/new',
            },
            {
              title: 'Segmentos',
              url: '/customers/segments',
            },
          ],
        },
      ],
    },
    {
      title: 'Análisis',
      items: [
        {
          title: 'Analytics',
          icon: TrendingUp,
          items: [
            {
              title: 'Ventas',
              url: '/analytics/sales',
              icon: BarChart3,
            },
            {
              title: 'Productos',
              url: '/analytics/products',
              icon: PieChart,
            },
            {
              title: 'Clientes',
              url: '/analytics/customers',
              icon: UserCheck,
            },
            {
              title: 'Reportes',
              url: '/analytics/reports',
              icon: FileBarChart,
            },
          ],
        },
        {
          title: 'Marketing',
          icon: Star,
          items: [
            {
              title: 'Campañas',
              url: '/marketing/campaigns',
            },
            {
              title: 'Descuentos',
              url: '/marketing/discounts',
            },
            {
              title: 'Cupones',
              url: '/marketing/coupons',
            },
            {
              title: 'Reviews',
              url: '/marketing/reviews',
            },
          ],
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          title: 'Tiendas',
          icon: Store,
          items: [
            {
              title: 'Gestionar Tiendas',
              url: '/stores/manage',
            },
            {
              title: 'Configuración',
              url: '/stores/settings',
            },
            {
              title: 'Pagos',
              url: '/stores/payments',
              icon: CreditCard,
            },
            {
              title: 'Envíos',
              url: '/stores/shipping',
              icon: Truck,
            },
            {
              title: 'Impuestos',
              url: '/stores/taxes',
            },
          ],
        },
        {
          title: 'Sistema',
          icon: Settings,
          items: [
            {
              title: 'Usuarios Admin',
              url: '/system/users',
              icon: UserCog,
            },
            {
              title: 'Roles y Permisos',
              url: '/system/permissions',
              icon: ShieldCheck,
            },
            {
              title: 'Configuración',
              url: '/system/settings',
              icon: Wrench,
            },
            {
              title: 'Logs del Sistema',
              url: '/system/logs',
              icon: FileBarChart,
            },
          ],
        },
        {
          title: 'Personalización',
          icon: Palette,
          items: [
            {
              title: 'Apariencia',
              url: '/settings/appearance',
            },
            {
              title: 'Notificaciones',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Integrations',
              url: '/settings/integrations',
            },
          ],
        },
        {
          title: 'Soporte',
          icon: HelpCircle,
          items: [
            {
              title: 'Centro de Ayuda',
              url: '/support',
            },
            {
              title: 'Contactar Soporte',
              url: '/support/contact',
              icon: MessageCircle,
            },
            {
              title: 'Documentación',
              url: '/support/docs',
            },
          ],
        },
      ],
    },
  ],
}
