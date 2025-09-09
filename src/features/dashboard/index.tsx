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
import { useCurrentStore } from '@/stores/store-store'
import { mockDashboardMetrics } from '@/data/mock-stores'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { TopProducts } from './components/top-products'
import { LowStockAlerts } from './components/low-stock-alerts'
import { EcommerceDashboardStats } from './components/ecommerce-dashboard-stats'

export function Dashboard() {
  const { store: currentStore } = useCurrentStore()

  // Mostrar mensaje si no hay tienda seleccionada
  if (!currentStore) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-muted-foreground">
                Bienvenido al Panel de Otrocoro
              </h2>
              <p className="text-muted-foreground">
                Selecciona una tienda en el encabezado para ver su dashboard específico.
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
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
              <Badge 
                variant="secondary"
                style={{ backgroundColor: `${currentStore.primaryColor}20`, color: currentStore.primaryColor }}
              >
                {currentStore.name}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Panel de control para {currentStore.name}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant="outline">Exportar Reporte</Button>
            <Button>Ver Análisis Completo</Button>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Resumen General</TabsTrigger>
              <TabsTrigger value='sales'>Ventas</TabsTrigger>
              <TabsTrigger value='products'>Productos</TabsTrigger>
              <TabsTrigger value='customers'>Clientes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-6'>
            {/* Estadísticas principales */}
            <EcommerceDashboardStats metrics={mockDashboardMetrics} />

            {/* Gráficos y tablas */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Ventas del Mes</CardTitle>
                  <CardDescription>
                    Ingresos diarios en los últimos 30 días
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Órdenes Recientes</CardTitle>
                  <CardDescription>
                    Últimas {mockDashboardMetrics.recentOrders.length} órdenes procesadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales orders={mockDashboardMetrics.recentOrders} />
                </CardContent>
              </Card>
            </div>

            {/* Productos top y alertas de stock */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <TopProducts products={mockDashboardMetrics.topSellingProducts} />
              <LowStockAlerts products={mockDashboardMetrics.lowStockProducts} />
            </div>
          </TabsContent>

          <TabsContent value='sales' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Ventas</CardTitle>
                <CardDescription>
                  Métricas detalladas de ventas y rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Dashboard de ventas en desarrollo...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='products' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Productos</CardTitle>
                <CardDescription>
                  Rendimiento y métricas de productos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Dashboard de productos en desarrollo...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='customers' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Clientes</CardTitle>
                <CardDescription>
                  Métricas y comportamiento de clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Dashboard de clientes en desarrollo...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

