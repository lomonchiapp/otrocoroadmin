import { AlertTriangle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ProductStockAlert } from '@/types'

interface LowStockAlertsProps {
  products: ProductStockAlert[]
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Stock</CardTitle>
          <CardDescription>
            Productos con stock bajo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Todos los productos tienen stock suficiente
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Alertas de Stock
            </CardTitle>
            <CardDescription>
              {products.length} producto(s) requieren atención
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Ver Todo
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => {
          const stockPercentage = (product.currentStock / product.minimumStock) * 100
          const isOutOfStock = product.currentStock === 0
          const isCriticallyLow = product.currentStock <= Math.ceil(product.minimumStock * 0.3)

          return (
            <div key={product.productId} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                    {isOutOfStock && (
                      <Badge variant="destructive" className="text-xs">
                        Agotado
                      </Badge>
                    )}
                    {!isOutOfStock && isCriticallyLow && (
                      <Badge variant="destructive" className="text-xs">
                        Crítico
                      </Badge>
                    )}
                    {!isOutOfStock && !isCriticallyLow && (
                      <Badge variant="secondary" className="text-xs">
                        Bajo
                      </Badge>
                    )}
                  </div>
                  {product.variantDetails && (
                    <p className="text-xs text-muted-foreground">
                      {product.variantDetails}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {product.currentStock} / {product.minimumStock}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    unidades
                  </p>
                </div>
              </div>

              <Progress 
                value={Math.min(stockPercentage, 100)} 
                className={`h-2 ${
                  isOutOfStock 
                    ? '[&>div]:bg-red-500' 
                    : isCriticallyLow 
                    ? '[&>div]:bg-orange-500' 
                    : '[&>div]:bg-yellow-500'
                }`}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Stock actual</span>
                <span>Mínimo requerido: {product.minimumStock}</span>
              </div>
            </div>
          )
        })}

        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Reabastecer Todos
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Generar Orden
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
