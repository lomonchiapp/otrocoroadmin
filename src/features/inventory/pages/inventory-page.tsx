import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Upload, Package, AlertTriangle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/data-table'
import { inventoryService } from '@/services/inventoryService'
import type { StockItem, InventoryFilters, InventoryLocation } from '@/types'

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [locations, setLocations] = useState<InventoryLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const storeId = 'fashion-store' // TODO: Obtener del contexto de la tienda
      
      const [stockData, locationsData, summaryData] = await Promise.all([
        inventoryService.getStockItems(storeId, filters),
        inventoryService.getLocationsByStore(storeId),
        inventoryService.getInventorySummary(storeId)
      ])
      
      setStockItems(stockData)
      setLocations(locationsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: Implementar búsqueda en tiempo real
  }

  const handleFiltersChange = (newFilters: InventoryFilters) => {
    setFilters(newFilters)
  }

  const columns = [
    {
      accessorKey: 'productName',
      header: 'Producto',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <div className="font-medium">{row.original.productName || 'Producto'}</div>
            <div className="text-sm text-gray-500">
              {row.original.variationAttributes && Object.keys(row.original.variationAttributes).length > 0
                ? Object.entries(row.original.variationAttributes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')
                : 'Sin variaciones'
              }
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'locationName',
      header: 'Ubicación',
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline">
          {row.original.locationName}
        </Badge>
      )
    },
    {
      accessorKey: 'quantity',
      header: 'Cantidad Total',
      cell: ({ row }: { row: any }) => (
        <div className="text-center">
          <div className="font-medium">{row.original.quantity}</div>
        </div>
      )
    },
    {
      accessorKey: 'reservedQuantity',
      header: 'Reservado',
      cell: ({ row }: { row: any }) => (
        <div className="text-center">
          <div className="text-orange-600">{row.original.reservedQuantity}</div>
        </div>
      )
    },
    {
      accessorKey: 'availableQuantity',
      header: 'Disponible',
      cell: ({ row }: { row: any }) => {
        const quantity = row.original.availableQuantity
        return (
          <div className="text-center">
            <div className={`font-medium ${quantity === 0 ? 'text-red-600' : quantity <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
              {quantity}
            </div>
            {quantity <= 5 && quantity > 0 && (
              <div className="text-xs text-yellow-600">Bajo stock</div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }: { row: any }) => {
        const status = row.original.status
        const statusConfig = {
          available: { label: 'Disponible', variant: 'default' as const },
          reserved: { label: 'Reservado', variant: 'secondary' as const },
          sold: { label: 'Vendido', variant: 'outline' as const },
          damaged: { label: 'Dañado', variant: 'destructive' as const },
          returned: { label: 'Devuelto', variant: 'outline' as const },
          transferred: { label: 'Transferido', variant: 'secondary' as const }
        }
        const config = statusConfig[status] || statusConfig.available
        return <Badge variant={config.variant}>{config.label}</Badge>
      }
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Precio',
      cell: ({ row }: { row: any }) => (
        <div className="text-right">
          <div className="font-medium">
            ${row.original.sellingPrice?.toLocaleString() || '0'}
          </div>
          {row.original.costPrice && (
            <div className="text-sm text-gray-500">
              Costo: ${row.original.costPrice.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'lastMovementAt',
      header: 'Último Movimiento',
      cell: ({ row }: { row: any }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.original.lastMovementAt).toLocaleDateString()}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-600">Gestiona el stock y movimientos de inventario</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajuste de Stock
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos con stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor del inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cantidad Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Unidades en stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Necesitan reabastecimiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
          <CardDescription>
            Encuentra items específicos en el inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en inventario..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todo el Inventario</TabsTrigger>
          <TabsTrigger value="low-stock">Bajo Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Sin Stock</TabsTrigger>
          <TabsTrigger value="transfers">Transferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventario General</CardTitle>
                  <CardDescription>
                    {stockItems.length} items encontrados
                  </CardDescription>
                </div>
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} seleccionados
                    </span>
                    <Button variant="outline" size="sm">
                      Acciones
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={stockItems}
                loading={loading}
                onRowSelectionChange={setSelectedItems}
                searchKey="productName"
                searchValue={searchQuery}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos con Bajo Stock</CardTitle>
              <CardDescription>
                Productos que necesitan reabastecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={stockItems.filter(item => item.availableQuantity <= 5 && item.availableQuantity > 0)}
                loading={loading}
                onRowSelectionChange={setSelectedItems}
                searchKey="productName"
                searchValue={searchQuery}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="out-of-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Sin Stock</CardTitle>
              <CardDescription>
                Productos que están agotados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={stockItems.filter(item => item.availableQuantity === 0)}
                loading={loading}
                onRowSelectionChange={setSelectedItems}
                searchKey="productName"
                searchValue={searchQuery}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transferencias</CardTitle>
              <CardDescription>
                Movimientos de stock entre ubicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Funcionalidad de transferencias en desarrollo
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
