import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import type { Product } from '@/types'

interface InventoryWidgetProps {
  products: Product[]
  isLoading?: boolean
}

export function InventoryWidget({ products, isLoading }: InventoryWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Cargando inventario...</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)

  // Métricas de inventario
  const totalProducts = products.length
  const inStockProducts = products.filter(p => p.totalInventory > 0)
  const lowStockProducts = products.filter(p => p.totalInventory > 0 && p.totalInventory <= 5)
  const outOfStockProducts = products.filter(p => p.totalInventory === 0)
  const criticalStockProducts = products.filter(p => p.totalInventory > 0 && p.totalInventory <= 2)
  
  const totalUnits = products.reduce((sum, p) => sum + p.totalInventory, 0)
  const totalValue = products.reduce((sum, p) => sum + (p.basePrice || 0) * p.totalInventory, 0)
  
  // Productos con más inventario
  const topInventory = [...products]
    .sort((a, b) => b.totalInventory - a.totalInventory)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Resumen del Inventario */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Stock</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inStockProducts.length}</div>
            <Progress 
              value={totalProducts > 0 ? (inStockProducts.length / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {totalUnits} unidades totales
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <Progress 
              value={totalProducts > 0 ? (lowStockProducts.length / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              ≤ 5 unidades
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
            <Progress 
              value={totalProducts > 0 ? (outOfStockProducts.length / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {criticalStockProducts.length} críticos (≤ 2)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Inventario disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Productos con Más Inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Productos con Mayor Stock</CardTitle>
          <CardDescription>
            Los 5 productos con más unidades en inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topInventory.map((product, index) => {
              const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
              const stockPercentage = totalUnits > 0 ? (product.totalInventory / totalUnits) * 100 : 0
              
              return (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {index + 1}
                  </div>
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
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <Badge variant="outline" className="ml-2">
                        {product.totalInventory} unidades
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={stockPercentage} className="flex-1 h-1.5" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {stockPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(product.basePrice || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency((product.basePrice || 0) * product.totalInventory)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticas */}
      {criticalStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Alertas Críticas de Stock
            </CardTitle>
            <CardDescription>
              Productos con 2 o menos unidades disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalStockProducts.map((product) => {
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
                
                return (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {primaryImage ? (
                        <img 
                          src={primaryImage.url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.basePrice || 0)}
                      </p>
                    </div>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {product.totalInventory} {product.totalInventory === 1 ? 'unidad' : 'unidades'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Productos Agotados */}
      {outOfStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Productos Agotados
            </CardTitle>
            <CardDescription>
              {outOfStockProducts.length} productos sin stock disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockProducts.slice(0, 5).map((product) => {
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
                
                return (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {primaryImage ? (
                        <img 
                          src={primaryImage.url} 
                          alt={product.name}
                          className="w-full h-full object-cover opacity-50"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.basePrice || 0)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Agotado
                    </Badge>
                  </div>
                )
              })}
              {outOfStockProducts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{outOfStockProducts.length - 5} productos más agotados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}












