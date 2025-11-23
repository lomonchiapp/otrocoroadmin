import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useCurrentStore } from '@/stores/store-store'
import { attributeService } from '@/services/attributeService'
import { productService } from '@/services/productService'
import type { ProductFilters, StoreType, Attribute, AttributeFilter, Category, Brand } from '@/types'

interface ProductFiltersSheetProps {
  storeType?: StoreType
  filters?: ProductFilters
  onFiltersChange?: (filters: ProductFilters) => void
}

export function ProductFiltersSheet({ 
  storeType, 
  filters = {},
  onFiltersChange 
}: ProductFiltersSheetProps) {
  const { store: currentStore } = useCurrentStore()
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)
  const [isOpen, setIsOpen] = useState(false)
  const [filterableAttributes, setFilterableAttributes] = useState<Attribute[]>([])
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    if (currentStore && isOpen) {
      loadFilterableAttributes()
      loadLookupData()
    }
  }, [currentStore, isOpen])

  const loadFilterableAttributes = async () => {
    if (!currentStore) return
    
    try {
      const attributes = await attributeService.getAttributesByStore(currentStore.id)
      const filterable = attributes.filter(attr => attr.isFilterable && attr.isActive)
      setFilterableAttributes(filterable)
    } catch (error) {
      console.error('Error loading filterable attributes:', error)
    }
  }

  const loadLookupData = async () => {
    if (!currentStore) return

    try {
      const [categoriesData, brandsData] = await Promise.all([
        productService.getCategoriesByStore(currentStore.id),
        productService.getBrands(currentStore.id),
      ])
      setCategories(categoriesData)
      setBrands(brandsData)
    } catch (error) {
      console.error('Error loading filter lookups:', error)
    }
  }

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateClothingFilters = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      clothingFilters: {
        ...prev.clothingFilters,
        [key]: value
      }
    }))
  }

  const updateJewelryFilters = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      jewelryFilters: {
        ...prev.jewelryFilters,
        [key]: value
      }
    }))
  }

  const applyFilters = () => {
    onFiltersChange?.(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.keys(localFilters).length > 0

  const colors = filterableAttributes
    .find((attribute) => attribute.slug === 'color')
    ?.values?.map((value) => ({ id: value.id, name: value.displayValue, hex: value.hexCode })) ?? []

  const sizes = filterableAttributes
    .find((attribute) => attribute.slug === 'size')
    ?.values?.map((value) => ({ id: value.id, name: value.displayValue })) ?? []

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {Object.keys(localFilters).length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros de Productos</SheetTitle>
          <SheetDescription>
            Filtra productos por diferentes criterios para encontrar exactamente lo que buscas.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Filtros generales */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado del Producto</Label>
              <Select
                value={localFilters.status?.[0] || ''}
                onValueChange={(value) => updateFilter('status', value ? [value] : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                  <SelectItem value="out_of_stock">Sin Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rango de Precio (COP)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Mínimo"
                  type="number"
                  value={localFilters.priceRange?.min || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...localFilters.priceRange,
                    min: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
                <Input
                  placeholder="Máximo"
                  type="number"
                  value={localFilters.priceRange?.max || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...localFilters.priceRange,
                    max: e.target.value ? Number(e.target.value) : undefined
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categorías</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={localFilters.categoryIds?.includes(category.id) || false}
                      onCheckedChange={(checked) => {
                        const currentIds = localFilters.categoryIds || []
                        if (checked) {
                          updateFilter('categoryIds', [...currentIds, category.id])
                        } else {
                          updateFilter('categoryIds', currentIds.filter(id => id !== category.id))
                        }
                      }}
                    />
                    <Label htmlFor={category.id} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Marcas</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand.id}
                      checked={localFilters.brandIds?.includes(brand.id) || false}
                      onCheckedChange={(checked) => {
                        const currentIds = localFilters.brandIds || []
                        if (checked) {
                          updateFilter('brandIds', [...currentIds, brand.id])
                        } else {
                          updateFilter('brandIds', currentIds.filter(id => id !== brand.id))
                        }
                      }}
                    />
                    <Label htmlFor={brand.id} className="text-sm">
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Solo productos destacados</Label>
              <Switch
                id="featured"
                checked={localFilters.isFeatured || false}
                onCheckedChange={(checked) => updateFilter('isFeatured', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="stock">Solo con stock disponible</Label>
              <Switch
                id="stock"
                checked={localFilters.hasStock || false}
                onCheckedChange={(checked) => updateFilter('hasStock', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Filtros específicos por tipo de tienda */}
          {storeType === 'fashion' && (
            <div className="space-y-4">
              <h4 className="font-medium">Filtros de Ropa</h4>
              
              <div className="space-y-2">
                <Label>Colores</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <Button
                      key={color.id}
                      variant="outline"
                      size="sm"
                      className={`h-8 ${
                        localFilters.clothingFilters?.colors?.includes(color.id) 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                      onClick={() => {
                        const currentColors = localFilters.clothingFilters?.colors || []
                        if (currentColors.includes(color.id)) {
                          updateClothingFilters('colors', currentColors.filter(id => id !== color.id))
                        } else {
                          updateClothingFilters('colors', [...currentColors, color.id])
                        }
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2 border"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tallas</Label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size.id}
                      variant="outline"
                      size="sm"
                      className={`h-8 ${
                        localFilters.clothingFilters?.sizes?.includes(size.id) 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                      onClick={() => {
                        const currentSizes = localFilters.clothingFilters?.sizes || []
                        if (currentSizes.includes(size.id)) {
                          updateClothingFilters('sizes', currentSizes.filter(id => id !== size.id))
                        } else {
                          updateClothingFilters('sizes', [...currentSizes, size.id])
                        }
                      }}
                    >
                      {size.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {storeType === 'jewelry' && (
            <div className="space-y-4">
              <h4 className="font-medium">Filtros de Joyería</h4>
              
              <div className="space-y-2">
                <Label>Tipo de Metal</Label>
                <Select
                  value={localFilters.jewelryFilters?.metalTypes?.[0] || ''}
                  onValueChange={(value) => updateJewelryFilters('metalTypes', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar metal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Oro</SelectItem>
                    <SelectItem value="silver">Plata</SelectItem>
                    <SelectItem value="platinum">Platino</SelectItem>
                    <SelectItem value="stainless_steel">Acero Inoxidable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rango de Peso (gramos)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Mínimo"
                    type="number"
                    value={localFilters.jewelryFilters?.weightRange?.min || ''}
                    onChange={(e) => updateJewelryFilters('weightRange', {
                      ...localFilters.jewelryFilters?.weightRange,
                      min: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                  <Input
                    placeholder="Máximo"
                    type="number"
                    value={localFilters.jewelryFilters?.weightRange?.max || ''}
                    onChange={(e) => updateJewelryFilters('weightRange', {
                      ...localFilters.jewelryFilters?.weightRange,
                      max: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
          <Button onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
