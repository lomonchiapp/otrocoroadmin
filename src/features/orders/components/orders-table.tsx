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
import { DataTable } from '@/components/data-table'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'
import { 
  MoreHorizontal, 
  Eye, 
  FileText, 
  Truck, 
  CheckCircle,
  XCircle,
  DollarSign,
  Package
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrderStatusSelector, PaymentStatusSelector, FulfillmentStatusSelector } from './order-status-selector'

interface OrdersTableProps {
  orders: Order[]
  isLoading?: boolean
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void
  onUpdatePaymentStatus?: (orderId: string, status: PaymentStatus) => void
  onUpdateFulfillmentStatus?: (orderId: string, status: FulfillmentStatus) => void
  onGenerateInvoice?: (orderId: string) => void
}

// Badge variants para estados
const getStatusBadge = (status: OrderStatus) => {
  const variants: Record<OrderStatus, { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Pendiente' },
    processing: { variant: 'default', label: 'Procesando' },
    shipped: { variant: 'default', label: 'Enviado' },
    delivered: { variant: 'default', label: 'Entregado' },
    cancelled: { variant: 'destructive', label: 'Cancelado' },
    refunded: { variant: 'outline', label: 'Reembolsado' },
    partially_refunded: { variant: 'outline', label: 'Reemb. Parcial' },
  }
  return variants[status] || { variant: 'default', label: status }
}

const getPaymentStatusBadge = (status: PaymentStatus) => {
  const variants: Record<PaymentStatus, { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Pendiente' },
    authorized: { variant: 'default', label: 'Autorizado' },
    paid: { variant: 'default', label: 'Pagado' },
    failed: { variant: 'destructive', label: 'Fallido' },
    refunded: { variant: 'outline', label: 'Reembolsado' },
    partially_refunded: { variant: 'outline', label: 'Reemb. Parcial' },
  }
  return variants[status] || { variant: 'default', label: status }
}

const getFulfillmentStatusBadge = (status: FulfillmentStatus) => {
  const variants: Record<FulfillmentStatus, { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Pendiente' },
    processing: { variant: 'default', label: 'Procesando' },
    shipped: { variant: 'default', label: 'Enviado' },
    delivered: { variant: 'default', label: 'Entregado' },
  }
  return variants[status] || { variant: 'default', label: status }
}

const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'DOP') {
    return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function OrdersTable({
  orders,
  isLoading,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onUpdateFulfillmentStatus,
  onGenerateInvoice,
}: OrdersTableProps) {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Número',
      cell: ({ row }) => (
        <Link
          to="/orders/$orderId"
          params={{ orderId: row.original.id }}
          className="font-mono text-sm font-medium hover:underline"
        >
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Cliente',
      cell: ({ row }) => {
        const order = row.original
        // Compatibilidad: puede tener 'customer' o 'user'
        const customer = order.customer || (order as any).user
        
        if (!customer) {
          return (
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">Cliente no disponible</span>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
          )
        }
        
        // Manejar diferentes estructuras de datos
        const firstName = customer.firstName || customer.displayName?.split(' ')[0] || ''
        const lastName = customer.lastName || customer.displayName?.split(' ').slice(1).join(' ') || ''
        const email = customer.email || ''
        const displayName = firstName && lastName 
          ? `${firstName} ${lastName}`.trim()
          : customer.displayName || email || 'Cliente'
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {displayName}
            </span>
            {email && (
              <span className="text-sm text-muted-foreground">{email}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        return (
          <OrderStatusSelector
            currentStatus={row.original.status}
            onStatusChange={(status) => onUpdateStatus?.(row.original.id, status)}
            variant="compact"
          />
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Pago',
      cell: ({ row }) => {
        return (
          <PaymentStatusSelector
            currentStatus={row.original.paymentStatus}
            onStatusChange={(status) => onUpdatePaymentStatus?.(row.original.id, status)}
            variant="compact"
          />
        )
      },
    },
    {
      accessorKey: 'fulfillmentStatus',
      header: 'Envío',
      cell: ({ row }) => {
        return (
          <FulfillmentStatusSelector
            currentStatus={row.original.fulfillmentStatus}
            onStatusChange={(status) => onUpdateFulfillmentStatus?.(row.original.id, status)}
            variant="compact"
          />
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.totalAmount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'itemsCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.itemsCount} artículos</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateInvoice?.(order.id)}>
                <FileText className="mr-2 h-4 w-4" />
                Generar factura
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onUpdateStatus?.(order.id, 'processing')}>
                <Package className="mr-2 h-4 w-4" />
                Marcar como procesando
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateFulfillmentStatus?.(order.id, 'shipped')}>
                <Truck className="mr-2 h-4 w-4" />
                Marcar como enviado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus?.(order.id, 'delivered')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como entregado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Pago</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onUpdatePaymentStatus?.(order.id, 'paid')}>
                <DollarSign className="mr-2 h-4 w-4" />
                Marcar como pagado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onUpdateStatus?.(order.id, 'cancelled')}
                className="text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar orden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isLoading}
      searchKey="orderNumber"
      searchPlaceholder="Buscar por número de orden..."
    />
  )
}
















