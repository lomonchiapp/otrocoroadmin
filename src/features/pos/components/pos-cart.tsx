import { useState } from 'react'
import { usePosStore } from '@/stores/pos-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  CreditCard,
  MoreVertical,
  Tag,
  Trash,
  ShoppingBag
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PaymentTerminal } from './payment-terminal'
import { cn } from '@/lib/utils'

export function PosCart() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    customer, 
    getCartSubtotal,
    getCartTax,
    getCartTotal
  } = usePosStore()
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  if (cart.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito Actual
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 opacity-30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">El carrito está vacío</h3>
          <p className="text-sm">Escanea un producto o selecciónalo del catálogo para comenzar una venta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Customer Header */}
      <div className="p-4 border-b bg-gradient-to-r from-muted/50 to-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">
              {customer ? customer.name : 'Consumidor Final'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {customer ? 'Cliente registrado' : 'Venta al contado'}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              Cambiar Cliente
            </DropdownMenuItem>
            <DropdownMenuItem>
              Aplicar Descuento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {cart.map((item) => (
            <div 
              key={`${item.productId}-${item.variantId}`} 
              className="flex gap-3 group p-3 rounded-xl border bg-card hover:border-primary/50 transition-all"
            >
              <div className="h-16 w-16 bg-muted rounded-lg border flex-shrink-0 overflow-hidden">
                {item.image && (
                  <img 
                    src={typeof item.image === 'string' ? item.image : item.image.url} 
                    className="w-full h-full object-cover" 
                    alt={item.name}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm truncate pr-2">{item.name}</h4>
                  <p className="font-bold text-sm whitespace-nowrap">
                    ${item.total.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {item.sku} | ${item.price.toLocaleString()} c/u
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-md hover:bg-background"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-md hover:bg-background"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Totals Section */}
      <div className="border-t bg-gradient-to-b from-background to-muted/20 p-6 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium">${getCartSubtotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Impuestos (ITBIS)</span>
            <span className="font-medium">${getCartTax().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Descuento</span>
            <span className="font-medium text-green-600">- $0.00</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-end">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-3xl text-primary">
            ${getCartTotal().toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-2">
          <Button 
            variant="outline" 
            className="col-span-1 border-dashed border-2 text-muted-foreground hover:bg-destructive/10 hover:border-destructive hover:text-destructive" 
            onClick={clearCart}
            size="icon"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            className="col-span-4 text-lg font-bold h-12 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setIsPaymentOpen(true)}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Cobrar
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentTerminal 
        open={isPaymentOpen} 
        onOpenChange={setIsPaymentOpen} 
        total={getCartTotal()}
      />
    </div>
  )
}
