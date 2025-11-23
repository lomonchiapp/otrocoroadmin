import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Star,
  Archive,
  FileQuestion
} from 'lucide-react'
import type { Product } from '@/types'

interface ProductsAnalyticsProps {
  products: Product[]
  stats?: {
    totalProducts: number
    publishedProducts: number
    draftProducts: number
    outOfStockProducts: number
    totalValue: number
  }
  isLoading?: boolean
}

export function ProductsAnalytics({ products, stats, isLoading }: ProductsAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Cargando análisis...</p>
        </CardContent>
      </Card>
    )
  }

  // Calcular métricas adicionales
  const totalProducts = products.length
  const publishedProducts = products.filter(p => p.status === 'published').length
  const draftProducts = products.filter(p => p.status === 'draft').length
  const archivedProducts = products.filter(p => p.status === 'archived').length
  const featuredProducts = products.filter(p => p.isFeatured).length
  const outOfStockProducts = products.filter(p => p.totalInventory === 0).length
  const lowStockProducts = products.filter(p => p.totalInventory > 0 && p.totalInventory <= 5).length
  
  const clothingProducts = products.filter(p => p.type === 'clothing').length
  const jewelryProducts = products.filter(p => p.type === 'jewelry').length
  
  const productsWithImages = products.filter(p => p.images && p.images.length > 0).length
  const productsWithDescription = products.filter(p => p.description && p.description.length > 10).length
  const productsWithVariations = products.filter(p => p.variations && p.variations.length > 0).length

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)

  const totalValue = products.reduce((sum, p) => sum + (p.basePrice || 0) * p.totalInventory, 0)
  const avgPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + (p.basePrice || 0), 0) / totalProducts : 0

  return (
    <div className="space-y-6">
      {/* Resumen de Estado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Publicados</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedProducts}</div>
            <Progress 
              value={totalProducts > 0 ? (publishedProducts / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {totalProducts > 0 ? Math.round((publishedProducts / totalProducts) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <FileQuestion className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftProducts}</div>
            <Progress 
              value={totalProducts > 0 ? (draftProducts / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Por publicar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destacados</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredProducts}</div>
            <Progress 
              value={totalProducts > 0 ? (featuredProducts / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Promocionados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivados</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedProducts}</div>
            <Progress 
              value={totalProducts > 0 ? (archivedProducts / totalProducts) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              No disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Valor */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Valor Total del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Precio promedio: {formatCurrency(avgPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Por Tipo de Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ropa</span>
                <div className="flex items-center gap-2">
                  <Progress value={totalProducts > 0 ? (clothingProducts / totalProducts) * 100 : 0} className="w-24" />
                  <Badge variant="secondary">{clothingProducts}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Joyería</span>
                <div className="flex items-center gap-2">
                  <Progress value={totalProducts > 0 ? (jewelryProducts / totalProducts) * 100 : 0} className="w-24" />
                  <Badge variant="secondary">{jewelryProducts}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Calidad del Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Con imágenes</span>
                <Badge variant="outline">
                  {totalProducts > 0 ? Math.round((productsWithImages / totalProducts) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Con descripción</span>
                <Badge variant="outline">
                  {totalProducts > 0 ? Math.round((productsWithDescription / totalProducts) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Con variantes</span>
                <Badge variant="outline">
                  {totalProducts > 0 ? Math.round((productsWithVariations / totalProducts) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Productos por Precio */}
      <Card>
        <CardHeader>
          <CardTitle>Productos de Mayor Valor</CardTitle>
          <CardDescription>Top 10 productos con precio más alto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products
              .sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
              .slice(0, 10)
              .map((product, index) => {
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
                return (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {product.type === 'clothing' ? 'Ropa' : 'Joyería'}
                        </Badge>
                        {product.totalInventory <= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Bajo stock
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.basePrice || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.totalInventory} unidades
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






