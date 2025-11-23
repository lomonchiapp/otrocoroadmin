import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { type InventoryFilters, type InventoryStatus, type LocationType } from '@/types'

interface InventoryFiltersProps {
  filters: InventoryFilters
  onFiltersChange: (filters: InventoryFilters) => void
  locations: Array<{ id: string; name: string; type: LocationType }>
}

const statusOptions: { value: InventoryStatus; label: string }[] = [
  { value: 'in_stock', label: 'En Stock' },
  { value: 'low_stock', label: 'Stock Bajo' },
  { value: 'out_of_stock', label: 'Sin Stock' },
  { value: 'discontinued', label: 'Descontinuado' },
]

const locationTypeOptions: { value: LocationType; label: string }[] = [
  { value: 'warehouse', label: 'Almacén' },
  { value: 'store', label: 'Tienda' },
  { value: 'display', label: 'Exhibición' },
  { value: 'return', label: 'Devolución' },
  { value: 'damaged', label: 'Dañado' },
]

export function InventoryFiltersComponent({
  filters,
  onFiltersChange,
  locations,
}: InventoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<InventoryFilters>(filters)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters: InventoryFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setIsOpen(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.locationIds?.length) count++
    if (filters.status?.length) count++
    if (filters.lowStock) count++
    if (filters.dateRange) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="flex items-center space-x-2">
      {/* Búsqueda rápida */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          className="pl-9"
          value={filters.query || ''}
          onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
        />
      </div>

      {/* Filtros avanzados */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Filtros de Inventario</SheetTitle>
            <SheetDescription>
              Aplica filtros para encontrar productos específicos en tu inventario.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-4">
            {/* Ubicaciones */}
            <div className="space-y-3">
              <Label>Ubicaciones</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location.id}`}
                      checked={localFilters.locationIds?.includes(location.id) || false}
                      onCheckedChange={(checked) => {
                        const currentIds = localFilters.locationIds || []
                        const newIds = checked
                          ? [...currentIds, location.id]
                          : currentIds.filter(id => id !== location.id)
                        setLocalFilters({
                          ...localFilters,
                          locationIds: newIds.length > 0 ? newIds : undefined
                        })
                      }}
                    />
                    <Label
                      htmlFor={`location-${location.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {location.name} ({location.type})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Estados */}
            <div className="space-y-3">
              <Label>Estados</Label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={localFilters.status?.includes(status.value) || false}
                      onCheckedChange={(checked) => {
                        const currentStatuses = localFilters.status || []
                        const newStatuses = checked
                          ? [...currentStatuses, status.value]
                          : currentStatuses.filter(s => s !== status.value)
                        setLocalFilters({
                          ...localFilters,
                          status: newStatuses.length > 0 ? newStatuses : undefined
                        })
                      }}
                    />
                    <Label
                      htmlFor={`status-${status.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtros especiales */}
            <div className="space-y-3">
              <Label>Filtros Especiales</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="low-stock"
                    checked={localFilters.lowStock || false}
                    onCheckedChange={(checked) => {
                      setLocalFilters({
                        ...localFilters,
                        lowStock: checked || undefined
                      })
                    }}
                  />
                  <Label
                    htmlFor="low-stock"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Solo productos con bajo stock (≤5 unidades)
                  </Label>
                </div>
              </div>
            </div>

            {/* Rango de fechas */}
            <div className="space-y-3">
              <Label>Rango de Fechas</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                    Desde
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={localFilters.dateRange?.start ? localFilters.dateRange.start.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const startDate = e.target.value ? new Date(e.target.value) : undefined
                      setLocalFilters({
                        ...localFilters,
                        dateRange: startDate ? {
                          start: startDate,
                          end: localFilters.dateRange?.end || new Date()
                        } : undefined
                      })
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                    Hasta
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={localFilters.dateRange?.end ? localFilters.dateRange.end.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const endDate = e.target.value ? new Date(e.target.value) : undefined
                      setLocalFilters({
                        ...localFilters,
                        dateRange: endDate ? {
                          start: localFilters.dateRange?.start || new Date(),
                          end: endDate
                        } : undefined
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
