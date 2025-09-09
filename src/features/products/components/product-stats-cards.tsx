import { Package, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductStatsCardsProps {
  storeId: string
}

export function ProductStatsCards({ storeId }: ProductStatsCardsProps) {
  // En un caso real, estos datos vendrían de una API
  const stats = {
    totalProducts: 245,
    activeProducts: 198,
    lowStockProducts: 12,
    featuredProducts: 24,
    draftProducts: 47,
    outOfStockProducts: 8,
  }

  const cards = [
    {
      title: 'Total de Productos',
      value: stats.totalProducts.toLocaleString(),
      description: `${stats.activeProducts} activos`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Productos Activos',
      value: stats.activeProducts.toLocaleString(),
      description: `${((stats.activeProducts / stats.totalProducts) * 100).toFixed(1)}% del total`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Bajo Stock',
      value: stats.lowStockProducts.toLocaleString(),
      description: 'Requieren reabastecimiento',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Destacados',
      value: stats.featuredProducts.toLocaleString(),
      description: 'Productos promocionados',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
