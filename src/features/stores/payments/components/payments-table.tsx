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
import { MoreHorizontal, Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { OrderPayment } from '@/types/orders'
import type { Order } from '@/types/orders'

interface PaymentsTableProps {
  payments: Array<OrderPayment & { order: Order }>
  onViewDetails: (payment: OrderPayment & { order: Order }) => void
  onApproveVoucher?: (payment: OrderPayment & { order: Order }) => void
  onRejectVoucher?: (payment: OrderPayment & { order: Order }) => void
  isLoading?: boolean
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Pendiente' },
    authorized: { variant: 'default', label: 'Autorizado' },
    paid: { variant: 'success', label: 'Pagado' },
    partially_paid: { variant: 'default', label: 'Pago Parcial' },
    failed: { variant: 'destructive', label: 'Fallido' },
    cancelled: { variant: 'destructive', label: 'Cancelado' },
    refunded: { variant: 'secondary', label: 'Reembolsado' },
  }
  
  const config = variants[status] || { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    paypal: 'PayPal',
    bank_transfer: 'Transferencia',
    cash_on_delivery: 'Contra Entrega',
  }
  return labels[method] || method
}

export function PaymentsTable({
  payments,
  onViewDetails,
  onApproveVoucher,
  onRejectVoucher,
  isLoading,
}: PaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando pagos...</div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-2">No hay pagos registrados</div>
        <div className="text-sm text-muted-foreground">
          Los pagos aparecerán aquí cuando se procesen órdenes
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
            <TableHead>Método</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="font-medium">{payment.order.orderNumber}</div>
                {payment.transactionId && (
                  <div className="text-xs text-muted-foreground">
                    ID: {payment.transactionId}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>{payment.order.customer.firstName} {payment.order.customer.lastName}</div>
                <div className="text-xs text-muted-foreground">
                  {payment.order.customer.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getMethodLabel(payment.method)}
                  {payment.method === 'bank_transfer' && payment.voucherUrl && (
                    <a
                      href={payment.voucherUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {payment.provider && (
                  <div className="text-xs text-muted-foreground">{payment.provider}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {payment.currency} {payment.amount.toFixed(2)}
                </div>
                {payment.processingFee && (
                  <div className="text-xs text-muted-foreground">
                    Comisión: {payment.currency} {payment.processingFee.toFixed(2)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(payment.status)}
                {payment.method === 'bank_transfer' && payment.voucherStatus && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      Voucher: {payment.voucherStatus === 'pending' ? 'Pendiente' : 
                                payment.voucherStatus === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {format(payment.createdAt, 'dd MMM yyyy HH:mm', { locale: es })}
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
                    <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </DropdownMenuItem>
                    {payment.method === 'bank_transfer' && 
                     payment.voucherStatus === 'pending' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onApproveVoucher?.(payment)}
                          className="text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar Voucher
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onRejectVoucher?.(payment)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar Voucher
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



