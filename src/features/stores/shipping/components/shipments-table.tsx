import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, CheckCircle, Truck, Package } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Order } from '@/types/orders'

interface ShipmentsTableProps {
  shipments: Order[]
  onViewDetails: (order: Order) => void
  onMarkAsDelivered: (order: Order) => void
  isLoading?: boolean
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string; icon: any }> = {
    pending: { variant: 'secondary', label: 'Pendiente', icon: Package },
    processing: { variant: 'default', label: 'Procesando', icon: Package },
    shipped: { variant: 'default', label: 'Enviado', icon: Truck },
    delivered: { variant: 'success', label: 'Entregado', icon: CheckCircle },
    cancelled: { variant: 'destructive', label: 'Cancelado', icon: Package },
  }
  
  const config = variants[status] || { variant: 'default', label: status, icon: Package }
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export function ShipmentsTable({
  shipments,
  onViewDetails,
  onMarkAsDelivered,
  isLoading,
}: ShipmentsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando envíos...</div>
      </div>
    )
  }

  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-muted-foreground mb-2">No hay envíos registrados</div>
        <div className="text-sm text-muted-foreground">
          Los envíos aparecerán aquí cuando se marquen órdenes como enviadas
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Método de Envío</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Envío</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="font-medium">{order.orderNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </div>
              </TableCell>
              <TableCell>
                <div>{order.customer.firstName} {order.customer.lastName}</div>
                <div className="text-xs text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </div>
              </TableCell>
              <TableCell>
                <div>{order.shippingMethod.name}</div>
                {order.shippingMethod.carrier && (
                  <div className="text-xs text-muted-foreground">
                    {order.shippingMethod.carrier}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {order.trackingNumbers.length > 0 ? (
                  <div>
                    {order.trackingNumbers.map((tracking, index) => (
                      <div key={index} className="mb-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {tracking.trackingNumber}
                        </code>
                        {tracking.trackingUrl && (
                          <a
                            href={tracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline ml-2"
                          >
                            Rastrear
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin tracking</span>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(order.fulfillmentStatus)}
              </TableCell>
              <TableCell>
                {order.updatedAt && format(order.updatedAt, 'dd MMM yyyy', { locale: es })}
                {order.estimatedDeliveryDate && (
                  <div className="text-xs text-muted-foreground">
                    Est: {format(order.estimatedDeliveryDate, 'dd MMM', { locale: es })}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </DropdownMenuItem>
                    {order.fulfillmentStatus === 'shipped' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onMarkAsDelivered(order)}
                          className="text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Entregado
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}



