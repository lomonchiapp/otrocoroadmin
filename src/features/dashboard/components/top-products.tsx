import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ProductMetric } from '@/types'

interface TopProductsProps {
  products: ProductMetric[]
}

export function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calcular el total para las barras de progreso
  const maxRevenue = Math.max(...products.map(p => p.revenue))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>
          Los productos con mejor rendimiento este mes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((product, index) => (
          <div key={product.productId} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={product.image} alt={product.name} />
                <AvatarFallback>
                  {product.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium leading-none">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.quantitySold} vendidos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(product.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{index + 1}
                  </p>
                </div>
              </div>
              
              <Progress 
                value={(product.revenue / maxRevenue) * 100} 
                className="h-1.5"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
