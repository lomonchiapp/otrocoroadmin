import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useCurrentStore } from '@/stores/store-store'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { TopProducts } from './components/top-products'
import { LowStockAlerts } from './components/low-stock-alerts'
import { ProductsAnalytics } from './components/products-analytics'
import { CategoriesWidget } from './components/categories-widget'
import { InventoryWidget } from './components/inventory-widget'
import { QuickActions } from './components/quick-actions'
import { 
  TrendingUp, 
  Package, 
  FolderTree, 
  AlertTriangle,
  ShoppingCart,
  Users,
  DollarSign,
  Activity
} from 'lucide-react'

export function Dashboard() {
  const { store: currentStore, type: storeType } = useCurrentStore()
  const { products, isLoading: loadingProducts, productStats } = useProducts(currentStore?.id)
  const { categories, isLoading: loadingCategories } = useCategories(currentStore?.id)

  // Mostrar mensaje si no hay tienda seleccionada
  if (!currentStore) {
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold">
                Bienvenido al Panel de Otrocoro
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Selecciona una tienda en el encabezado para ver su dashboard específico y comenzar a gestionar tu ecommerce.
              </p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  // Calcular métricas
  const totalProducts = products.length
  const publishedProducts = products.filter(p => p.status === 'published').length
  const lowStockProducts = products.filter(p => p.totalInventory > 0 && p.totalInventory <= 5)
  const outOfStockProducts = products.filter(p => p.totalInventory === 0)
  const totalInventory = products.reduce((sum, p) => sum + p.totalInventory, 0)
  const totalValue = products.reduce((sum, p) => sum + (p.basePrice || 0) * p.totalInventory, 0)
  const activeCategories = categories.filter(c => c.isActive).length
  const categoriesWithProducts = categories.filter(c => c.productCount > 0).length

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)

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
        {/* Header del Dashboard */}
        <div className='mb-6'>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
                    <Badge 
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
                    >
                      {currentStore.name}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Panel de control • {storeType === 'fashion' ? 'Moda' : 'Joyería'}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Exportar Reporte
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Activity className="w-4 h-4 mr-2" />
                Ver Análisis Completo
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList className="bg-muted/50">
              <TabsTrigger value='overview'>
                <Activity className="w-4 h-4 mr-2" />
                Resumen General
              </TabsTrigger>
              <TabsTrigger value='products'>
                <Package className="w-4 h-4 mr-2" />
                Productos
              </TabsTrigger>
              <TabsTrigger value='inventory'>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Inventario
              </TabsTrigger>
              <TabsTrigger value='categories'>
                <FolderTree className="w-4 h-4 mr-2" />
                Categorías
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Resumen General */}
          <TabsContent value='overview' className='space-y-6'>
            {/* Estadísticas principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Productos */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Productos
                  </CardTitle>
                  <Package className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalProducts}</div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {publishedProducts} publicados
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {totalProducts > 0 ? Math.round((publishedProducts / totalProducts) * 100) : 0}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Valor del Inventario */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Inventario
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {totalInventory} unidades totales
                  </p>
                </CardContent>
              </Card>

              {/* Alertas de Stock */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Alertas de Stock
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{lowStockProducts.length}</div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {outOfStockProducts.length} agotados
                    </p>
                    <Badge variant="destructive">
                      Bajo stock
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Categorías */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Categorías
                  </CardTitle>
                  <FolderTree className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{categories.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {categoriesWithProducts} con productos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <QuickActions storeId={currentStore.id} storeType={storeType} />

            {/* Gráficos y tablas */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Resumen de Actividad</CardTitle>
                  <CardDescription>
                    Vista general del rendimiento de tu tienda
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Productos Destacados</CardTitle>
                  <CardDescription>
                    Los productos mejor configurados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products
                      .filter(p => p.isFeatured && p.status === 'published')
                      .slice(0, 5)
                      .map(product => {
                        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
                        return (
                          <div key={product.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {primaryImage ? (
                                <img 
                                  src={primaryImage.url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                  Destacado
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {product.totalInventory} disponibles
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatCurrency(product.basePrice || 0)}</p>
                            </div>
                          </div>
                        )
                      })}
                    {products.filter(p => p.isFeatured).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay productos destacados</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas de Stock e Inventario */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <LowStockAlerts products={lowStockProducts} />
              <CategoriesWidget categories={categories} />
            </div>
          </TabsContent>

          {/* Tab: Productos */}
          <TabsContent value='products' className='space-y-6'>
            <ProductsAnalytics 
              products={products} 
              stats={productStats}
              isLoading={loadingProducts}
            />
          </TabsContent>

          {/* Tab: Inventario */}
          <TabsContent value='inventory' className='space-y-6'>
            <InventoryWidget 
              products={products}
              isLoading={loadingProducts}
            />
          </TabsContent>

          {/* Tab: Categorías */}
          <TabsContent value='categories' className='space-y-6'>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Categorías</CardTitle>
                  <CardDescription>
                    Cómo están organizados tus productos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories
                      .filter(c => c.isActive && !c.parentId)
                      .map(category => {
                        const subcategories = categories.filter(c => c.parentId === category.id)
                        const totalProducts = category.productCount + 
                          subcategories.reduce((sum, sub) => sum + sub.productCount, 0)
                        
                        return (
                          <div key={category.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                  <FolderTree className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{category.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {subcategories.length} subcategorías
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">{totalProducts}</p>
                                <p className="text-xs text-muted-foreground">productos</p>
                              </div>
                            </div>
                            
                            {subcategories.length > 0 && (
                              <div className="ml-14 space-y-2 pl-4 border-l-2 border-muted">
                                {subcategories.map(sub => (
                                  <div key={sub.id} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{sub.name}</span>
                                    <Badge variant="outline">{sub.productCount}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    
                    {categories.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <FolderTree className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No hay categorías creadas</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
