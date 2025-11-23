import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Package, 
  FolderTree, 
  Settings, 
  Upload,
  BarChart3
} from 'lucide-react'

interface QuickActionsProps {
  storeId: string
  storeType?: 'fashion' | 'jewelry'
}

export function QuickActions({ storeId, storeType }: QuickActionsProps) {
  const actions = [
    {
      label: 'Nuevo Producto',
      description: 'Agregar producto al catálogo',
      icon: Plus,
      href: '/products',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Gestionar Inventario',
      description: 'Actualizar stock de productos',
      icon: Package,
      href: '/inventory',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Organizar Categorías',
      description: 'Crear y editar categorías',
      icon: FolderTree,
      href: '/products/categories',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Configurar Atributos',
      description: 'Definir propiedades de productos',
      icon: Settings,
      href: '/attributes',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Importar Productos',
      description: 'Carga masiva desde CSV',
      icon: Upload,
      href: '/products',
      color: 'from-pink-500 to-pink-600',
    },
    {
      label: 'Ver Reportes',
      description: 'Análisis y estadísticas',
      icon: BarChart3,
      href: '/reports',
      color: 'from-indigo-500 to-indigo-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} to={action.href}>
                <button className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-all duration-200 hover:shadow-md group">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">{action.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}











