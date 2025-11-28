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
import { RefreshCw, Search, Truck, Package, CheckCircle2 } from 'lucide-react'
import { ShipmentsTable } from './components/shipments-table'
import { orderService } from '@/services/orderService'
import { useStoreStore } from '@/stores/store-store'
import type { Order } from '@/types/orders'
import { toast } from 'sonner'

export function ShippingTracking() {
  const { store: currentStore } = useStoreStore()
  const [shipments, setShipments] = useState<Order[]>([])
  const [filteredShipments, setFilteredShipments] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (currentStore?.id) {
      loadShipments()
    }
  }, [currentStore?.id])

  useEffect(() => {
    filterShipments()
  }, [shipments, searchQuery, statusFilter])

  const loadShipments = async () => {
    if (!currentStore?.id) return

    try {
      setIsLoading(true)
      // Obtener órdenes con fulfillmentStatus shipped o delivered
      const orders = await orderService.getOrdersByStore(currentStore.id)
      
      const shippedOrders = orders.filter(
        (order) => order.fulfillmentStatus === 'shipped' || order.fulfillmentStatus === 'delivered'
      )

      // Ordenar por fecha más reciente
      shippedOrders.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      
      setShipments(shippedOrders)
    } catch (error) {
      console.error('Error loading shipments:', error)
      toast.error('Error al cargar los envíos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterShipments = () => {
    let filtered = [...shipments]

    // Filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.trackingNumbers.some((t) =>
            t.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.fulfillmentStatus === statusFilter)
    }

    setFilteredShipments(filtered)
  }

  const handleViewDetails = (order: Order) => {
    toast.info('Funcionalidad de detalles en desarrollo')
    console.log('View order details:', order)
  }

  const handleMarkAsDelivered = async (order: Order) => {
    try {
      await orderService.updateFulfillmentStatus(
        order.id,
        'delivered',
        'Marcado como entregado por el administrador'
      )
      toast.success('Orden marcada como entregada')
      loadShipments()
    } catch (error) {
      console.error('Error marking as delivered:', error)
      toast.error('Error al marcar como entregado')
    }
  }

  // Calcular estadísticas
  const totalShipments = shipments.length
  const inTransit = shipments.filter((s) => s.fulfillmentStatus === 'shipped').length
  const delivered = shipments.filter((s) => s.fulfillmentStatus === 'delivered').length

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Envíos</h2>
            <p className="text-muted-foreground">
              Monitorea el estado de todos los envíos
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadShipments}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              <p className="text-xs">Total de Envíos</p>
            </div>
            <div className="text-2xl font-bold">{totalShipments}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Truck className="h-4 w-4" />
              <p className="text-xs">En Tránsito</p>
            </div>
            <div className="text-2xl font-bold">{inTransit}</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-xs">Entregados</p>
            </div>
            <div className="text-2xl font-bold">{delivered}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por orden, cliente o tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="shipped">En Tránsito</SelectItem>
              <SelectItem value="delivered">Entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <ShipmentsTable
          shipments={filteredShipments}
          onViewDetails={handleViewDetails}
          onMarkAsDelivered={handleMarkAsDelivered}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}



