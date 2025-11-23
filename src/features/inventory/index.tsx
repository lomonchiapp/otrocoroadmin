import { useState, useEffect } from 'react'
import { Plus, Package, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InventoryTable } from './components/inventory-table'
import { StockAdjustmentDialog } from './components/stock-adjustment-dialog'
import { InventoryFiltersComponent } from './components/inventory-filters'
import { inventoryService } from '@/services/inventoryService'
import { type StockItem, type InventoryFilters, type InventoryLocation } from '@/types'

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [locations, setLocations] = useState<InventoryLocation[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar ubicaciones
      const locationsData = await inventoryService.getLocationsByStore('fashion-store')
      setLocations(locationsData)
      
      // Cargar stock
      const stockData = await inventoryService.searchStock({
        filters: { storeId: 'fashion-store' },
        limit: 100
      })
      setStockItems(stockData.data)
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = async (newFilters: InventoryFilters) => {
    setFilters(newFilters)
    try {
      const stockData = await inventoryService.searchStock({
        filters: { ...newFilters, storeId: 'fashion-store' },
        limit: 100
      })
      setStockItems(stockData.data)
    } catch (error) {
      console.error('Error filtering inventory:', error)
    }
  }

  const handleAdjustStock = async (data: any) => {
    try {
      // Calcular nueva cantidad basada en el tipo de ajuste
      let newQuantity = selectedItem?.quantity || 0
      
      switch (data.adjustmentType) {
        case 'add':
          newQuantity += data.quantity
          break
        case 'subtract':
          newQuantity = Math.max(0, newQuantity - data.quantity)
          break
        case 'set':
          newQuantity = data.quantity
          break
      }

      // Actualizar stock
      await inventoryService.updateStockQuantity(
        data.stockItemId,
        newQuantity,
        data.reason,
        'admin-user',
        'Admin User'
      )

      // Recargar datos
      await loadData()
    } catch (error) {
      console.error('Error adjusting stock:', error)
    }
  }

  // Calcular estadísticas
  const stats = {
    totalItems: stockItems.length,
    totalValue: stockItems.reduce((sum, item) => sum + (item.sellingPrice || 0) * item.quantity, 0),
    lowStockItems: stockItems.filter(item => item.availableQuantity <= 5).length,
    outOfStockItems: stockItems.filter(item => item.availableQuantity === 0).length,
    totalQuantity: stockItems.reduce((sum, item) => sum + item.quantity, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando inventario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona el stock y las ubicaciones de tus productos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Stock
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalQuantity} unidades totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              ≤5 unidades disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Sin unidades disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Encuentra productos específicos en tu inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            locations={locations.map(loc => ({
              id: loc.id,
              name: loc.name,
              type: loc.type
            }))}
          />
        </CardContent>
      </Card>

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Actual</CardTitle>
              <CardDescription>
                {stockItems.length} productos en inventario
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {stats.lowStockItems > 0 && (
                <Badge variant="destructive">
                  {stats.lowStockItems} con bajo stock
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryTable
            data={stockItems}
            onEdit={(item) => {
              setSelectedItem(item)
              // Implementar edición
            }}
            onAdjust={(item) => {
              setSelectedItem(item)
              setShowAdjustmentDialog(true)
            }}
            onTransfer={(item) => {
              setSelectedItem(item)
              // Implementar transferencia
            }}
            onViewHistory={(item) => {
              setSelectedItem(item)
              // Implementar historial
            }}
          />
        </CardContent>
      </Card>

      {/* Diálogo de ajuste de stock */}
      <StockAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        stockItem={selectedItem}
        onAdjust={handleAdjustStock}
      />
    </div>
  )
}

