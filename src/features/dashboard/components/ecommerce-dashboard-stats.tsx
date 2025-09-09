import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardMetrics } from '@/types'

interface EcommerceDashboardStatsProps {
  metrics: DashboardMetrics
}

export function EcommerceDashboardStats({ metrics }: EcommerceDashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num)
  }

  const cards = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.totalRevenue),
      description: 'Últimos 30 días',
      icon: DollarSign,
      trend: '+12.5%',
      isPositive: true,
    },
    {
      title: 'Órdenes',
      value: formatNumber(metrics.totalOrders),
      description: `AOV: ${formatCurrency(metrics.averageOrderValue)}`,
      icon: ShoppingCart,
      trend: '+8.2%',
      isPositive: true,
    },
    {
      title: 'Clientes',
      value: formatNumber(metrics.totalCustomers),
      description: 'Clientes únicos',
      icon: Users,
      trend: '+15.3%',
      isPositive: true,
    },
    {
      title: 'Productos',
      value: formatNumber(metrics.totalProducts),
      description: `Tasa de conversión: ${metrics.conversionRate}%`,
      icon: Package,
      trend: '+2.1%',
      isPositive: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.isPositive ? TrendingUp : TrendingDown
        
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                <div className={`flex items-center text-xs ${
                  card.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {card.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
