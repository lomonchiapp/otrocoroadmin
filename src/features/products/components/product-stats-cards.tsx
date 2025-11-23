import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, Archive, Clock, AlertTriangle } from 'lucide-react'

interface ProductStatsProps {
  stats?: {
    totalProducts: number
    activeProducts: number
    draftProducts: number
    outOfStockProducts: number
    totalValue: number
  }
}

export function ProductStatsCards({ stats }: ProductStatsProps) {
  // Valores por defecto en caso de que no se proporcionen estadísticas
  const {
    totalProducts = 0,
    activeProducts = 0,
    draftProducts = 0,
    outOfStockProducts = 0,
    totalValue = 0
  } = stats || {}

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Productos</p>
              <h3 className="text-2xl font-bold">{totalProducts}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Valor total: ${totalValue.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Productos Activos</p>
              <h3 className="text-2xl font-bold">{activeProducts}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0}% del total
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Borradores</p>
              <h3 className="text-2xl font-bold">{draftProducts}</h3>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Productos pendientes de publicación
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Sin Stock</p>
              <h3 className="text-2xl font-bold">{outOfStockProducts}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Requieren reposición de inventario
          </div>
        </CardContent>
      </Card>
    </div>
  )
}