import { AlertTriangle, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface LowStockAlertsProps {
  products: Product[]
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)

  // Ordenar por cantidad de stock (menor primero)
  const sortedProducts = [...products].sort((a, b) => a.totalInventory - b.totalInventory)

  if (sortedProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas de Stock
          </CardTitle>
          <CardDescription>
            Productos con stock bajo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Todos los productos tienen stock suficiente
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Stock Bajo
        </CardTitle>
        <CardDescription>
          {products.length} productos necesitan reposición urgente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedProducts.slice(0, 6).map((product) => {
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
          const isCritical = product.totalInventory <= 2
          
          return (
            <div 
              key={product.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isCritical 
                  ? 'bg-red-50 border-red-200 hover:border-red-300' 
                  : 'bg-white border-orange-200 hover:border-orange-300'
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {primaryImage ? (
                  <img 
                    src={primaryImage.url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(product.basePrice || 0)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={isCritical ? "destructive" : "secondary"}
                      className={isCritical ? "" : "bg-orange-100 text-orange-700 border-orange-200"}
                    >
                      {product.totalInventory} {product.totalInventory === 1 ? 'unidad' : 'unidades'}
                    </Badge>
                    {isCritical && (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Crítico
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {sortedProducts.length > 6 && (
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              +{sortedProducts.length - 6} productos más con stock bajo
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
