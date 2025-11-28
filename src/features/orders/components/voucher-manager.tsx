import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { OrderPayment } from '@/types/orders'
import { orderService } from '@/services/orderService'
import { toast } from 'sonner'

interface VoucherManagerProps {
  orderId: string
  payment: OrderPayment
  onUpdate: () => void
}

export function VoucherManager({ orderId, payment, onUpdate }: VoucherManagerProps) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleApproveVoucher = async () => {
    setIsUpdating(true)
    try {
      const order = await orderService.getOrderById(orderId)
      if (!order) {
        throw new Error('Orden no encontrada')
      }

      const updatedPayments = order.paymentMethods.map(p =>
        p.id === payment.id
          ? {
              ...p,
              voucherStatus: 'approved',
              voucherReviewedAt: new Date(),
              voucherReviewedBy: 'current-user-id', // TODO: Obtener del auth
              voucherNotes: reviewNotes
            }
          : p
      )

      await orderService.updateOrder(orderId, {
        paymentMethods: updatedPayments,
        paymentStatus: 'paid'
      })

      toast.success('Voucher aprobado y orden marcada como pagada')
      setIsReviewDialogOpen(false)
      setReviewNotes('')
      onUpdate()
    } catch (error) {
      console.error('Error approving voucher:', error)
      toast.error('Error al aprobar voucher')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRejectVoucher = async () => {
    setIsUpdating(true)
    try {
      const order = await orderService.getOrderById(orderId)
      if (!order) {
        throw new Error('Orden no encontrada')
      }

      const updatedPayments = order.paymentMethods.map(p =>
        p.id === payment.id
          ? {
              ...p,
              voucherStatus: 'rejected',
              voucherReviewedAt: new Date(),
              voucherReviewedBy: 'current-user-id', // TODO: Obtener del auth
              voucherNotes: reviewNotes
            }
          : p
      )

      await orderService.updateOrder(orderId, {
        paymentMethods: updatedPayments
      })

      toast.success('Voucher rechazado')
      setIsReviewDialogOpen(false)
      setReviewNotes('')
      onUpdate()
    } catch (error) {
      console.error('Error rejecting voucher:', error)
      toast.error('Error al rechazar voucher')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!payment.voucherUrl) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">No hay voucher subido</p>
        </CardContent>
      </Card>
    )
  }

  const getVoucherStatusBadge = () => {
    switch (payment.voucherStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Voucher de Depósito</CardTitle>
          {getVoucherStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={payment.voucherUrl}
            alt="Voucher"
            className="w-32 h-32 object-cover rounded border"
          />
          <div className="flex-1 space-y-2">
            <div>
              <Label className="text-sm text-muted-foreground">Monto</Label>
              <p className="font-medium">{payment.currency} {payment.amount.toLocaleString()}</p>
            </div>
            {payment.voucherReviewedAt && (
              <div>
                <Label className="text-sm text-muted-foreground">Revisado</Label>
                <p className="text-sm">{new Date(payment.voucherReviewedAt).toLocaleString('es-DO')}</p>
              </div>
            )}
            {payment.voucherNotes && (
              <div>
                <Label className="text-sm text-muted-foreground">Notas</Label>
                <p className="text-sm">{payment.voucherNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Completo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Revisar Voucher</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={payment.voucherUrl}
                    alt="Voucher completo"
                    className="max-w-full max-h-96 object-contain rounded border"
                  />
                </div>
                <div>
                  <Label>Notas de Revisión</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Agregar notas sobre la revisión del voucher..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleRejectVoucher}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    onClick={handleApproveVoucher}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar y Marcar como Pagada
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(payment.voucherUrl, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}



