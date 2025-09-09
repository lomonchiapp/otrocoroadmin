import { useState } from 'react'
import { Plus, Filter, Download, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCurrentStore } from '@/stores/store-store'
import { ProductsTable } from './components/products-table'
import { ProductFiltersSheet } from './components/product-filters-sheet'
import { BulkActionsDropdown } from './components/bulk-actions-dropdown'
import { ProductStatsCards } from './components/product-stats-cards'

export function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const { store: currentStore, type: storeType } = useCurrentStore()

  // Mostrar mensaje si no hay tienda seleccionada
  if (!currentStore) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-muted-foreground">
                Selecciona una tienda
              </h2>
              <p className="text-muted-foreground">
                Para gestionar productos, primero debes seleccionar una tienda en el encabezado.
              </p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Header de la página */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Productos</h1>
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: `${currentStore.primaryColor}20`, color: currentStore.primaryColor }}
                >
                  {currentStore.name}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Gestiona el catálogo de productos de {currentStore.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Acciones bulk si hay productos seleccionados */}
              {selectedProducts.length > 0 && (
                <BulkActionsDropdown
                  selectedProducts={selectedProducts}
                  onSelectionChange={setSelectedProducts}
                />
              )}

              {/* Botones de acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Importar Productos</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Desde CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Desde Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Plantilla CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>

              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>

          {/* Cards de estadísticas */}
          <ProductStatsCards storeId={currentStore.id} />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar productos por nombre, SKU o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <ProductFiltersSheet storeType={storeType} />
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="draft">Borradores</TabsTrigger>
            <TabsTrigger value="out-of-stock">Sin Stock</TabsTrigger>
            {storeType === 'fashion' && (
              <TabsTrigger value="clothing">Ropa</TabsTrigger>
            )}
            {storeType === 'jewelry' && (
              <TabsTrigger value="jewelry">Joyería</TabsTrigger>
            )}
            <TabsTrigger value="featured">Destacados</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <ProductsTable
              storeId={currentStore.id}
              storeType={storeType}
              searchQuery={searchQuery}
              activeTab={activeTab}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
