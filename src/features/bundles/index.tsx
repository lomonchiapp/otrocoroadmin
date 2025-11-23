/**
 * Página de gestión de Combos/Bundles
 */

import { useState } from 'react'
import { Plus, PackageOpen, Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useBundles } from '@/hooks'
import type { Bundle, BundleStatus } from '@/types/bundle'
import { StatusBadge, statusToVariant, EmptyState } from '@/components/atoms'
import { BundleFormSheet } from './components/BundleFormSheet'
import { useCurrentStore } from '@/stores/store-store'

export default function BundlesPage() {
  const { store: currentStore } = useCurrentStore()
  const { bundles, isLoading, deleteBundle, duplicateBundle } = useBundles(currentStore?.id)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BundleStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)

  // Filtrar bundles
  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch = 
      bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || bundle.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = (bundleId: string) => {
    if (confirm('¿Estás seguro de eliminar este combo?')) {
      deleteBundle(bundleId)
    }
  }

  const handleDuplicate = (bundleId: string) => {
    duplicateBundle(bundleId)
  }

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingBundle(null)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PackageOpen className="w-8 h-8" />
            Combos
          </h1>
          <p className="text-muted-foreground mt-1">
            Crea y gestiona combos de productos con descuentos especiales
          </p>
        </div>
        <Button size="lg" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Combo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Combos</CardDescription>
            <CardTitle className="text-3xl">{bundles.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Activos</CardDescription>
            <CardTitle className="text-3xl">
              {bundles.filter(b => b.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Borradores</CardDescription>
            <CardTitle className="text-3xl">
              {bundles.filter(b => b.status === 'draft').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue Total</CardDescription>
            <CardTitle className="text-3xl">
              ${bundles.reduce((sum, b) => sum + b.revenue, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar combos..."
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="scheduled">Programados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
                <SelectItem value="archived">Archivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bundles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredBundles.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={searchQuery ? 'No se encontraron combos' : 'No hay combos creados'}
          description={
            searchQuery
              ? 'Intenta con otra búsqueda'
              : 'Crea tu primer combo para ofrecer descuentos en packs de productos'
          }
          action={
            searchQuery
              ? undefined
              : {
                  label: 'Crear Combo',
                  onClick: handleCreate,
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Formulario de creación/edición */}
      <BundleFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        bundle={editingBundle}
      />
    </div>
  )
}

/**
 * Card individual de Bundle
 */
interface BundleCardProps {
  bundle: Bundle
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onEdit: (bundle: Bundle) => void
}

function BundleCard({ bundle, onDelete, onDuplicate, onEdit }: BundleCardProps) {
  const statusLabels: Record<BundleStatus, string> = {
    draft: 'Borrador',
    active: 'Activo',
    scheduled: 'Programado',
    expired: 'Expirado',
    archived: 'Archivado',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {bundle.primaryImage ? (
          <img
            src={bundle.primaryImage}
            alt={bundle.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageOpen className="w-16 h-16 text-purple-300" />
          </div>
        )}
        
        {/* Featured Badge */}
        {bundle.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            ⭐ Destacado
          </Badge>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge
            status={statusLabels[bundle.status]}
            variant={statusToVariant(bundle.status)}
          />
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{bundle.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {bundle.description}
            </CardDescription>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(bundle)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(bundle.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(bundle.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Items Count */}
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <PackageOpen className="w-4 h-4" />
          <span>{bundle.items.length} productos</span>
        </div>

        {/* Pricing */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Precio Original:</span>
            <span className="line-through">${bundle.totalOriginalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Precio Combo:</span>
            <span className="text-2xl font-bold text-primary">
              ${bundle.bundlePrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Ahorro:</span>
            <span className="text-green-600 font-semibold">
              ${bundle.savings.toFixed(2)} ({bundle.savingsPercentage.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Vistas</p>
            <p className="text-lg font-semibold">{bundle.viewCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ventas</p>
            <p className="text-lg font-semibold">{bundle.purchaseCount}</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
