import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, FileDown, Plus } from 'lucide-react'
import { useOrders } from '@/hooks/use-orders'
import { useStoreStore } from '@/stores/store-store'
import { OrdersTable } from './components/orders-table'
import { OrderStatsCards } from './components/order-stats-cards'
import { OrderFiltersSheet } from './components/order-filters-sheet'
import { toast } from 'sonner'

export function Orders() {
  const { store: currentStore } = useStoreStore()
  const {
    orders,
    isLoading,
    pagination,
    aggregations,
    updateOrderStatus,
    updatePaymentStatus,
    updateFulfillmentStatus,
    setFilters,
    refetch,
  } = useOrders(currentStore?.id)

  const handleUpdateStatus = (orderId: string, status: any) => {
    updateOrderStatus({ orderId, status })
  }

  const handleUpdatePaymentStatus = (orderId: string, status: any) => {
    updatePaymentStatus({ orderId, status })
  }

  const handleUpdateFulfillmentStatus = (orderId: string, status: any) => {
    updateFulfillmentStatus({ orderId, status })
  }

  const handleGenerateInvoice = (orderId: string) => {
    toast.info('Funcionalidad de facturas en desarrollo')
    console.log('Generate invoice for order:', orderId)
  }

  const handleExport = () => {
    toast.info('Exportando órdenes...')
    // TODO: Implementar exportación a CSV/Excel
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Órdenes</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona todas las órdenes de {currentStore?.name || 'tu tienda'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Stats Cards */}
        <OrderStatsCards aggregations={aggregations} />

        {/* Filters and Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OrderFiltersSheet onApplyFilters={setFilters} />
            </div>
            <div className="text-sm text-muted-foreground">
              {pagination.total} órdenes encontradas
            </div>
          </div>

          <OrdersTable
            orders={orders}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onUpdateFulfillmentStatus={handleUpdateFulfillmentStatus}
            onGenerateInvoice={handleGenerateInvoice}
          />
        </div>
      </div>
    </div>
  )
}

export default Orders
















