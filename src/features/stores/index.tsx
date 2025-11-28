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
import { Plus, Search, RefreshCw } from 'lucide-react'
import { StoresTable } from './components/stores-table'
import { StoreSetupWizard } from './components/store-setup-wizard'
import { storeService } from '@/services/storeService'
import type { Store } from '@/types/stores'
import { toast } from 'sonner'

export function StoresManagement() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadStores()
  }, [])

  useEffect(() => {
    filterStores()
  }, [stores, searchQuery, typeFilter, statusFilter])

  const loadStores = async () => {
    try {
      setIsLoading(true)
      const data = await storeService.getAllStores()
      setStores(data)
    } catch (error) {
      console.error('Error loading stores:', error)
      toast.error('Error al cargar las tiendas')
    } finally {
      setIsLoading(false)
    }
  }

  const filterStores = () => {
    let filtered = [...stores]

    // Filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((store) => store.type === typeFilter)
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter((store) => store.isActive === isActive)
    }

    setFilteredStores(filtered)
  }

  const handleToggleStatus = async (store: Store) => {
    try {
      await storeService.toggleStoreStatus(store.id, !store.isActive)
      toast.success(
        `Tienda ${!store.isActive ? 'activada' : 'desactivada'} exitosamente`
      )
      loadStores()
    } catch (error) {
      console.error('Error toggling store status:', error)
      toast.error('Error al cambiar el estado de la tienda')
    }
  }

  const handleEdit = (store: Store) => {
    toast.info('Funcionalidad de edición en desarrollo')
    console.log('Edit store:', store)
  }

  const handleViewDetails = (store: Store) => {
    toast.info('Funcionalidad de detalles en desarrollo')
    console.log('View details:', store)
  }

  const handleWizardSuccess = () => {
    loadStores()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestionar Tiendas</h2>
            <p className="text-muted-foreground">
              Administra todas tus tiendas desde un solo lugar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadStores}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setIsWizardOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tienda
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">Total de Tiendas</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">
              {stores.filter((s) => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Tiendas Activas</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">
              {stores.filter((s) => s.type === 'fashion').length}
            </div>
            <p className="text-xs text-muted-foreground">Tiendas de Moda</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">
              {stores.filter((s) => s.type === 'jewelry').length}
            </div>
            <p className="text-xs text-muted-foreground">Tiendas de Joyería</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tiendas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="fashion">Moda</SelectItem>
              <SelectItem value="jewelry">Joyería</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <StoresTable
          stores={filteredStores}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />
      </div>

      {/* Wizard */}
      <StoreSetupWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onSuccess={handleWizardSuccess}
      />
    </div>
  )
}



