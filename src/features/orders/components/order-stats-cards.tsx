import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, TrendingUp, Clock } from 'lucide-react'
import type { PaginatedOrderResponse } from '@/types'

interface OrderStatsCardsProps {
  aggregations?: PaginatedOrderResponse['aggregations']
}

const formatCurrency = (amount: number) => {
  return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function OrderStatsCards({ aggregations }: OrderStatsCardsProps) {
  if (!aggregations) {
    return null
  }

  const { totalRevenue, averageOrderValue, statusCounts } = aggregations

  const totalOrders =
    (statusCounts.pending || 0) +
    (statusCounts.processing || 0) +
    (statusCounts.shipped || 0) +
    (statusCounts.delivered || 0) +
    (statusCounts.cancelled || 0) +
    (statusCounts.refunded || 0) +
    (statusCounts.partially_refunded || 0)

  const pendingOrders = (statusCounts.pending || 0) + (statusCounts.processing || 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            De {totalOrders} órdenes totales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
          <p className="text-xs text-muted-foreground">
            Valor promedio por orden
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de órdenes</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {statusCounts.delivered || 0} entregadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            Requieren atención
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
















