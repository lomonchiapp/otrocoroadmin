import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { DollarSign, CreditCard, Banknote, Receipt, Check, Printer, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { usePosStore } from '@/stores/pos-store'
import { useStoreStore } from '@/stores/store-store'
import { auth as firebaseAuth } from '@/lib/firebase'
import { posService } from '@/services/posService'
import { orderService } from '@/services/orderService'
import { invoiceService } from '@/services/invoiceService'
import type { Order } from '@/types/orders'

interface PaymentTerminalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
}

export function PaymentTerminal({ open, onOpenChange, total }: PaymentTerminalProps) {
  const { 
    cart, 
    clearCart, 
    session,
    customer, 
    getCartSubtotal,
    getCartTax
  } = usePosStore()
  const { store } = useStoreStore()
  const currentUser = firebaseAuth.currentUser
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [amountTendered, setAmountTendered] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{ orderId: string, invoiceId: string, change: number } | null>(null)
  const [generateInvoice, setGenerateInvoice] = useState(true)

  // Calcular devuelta
  const tenderAmount = parseFloat(amountTendered) || 0
  const change = Math.max(0, tenderAmount - total)
  const remaining = Math.max(0, total - tenderAmount)
  const isSufficient = paymentMethod === 'cash' ? tenderAmount >= total : true

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setCompletedOrder(null)
      setAmountTendered('')
      setIsProcessing(false)
    }
  }, [open])

  const handleProcessPayment = async () => {
    if (!store || !currentUser || !session) {
      if (!currentUser) {
        toast.error('Debes estar autenticado para procesar pagos')
        return
      }
      toast.error('Error de sesión o tienda')
      return
    }

    setIsProcessing(true)
    try {
      // 1. Crear Orden
      // Mapear items del carrito al formato de Orden
      const orderItems = cart.map(item => ({
        productId: item.productId,
        productSnapshot: {
          id: item.productId,
          name: item.name.split(' - ')[0], // Hack simple, idealmente guardar el nombre base
          description: '',
          images: [item.image || ''],
          price: item.originalPrice,
          costPrice: 0 // No disponible en el carrito, se debería obtener del producto real si es necesario
        },
        variantId: item.variantId,
        variantSnapshot: {
          id: item.variantId,
          sku: item.sku,
          price: item.price,
          title: item.name.includes(' - ') ? item.name.split(' - ')[1] : 'Default',
          inventoryPolicy: 'track',
          inventoryQuantity: 0
        },
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total
      }))

      const orderData: any = {
        storeId: store.id,
        userId: customer?.id || 'guest', // Si es guest, el backend/servicio debería manejarlo
        customer: customer ? {
          id: customer.id,
          firstName: customer.name.split(' ')[0],
          lastName: customer.name.split(' ').slice(1).join(' ') || '',
          email: customer.email || '',
          phone: '',
          isGuest: false
        } : {
          id: 'guest',
          firstName: 'Consumidor',
          lastName: 'Final',
          isGuest: true
        },
        items: orderItems,
        subtotal: getCartSubtotal(),
        taxAmount: getCartTax(),
        shippingAmount: 0,
        discountAmount: 0, // TODO: Implementar descuentos globales
        totalAmount: total,
        status: 'delivered', // Entregado inmediatamente en POS
        paymentStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        paymentMethod: {
          method: paymentMethod,
          amount: total,
          currency: 'DOP',
          status: 'paid'
        },
        source: 'pos',
        shippingAddress: { // Dirección dummy para POS
          address1: 'Tienda Física',
          city: store.city || 'Santo Domingo',
          country: 'Dominican Republic',
          firstName: 'POS',
          lastName: 'Sale',
          deliveryType: 'pickup'
        },
        billingAddress: {
           address1: 'Tienda Física',
           city: store.city || 'Santo Domingo',
           country: 'Dominican Republic',
           firstName: 'POS',
           lastName: 'Sale',
           deliveryType: 'pickup'
        }
      }

      const orderId = await orderService.createOrder(orderData)

      // 2. Generar Factura (si aplica)
      let invoiceId = ''
      if (generateInvoice) {
         // Generar número de factura específico para esta caja si tuviéramos ID de caja
         // Por ahora usa storeId
         invoiceId = await invoiceService.createInvoiceFromOrder({
           orderId,
           dueDate: new Date(), // Pago inmediato
           paymentTerms: 'contado'
         }, store.id, currentUser.uid)
      }

      // 3. Registrar Transacción en Caja
      await posService.registerTransaction({
        sessionId: session.id,
        storeId: store.id,
        type: 'sale',
        amount: total,
        currency: 'DOP',
        paymentMethod: paymentMethod,
        orderId,
        invoiceId,
        performedBy: currentUser.uid
      })

      // 4. Completar
      setCompletedOrder({
        orderId,
        invoiceId,
        change: paymentMethod === 'cash' ? change : 0
      })
      clearCart()
      toast.success('Venta completada exitosamente')

    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Error al procesar la venta')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewSale = () => {
    onOpenChange(false)
  }

  if (completedOrder) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl">¡Venta Exitosa!</DialogTitle>
            
            {completedOrder.change > 0 && (
              <div className="bg-muted p-4 rounded-lg w-full max-w-xs mx-auto">
                <p className="text-sm text-muted-foreground mb-1">Su cambio:</p>
                <p className="text-3xl font-bold text-primary">${completedOrder.change.toLocaleString()}</p>
              </div>
            )}

            <div className="flex gap-2 w-full justify-center pt-4">
              <Button variant="outline" className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Recibo
              </Button>
              {completedOrder.invoiceId && (
                <Button variant="outline" className="flex-1">
                  <Receipt className="mr-2 h-4 w-4" />
                  Factura Fiscal
                </Button>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button size="lg" className="w-full" onClick={handleNewSale}>
              Nueva Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Procesar Pago</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Payment Methods */}
          <div className="w-1/3 border-r bg-muted/30 p-4 space-y-2">
            <Button 
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              className="w-full justify-start h-12 text-lg"
              onClick={() => setPaymentMethod('cash')}
            >
              <Banknote className="mr-2 h-5 w-5" />
              Efectivo
            </Button>
            <Button 
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className="w-full justify-start h-12 text-lg"
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Tarjeta
            </Button>
            <Button 
              variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
              className="w-full justify-start h-12 text-lg"
              onClick={() => setPaymentMethod('transfer')}
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Transferencia
            </Button>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between px-2">
              <Label htmlFor="invoice-toggle" className="cursor-pointer">Generar Factura</Label>
              <Switch 
                id="invoice-toggle" 
                checked={generateInvoice} 
                onCheckedChange={setGenerateInvoice} 
              />
            </div>
          </div>

          {/* Right: Amount Entry */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 space-y-6">
              <div className="text-center space-y-1">
                <p className="text-muted-foreground">Total a Pagar</p>
                <p className="text-4xl font-bold text-primary">${total.toLocaleString()}</p>
              </div>

              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Monto Recibido</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="number" 
                        className="pl-10 h-14 text-2xl"
                        placeholder="0.00"
                        autoFocus
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 200, 500, 1000, 2000].map((amount) => (
                      <Button 
                        key={amount} 
                        variant="outline" 
                        onClick={() => setAmountTendered(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                    <Button variant="outline" onClick={() => setAmountTendered(total.toString())}>
                      Exacto
                    </Button>
                  </div>

                  {tenderAmount > 0 && (
                    <div className={`p-4 rounded-lg border flex justify-between items-center ${isSufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <span className="font-medium">{isSufficient ? 'Devuelta:' : 'Faltante:'}</span>
                      <span className={`text-xl font-bold ${isSufficient ? 'text-green-700' : 'text-red-700'}`}>
                        ${(isSufficient ? change : remaining).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/20">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Procesar en terminal externa</p>
                  <Button variant="link" size="sm" onClick={() => setAmountTendered(total.toString())}>
                    Marcar como Cobrado
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              <Button 
                size="lg" 
                className="w-full text-lg h-12" 
                disabled={!isSufficient || isProcessing || (paymentMethod === 'cash' && tenderAmount === 0)}
                onClick={handleProcessPayment}
              >
                {isProcessing ? 'Procesando...' : `Confirmar Pago ($${total.toLocaleString()})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

