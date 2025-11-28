import { useState, useEffect } from 'react'
import { usePosStore } from '@/stores/pos-store'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ProductBrowser } from './components/product-browser'
import { PosCart } from './components/pos-cart'
import { ShiftManager } from './components/shift-manager'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutGrid, 
  ShoppingCart, 
  Receipt, 
  Monitor,
  LogOut,
  Clock,
  Store
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

export function PosLayout() {
  const { session, setSession } = usePosStore()
  const { store, storeName } = useCurrentStore()
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  // Si no hay sesión abierta, mostrar el gestor de turnos
  if (!session || session.status !== 'open') {
    return <ShiftManager />
  }

  // Si la sesión es de otra tienda diferente a la seleccionada, cerrarla
  useEffect(() => {
    if (session && store && session.storeId !== store.id) {
      setSession(null)
      toast.warning('La tienda ha cambiado. Por favor, abre una nueva caja para la tienda seleccionada.')
    }
  }, [session, store, setSession])

  const handleCloseSession = () => {
    if (confirm('¿Estás seguro de cerrar esta caja?')) {
      setSession(null)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Modern Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Punto de Venta
                <Badge variant="secondary" className="ml-2">
                  <Monitor className="h-3 w-3 mr-1" />
                  {session.registerName || session.registerId}
                </Badge>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  {storeName}
                </p>
                <Separator orientation="vertical" className="h-3" />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Abierta {formatDistanceToNow(session.openedAt, { addSuffix: true, locale: es })}
                </p>
              </div>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-8" />
          
          <div className="flex bg-muted/50 rounded-xl p-1.5">
            <Button 
              variant={activeTab === 'products' ? 'default' : 'ghost'} 
              size="sm"
              className="rounded-lg"
              onClick={() => setActiveTab('products')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Productos
            </Button>
            <Button 
              variant={activeTab === 'orders' ? 'default' : 'ghost'} 
              size="sm"
              className="rounded-lg"
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Órdenes
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCloseSession}
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Caja
          </Button>
        </div>
      </header>

      {/* Main Content - Modern Grid Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-0">
        {/* Left Panel: Product Browser */}
        <div className="col-span-8 border-r bg-gradient-to-b from-muted/30 to-background overflow-y-auto p-6">
          {activeTab === 'products' ? (
            <ProductBrowser />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">Historial de Órdenes</h3>
              <p className="text-sm">Próximamente disponible</p>
            </div>
          )}
        </div>

        {/* Right Panel: Cart & Payment */}
        <div className="col-span-4 bg-card flex flex-col border-l shadow-2xl z-10">
          <PosCart />
        </div>
      </div>
    </div>
  )
}
