import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Search, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import { PaymentsTable } from './components/payments-table'
import { orderService } from '@/services/orderService'
import { useStoreStore } from '@/stores/store-store'
import type { OrderPayment, Order } from '@/types/orders'
import { toast } from 'sonner'
import { format, startOfDay, endOfDay } from 'date-fns'

type PaymentWithOrder = OrderPayment & { order: Order }

export function PaymentsTracking() {
  const { store: currentStore } = useStoreStore()
  const [payments, setPayments] = useState<PaymentWithOrder[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (currentStore?.id) {
      loadPayments()
    }
  }, [currentStore?.id])

  useEffect(() => {
    filterPayments()
  }, [payments, searchQuery, methodFilter, statusFilter])

  const loadPayments = async () => {
    if (!currentStore?.id) return

    try {
      setIsLoading(true)
      // Obtener todas las órdenes y extraer los pagos
      const orders = await orderService.getOrdersByStore(currentStore.id)
      
      const allPayments: PaymentWithOrder[] = []
      orders.forEach((order) => {
        order.paymentMethods.forEach((payment) => {
          allPayments.push({
            ...payment,
            order,
          })
        })
      })

      // Ordenar por fecha más reciente
      allPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      setPayments(allPayments)
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error('Error al cargar los pagos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]

    // Filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (payment) =>
          payment.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro por método
    if (methodFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.method === methodFilter)
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }

  const handleViewDetails = (payment: PaymentWithOrder) => {
    toast.info('Funcionalidad de detalles en desarrollo')
    console.log('View payment details:', payment)
  }

  const handleApproveVoucher = async (payment: PaymentWithOrder) => {
    try {
      // TODO: Implementar aprobación de voucher
      toast.success('Voucher aprobado exitosamente')
      loadPayments()
    } catch (error) {
      console.error('Error approving voucher:', error)
      toast.error('Error al aprobar el voucher')
    }
  }

  const handleRejectVoucher = async (payment: PaymentWithOrder) => {
    try {
      // TODO: Implementar rechazo de voucher
      toast.success('Voucher rechazado')
      loadPayments()
    } catch (error) {
      console.error('Error rejecting voucher:', error)
      toast.error('Error al rechazar el voucher')
    }
  }

  // Calcular estadísticas
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)
  const todayAmount = payments
    .filter((p) => {
      const today = new Date()
      return (
        p.createdAt >= startOfDay(today) &&
        p.createdAt <= endOfDay(today)
      )
    })
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
            <p className="text-muted-foreground">
              Monitorea todos los pagos recibidos
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadPayments}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <p className="text-xs">Total Recaudado</p>
            </div>
            <div className="text-2xl font-bold">
              {currentStore?.currency || 'DOP'} {totalAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <p className="text-xs">Pagos Pendientes</p>
            </div>
            <div className="text-2xl font-bold">
              {currentStore?.currency || 'DOP'} {pendingAmount.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-xs">Pagos del Día</p>
            </div>
            <div className="text-2xl font-bold">
              {currentStore?.currency || 'DOP'} {todayAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por orden, cliente o transacción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank_transfer">Transferencia</SelectItem>
              <SelectItem value="credit_card">Tarjeta Crédito</SelectItem>
              <SelectItem value="debit_card">Tarjeta Débito</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <PaymentsTable
          payments={filteredPayments}
          onViewDetails={handleViewDetails}
          onApproveVoucher={handleApproveVoucher}
          onRejectVoucher={handleRejectVoucher}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}



