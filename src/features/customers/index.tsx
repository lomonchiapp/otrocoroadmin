import { useState, useEffect, useMemo } from 'react'
import { Users as UsersIcon, Plus, Download, Upload, Filter, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {Sheet, SheetContent,SheetHeader,SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ConfigDrawer } from '@/components/config-drawer'
import { useCurrentStore } from '@/stores/store-store'
import { useCustomers } from '@/hooks'
import { CustomersTable } from './components/customers-table'
import { CustomersStatsCards } from './components/customers-stats-cards'
import { CustomerFormSheet } from './components/customer-form-sheet'
import type { Customer, CustomerStatus, CustomerSegment } from '@/types/customers'

export function Customers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'wholesale' | 'retail' | CustomerStatus | CustomerSegment>('all')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { store: currentStore } = useCurrentStore()
  const { customers, isLoading } = useCustomers()

  // Filtrar usuarios según el tab activo y búsqueda
  const filteredCustomers = useMemo(() => {
    let result = customers

    // Filtrar por tab
    if (activeTab === 'active') {
      result = result.filter((c) => c.status === 'active')
    } else if (activeTab === 'wholesale') {
      result = result.filter((c) => c.userType === 'wholesale')
    } else if (activeTab === 'retail') {
      result = result.filter((c) => c.userType === 'retail')
    } else if (activeTab === 'vip') {
      result = result.filter((c) => c.segment === 'vip')
    } else if (activeTab === 'new') {
      result = result.filter((c) => c.segment === 'new')
    } else if (activeTab === 'inactive') {
      result = result.filter((c) => c.status === 'inactive')
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.email.toLowerCase().includes(query) ||
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.businessName?.toLowerCase().includes(query) // Buscar también por razón social
      )
    }

    return result
  }, [customers, activeTab, searchQuery])

  const handleNewCustomer = () => {
    setEditingCustomer(null)
    setShowCustomerForm(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowCustomerForm(true)
  }

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
                Para gestionar usuarios, primero debes seleccionar una tienda en el encabezado.
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
          <NotificationBell />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Header de la página */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <UsersIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Usuarios
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 text-xs"
                  >
                    {currentStore.name}
                  </Badge>
                </div>
              </div>
              <p className="text-slate-600 text-sm md:text-base md:ml-13 hidden md:block">
                Gestiona los usuarios registrados en tu ecommerce
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
              {/* Import/Export - Oculto en mobile */}
              <div className="hidden md:flex items-center gap-1">
                <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>

                <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Separador visual - Oculto en mobile */}
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>

              {/* Crear usuario */}
              <Button
                size="sm"
                onClick={handleNewCustomer}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Nuevo Usuario</span>
              </Button>
            </div>
          </div>

          {/* Cards de estadísticas */}
          <CustomersStatsCards />
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-4 md:mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 md:gap-4">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  placeholder="Buscar usuarios por nombre, email o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 h-10 md:h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 touch-manipulation text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
              <Button variant="outline" size="sm" className="flex-1 lg:flex-none touch-manipulation">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-6">
            <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
              <TabsList className="inline-flex lg:grid w-auto lg:w-full lg:grid-cols-6 h-auto bg-slate-100 p-1 min-w-max">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="wholesale" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">
                  Mayoristas
                </TabsTrigger>
                <TabsTrigger value="retail" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">
                  Clientes Finales
                </TabsTrigger>
                <TabsTrigger value="vip" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">
                  VIP
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">
                  Nuevos
                </TabsTrigger>
                <TabsTrigger value="inactive" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">
                  Inactivos
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-6">
            <CustomersTable
              customers={filteredCustomers}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onEditCustomer={handleEditCustomer}
            />
          </TabsContent>
        </Tabs>

        {/* Sheet para crear/editar cliente */}
        <CustomerFormSheet
          open={showCustomerForm}
          onOpenChange={setShowCustomerForm}
          customer={editingCustomer}
        />
      </Main>
    </>
  )
}
