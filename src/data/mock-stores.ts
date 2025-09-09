// Datos mock para tiendas y usuarios admin
import type { Store, AdminUser, StoreAccess } from '@/types'

export const mockStores: Store[] = [
  {
    id: 'store-fashion-001',
    name: 'Otrocoro Fashion',
    type: 'fashion',
    slug: 'otrocoro-fashion',
    description: 'Tu destino para la moda contemporánea y elegante',
    logo: '/logo.png',
    primaryColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    currency: 'COP',
    isActive: true,
    settings: {
      allowBackorders: true,
      trackInventory: true,
      defaultTaxRate: 19,
      shippingZones: [
        {
          id: 'zone-colombia',
          name: 'Colombia',
          countries: ['CO'],
          shippingMethods: [
            {
              id: 'standard-shipping',
              name: 'Envío Estándar',
              description: 'Entrega en 3-5 días hábiles',
              price: 15000,
              estimatedDays: 4,
              isActive: true,
            },
            {
              id: 'express-shipping',
              name: 'Envío Express',
              description: 'Entrega en 24-48 horas',
              price: 25000,
              estimatedDays: 1,
              isActive: true,
            },
          ],
        },
      ],
      paymentMethods: [
        {
          id: 'mercadopago',
          name: 'MercadoPago',
          provider: 'mercadopago',
          isActive: true,
          settings: {},
        },
        {
          id: 'stripe',
          name: 'Stripe',
          provider: 'stripe',
          isActive: true,
          settings: {},
        },
      ],
      notifications: {
        emailOnNewOrder: true,
        emailOnLowStock: true,
        emailOnOutOfStock: true,
        smsNotifications: false,
        webhookUrl: 'https://api.otrocorofashion.com/webhooks',
      },
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-15'),
  },
  {
    id: 'store-jewelry-001',
    name: 'Otrocoro Joyería',
    type: 'jewelry',
    slug: 'otrocoro-joyeria',
    description: 'Joyería fina en oro y piedras preciosas',
    logo: '/logo.png',
    primaryColor: '#F59E0B',
    secondaryColor: '#FCD34D',
    currency: 'COP',
    isActive: false, // En desarrollo
    settings: {
      allowBackorders: false,
      trackInventory: true,
      defaultTaxRate: 19,
      shippingZones: [
        {
          id: 'zone-colombia-premium',
          name: 'Colombia Premium',
          countries: ['CO'],
          shippingMethods: [
            {
              id: 'secure-shipping',
              name: 'Envío Asegurado',
              description: 'Entrega segura con seguro completo',
              price: 35000,
              estimatedDays: 2,
              isActive: true,
            },
          ],
        },
      ],
      paymentMethods: [
        {
          id: 'bank-transfer',
          name: 'Transferencia Bancaria',
          provider: 'bank_transfer',
          isActive: true,
          settings: {},
        },
        {
          id: 'stripe-premium',
          name: 'Stripe Premium',
          provider: 'stripe',
          isActive: true,
          settings: {},
        },
      ],
      notifications: {
        emailOnNewOrder: true,
        emailOnLowStock: true,
        emailOnOutOfStock: true,
        smsNotifications: true,
        webhookUrl: 'https://api.otrocorojoyeria.com/webhooks',
      },
    },
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-15'),
  },
]

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-001',
    email: 'admin@otrocoro.com',
    firstName: 'Admin',
    lastName: 'Otrocoro',
    avatar: '/avatars/admin.jpg',
    role: 'super_admin',
    storeAccess: [
      {
        storeId: 'store-fashion-001',
        role: 'super_admin',
        permissions: [
          {
            resource: '*',
            actions: ['create', 'read', 'update', 'delete'],
          },
        ],
      },
      {
        storeId: 'store-jewelry-001',
        role: 'super_admin',
        permissions: [
          {
            resource: '*',
            actions: ['create', 'read', 'update', 'delete'],
          },
        ],
      },
    ],
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'admin-002',
    email: 'manager@otrocorofashion.com',
    firstName: 'María',
    lastName: 'García',
    avatar: '/avatars/maria.jpg',
    role: 'store_manager',
    storeAccess: [
      {
        storeId: 'store-fashion-001',
        role: 'store_manager',
        permissions: [
          {
            resource: 'products',
            actions: ['create', 'read', 'update'],
          },
          {
            resource: 'orders',
            actions: ['read', 'update'],
          },
          {
            resource: 'customers',
            actions: ['read', 'update'],
          },
        ],
      },
    ],
    isActive: true,
    lastLoginAt: new Date('2024-12-14'),
    createdAt: new Date('2024-02-15'),
  },
]

// Función para inicializar datos mock
export const initializeMockData = () => {
  // Solo inicializar en desarrollo
  if (import.meta.env.MODE === 'development') {
    const existingStores = localStorage.getItem('otrocoro-admin-store-state')
    
    if (!existingStores) {
      // Establecer tienda por defecto
      localStorage.setItem(
        'otrocoro-admin-current-store', 
        JSON.stringify(mockStores[0])
      )
      
      // Establecer datos iniciales
      const initialState = {
        currentStore: mockStores[0],
        availableStores: mockStores,
        user: mockAdminUsers[0],
        permissions: mockAdminUsers[0].storeAccess[0].permissions,
      }
      
      localStorage.setItem(
        'otrocoro-admin-store-state',
        JSON.stringify({ state: initialState })
      )
    }
  }
}

// Datos de ejemplo para dashboard metrics
export const mockDashboardMetrics = {
  storeId: 'store-fashion-001',
  period: '30days' as const,
  totalRevenue: 15750000, // $15,750,000 COP
  totalOrders: 156,
  totalCustomers: 89,
  totalProducts: 245,
  conversionRate: 3.2,
  averageOrderValue: 101000,
  topSellingProducts: [
    {
      productId: 'prod-001',
      name: 'Vestido Elegante Negro',
      image: '/products/vestido-negro.jpg',
      quantitySold: 24,
      revenue: 2400000,
    },
    {
      productId: 'prod-002',
      name: 'Blusa Casual Blanca',
      image: '/products/blusa-blanca.jpg',
      quantitySold: 32,
      revenue: 1920000,
    },
    {
      productId: 'prod-003',
      name: 'Jeans Slim Fit',
      image: '/products/jeans-slim.jpg',
      quantitySold: 18,
      revenue: 1620000,
    },
  ],
  recentOrders: [
    {
      id: 'order-001',
      orderNumber: 'ORD-2024-001',
      customerName: 'Ana Rodríguez',
      total: 150000,
      status: 'processing' as const,
      createdAt: new Date('2024-12-15T10:30:00'),
    },
    {
      id: 'order-002',
      orderNumber: 'ORD-2024-002',
      customerName: 'Carlos Mendoza',
      total: 89000,
      status: 'shipped' as const,
      createdAt: new Date('2024-12-15T08:15:00'),
    },
  ],
  lowStockProducts: [
    {
      productId: 'prod-004',
      name: 'Chaqueta de Cuero',
      currentStock: 2,
      minimumStock: 5,
      variantDetails: 'Talla M, Color Negro',
    },
    {
      productId: 'prod-005',
      name: 'Zapatos Deportivos',
      currentStock: 1,
      minimumStock: 3,
      variantDetails: 'Talla 38, Color Blanco',
    },
  ],
}
