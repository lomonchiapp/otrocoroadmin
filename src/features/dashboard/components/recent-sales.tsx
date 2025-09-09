import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { OrderSummary } from '@/types'

interface RecentSalesProps {
  orders?: OrderSummary[]
}

export function RecentSales({ orders = [] }: RecentSalesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="default" className="text-xs">Procesando</Badge>
      case 'shipped':
        return <Badge variant="secondary" className="text-xs">Enviada</Badge>
      case 'delivered':
        return <Badge variant="outline" className="text-xs">Entregada</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelada</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">No hay órdenes recientes</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {orders.map((order) => (
        <div key={order.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {getInitials(order.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-col gap-1'>
            <div className="flex items-center justify-between">
              <p className='text-sm leading-none font-medium'>
                {order.customerName}
              </p>
              <div className='font-medium'>
                {formatCurrency(order.total)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className='text-muted-foreground text-xs'>
                  {order.orderNumber}
                </p>
                {getStatusBadge(order.status)}
              </div>
              <p className='text-muted-foreground text-xs'>
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
