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
  FolderTree,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Megaphone,
  Ticket,
  MessageSquare,
  BookOpen,
  FileText,
  DollarSign,
  Percent,
  Gift,
  AlertCircle,
  Boxes,
  ArrowLeftRight,
  Crown,
  UserPlus,
  UsersRound,
  Network,
  Plug,
  Calculator,
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
          title: 'Punto de Venta (POS)',
          url: '/pos',
          icon: Calculator,
        },
        {
          title: 'Órdenes',
          icon: ShoppingCart,
          badge: 'nuevo',
          items: [
            {
              title: 'Todas las Órdenes',
              url: '/orders',
              icon: ShoppingCart,
            },
            {
              title: 'Pendientes',
              url: '/orders/pending',
              icon: Clock,
            },
            {
              title: 'En Proceso',
              url: '/orders/processing',
              icon: RotateCcw,
            },
            {
              title: 'Enviadas',
              url: '/orders/shipped',
              icon: Truck,
            },
            {
              title: 'Devoluciones',
              url: '/orders/returns',
              icon: RotateCcw,
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
              icon: FolderTree,
            },
            {
              title: 'Marcas',
              url: '/brands',
              icon: Award,
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
              icon: Boxes,
            },
            {
              title: 'Bajo Stock',
              url: '/inventory/low-stock',
              icon: AlertCircle,
            },
            {
              title: 'Ajustes de Stock',
              url: '/inventory/adjustments',
              icon: Wrench,
            },
            {
              title: 'Transferencias',
              url: '/inventory/transfers',
              icon: ArrowLeftRight,
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
              icon: UsersRound,
            },
            {
              title: 'VIP',
              url: '/customers/vip',
              icon: Crown,
            },
            {
              title: 'Nuevos',
              url: '/customers/new',
              icon: UserPlus,
            },
            {
              title: 'Segmentos',
              url: '/customers/segments',
              icon: Network,
            },
          ],
        },
        {
          title: 'Tiendas',
          icon: Store,
          items: [
            {
              title: 'Gestionar Tiendas',
              url: '/stores/manage',
              icon: Store,
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
              icon: DollarSign,
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
              icon: Megaphone,
            },
            {
              title: 'Descuentos',
              url: '/marketing/discounts',
              icon: Percent,
            },
            {
              title: 'Cupones',
              url: '/marketing/coupons',
              icon: Ticket,
            },
            {
              title: 'Reviews',
              url: '/marketing/reviews',
              icon: Star,
            },
            {
              title: 'Anuncios',
              url: '/marketing/ads',
              icon: Megaphone,
            },
            {
              title: 'Leads',
              url: '/marketing/leads',
              icon: UsersRound,
            },
          ],
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
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
              title: 'Facturación',
              url: '/system/invoicing',
              icon: FileText,
            },
            {
              title: 'Métodos de Pago',
              url: '/system/payment-methods',
              icon: CreditCard,
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
              icon: Palette,
            },
            {
              title: 'Notificaciones',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Integrations',
              url: '/settings/integrations',
              icon: Plug,
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
              icon: HelpCircle,
            },
            {
              title: 'Contactar Soporte',
              url: '/support/contact',
              icon: MessageCircle,
            },
            {
              title: 'Documentación',
              url: '/support/docs',
              icon: BookOpen,
            },
          ],
        },
      ],
    },
  ],
}
