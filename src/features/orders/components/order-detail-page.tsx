import { useEffect, useState } from 'react'
import { useNavigate, getRouteApi } from '@tanstack/react-router'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  User, 
  MapPin, 
  FileText, 
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Save,
  X,
  Download,
  Printer,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { orderService } from '@/services/orderService'
import { OrderStatusSelector, PaymentStatusSelector, FulfillmentStatusSelector } from './order-status-selector'
import { VoucherManager } from './voucher-manager'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/orders'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

const routeApi = getRouteApi('/_authenticated/orders/$orderId')

export function OrderDetailPage() {
  const navigate = useNavigate()
  const { orderId } = routeApi.useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderData = await orderService.getOrder(orderId)
      if (!orderData) {
        toast.error('Orden no encontrada')
        navigate({ to: '/orders' })
        return
      }
      setOrder(orderData)
      setInternalNotes(orderData.internalNotes || '')
    } catch (error) {
      console.error('Error loading order:', error)
      toast.error('Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return
    try {
      await orderService.updateOrderStatus(order.id, status)
      toast.success('Estado de orden actualizado')
      await loadOrder()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar estado')
    }
  }

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    if (!order) return
    try {
      await orderService.updatePaymentStatus(order.id, status)
      toast.success('Estado de pago actualizado')
      await loadOrder()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Error al actualizar estado de pago')
    }
  }

  const handleFulfillmentStatusChange = async (status: FulfillmentStatus) => {
    if (!order) return
    try {
      await orderService.updateFulfillmentStatus(order.id, status)
      toast.success('Estado de envío actualizado')
      await loadOrder()
    } catch (error) {
      console.error('Error updating fulfillment status:', error)
      toast.error('Error al actualizar estado de envío')
    }
  }

  const handleSaveNotes = async () => {
    if (!order) return
    setIsSaving(true)
    try {
      await orderService.updateOrder(order.id, { internalNotes })
      toast.success('Notas guardadas')
      setIsEditingNotes(false)
      loadOrder()
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Error al guardar notas')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'DOP') {
      return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <NotificationBell />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="space-y-6 p-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </Main>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <NotificationBell />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Orden no encontrada</p>
            <Button onClick={() => navigate({ to: '/orders' })} className="mt-4">
              Volver a órdenes
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const toDate = (date: any): Date => {
    if (!date) return new Date()
    if (date instanceof Date) return date
    if (date?.toDate) return date.toDate()
    return new Date(date)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <NotificationBell />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="space-y-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/orders' })}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Orden {order.orderNumber}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Creada el {format(toDate(order.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Estado de Orden</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusSelector
                  currentStatus={order.status}
                  onStatusChange={handleStatusChange}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Estado de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentStatusSelector
                  currentStatus={order.paymentStatus}
                  onStatusChange={handlePaymentStatusChange}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Estado de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <FulfillmentStatusSelector
                  currentStatus={order.fulfillmentStatus}
                  onStatusChange={handleFulfillmentStatusChange}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Columna Principal */}
            <div className="md:col-span-2 space-y-6">
              {/* Items de la Orden */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos</CardTitle>
                  <CardDescription>{order.items.length} artículo(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <img
                          src={item.productSnapshot.images[0] || '/placeholder-product.jpg'}
                          alt={item.productSnapshot.name}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productSnapshot.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.variantSnapshot.title}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">Cantidad: {item.quantity}</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(item.unitPrice, order.currency)} c/u
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.totalPrice, order.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Información de Pago */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.paymentMethods.map((payment) => (
                    <div key={payment.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium capitalize">{payment.method.replace('_', ' ')}</span>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Monto:</span>
                          <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <span className="text-muted-foreground">ID de Transacción:</span>
                            <p className="font-mono text-xs">{payment.transactionId}</p>
                          </div>
                        )}
                      </div>
                      {payment.method === 'bank_transfer' && (
                        <VoucherManager
                          orderId={order.id}
                          payment={payment}
                          onUpdate={loadOrder}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Información de Envío */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.shippingMethod.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.shippingMethod.description}</p>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(order.shippingMethod.price, order.currency)}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dirección de Envío
                    </h4>
                    <div className="text-sm space-y-1">
                      {order.shippingAddress.firstName && (
                        <p>
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                      )}
                      {(order.shippingAddress as any).deliveryType === 'store_pickup' ? (
                        <>
                          <p className="font-medium">Recoger en Tienda</p>
                          <p>{order.shippingAddress.reference || 'Plaza Las Américas, Local 123'}</p>
                        </>
                      ) : (order.shippingAddress as any).deliveryType === 'pickup' ? (
                        <>
                          <p className="font-medium">Recoger en Agencia</p>
                          {(order.shippingAddress as any).shippingAgency && (
                            <p>{(order.shippingAddress as any).shippingAgency}</p>
                          )}
                          {(order.shippingAddress as any).agencyBranch && (
                            <p>{(order.shippingAddress as any).agencyBranch}</p>
                          )}
                          <p>{order.shippingAddress.city}</p>
                        </>
                      ) : (
                        <>
                          {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                          {order.shippingAddress.houseNumber && (
                            <p>#{order.shippingAddress.houseNumber}</p>
                          )}
                          <p>
                            {order.shippingAddress.sector}, {order.shippingAddress.city}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                          {order.shippingAddress.reference && (
                            <p className="text-muted-foreground mt-2">
                              Referencia: {order.shippingAddress.reference}
                            </p>
                          )}
                        </>
                      )}
                      {order.shippingAddress.phone && (
                        <p className="flex items-center gap-1 mt-2">
                          <Phone className="h-3 w-3" />
                          {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {order.trackingNumbers && order.trackingNumbers.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Números de Seguimiento</h4>
                        <div className="space-y-2">
                          {order.trackingNumbers.map((tracking, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Badge variant="outline">{tracking.trackingNumber}</Badge>
                              <span className="text-sm text-muted-foreground">{tracking.carrier}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Información del Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.customer ? (
                    <>
                      <div>
                        <p className="font-medium">
                          {order.customer.firstName || ''} {order.customer.lastName || ''}
                        </p>
                        {order.customer.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {order.customer.email}
                          </p>
                        )}
                        {order.customer.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {order.customer.phone}
                          </p>
                        )}
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total de Órdenes</span>
                          <p className="font-medium">{order.customer.totalOrders || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Gastado</span>
                          <p className="font-medium">{formatCurrency(order.customer.totalSpent || 0, order.currency)}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Perfil Completo
                      </Button>
                    </>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">Información del cliente no disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de Totales */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal, order.currency)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento</span>
                      <span className="text-green-600">-{formatCurrency(order.discountAmount, order.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span>{formatCurrency(order.taxAmount, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{formatCurrency(order.shippingAmount, order.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notas Internas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Notas Internas</CardTitle>
                    {!isEditingNotes && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingNotes(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <div className="space-y-3">
                      <Textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Agregar notas internas..."
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingNotes(false)
                            setInternalNotes(order.internalNotes || '')
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {order.internalNotes || 'No hay notas internas'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Notas del Cliente */}
              {order.customerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {order.customerNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

