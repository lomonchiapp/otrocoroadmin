import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Check, 
  X, 
  Tag,
  Building2,
  CheckCircle2
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useCurrentStore } from '@/stores/store-store'
import type { Brand } from '@/types'

interface InlineBrandCreatorProps {
  selectedBrandId?: string
  onBrandSelect: (brandId: string) => void
  onBrandCreated?: (brand: Brand) => void
}

export const InlineBrandCreator: React.FC<InlineBrandCreatorProps> = ({
  selectedBrandId,
  onBrandSelect,
  onBrandCreated,
}) => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandDescription, setNewBrandDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { store: currentStore } = useCurrentStore()

  // Cargar marcas al montar el componente
  React.useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const brandsData = await productService.getBrands()
      setBrands(brandsData)
    } catch (error) {
      console.error('Error loading brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      alert('El nombre de la marca es requerido')
      return
    }

    if (!currentStore) {
      alert('No hay tienda seleccionada')
      return
    }

    try {
      setLoading(true)
      
      const brandData = {
        name: newBrandName.trim(),
        slug: newBrandName
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim(),
        description: newBrandDescription.trim() || '',
        storeId: currentStore.id,
        logo: '',
        website: '',
        isActive: true,
        sortOrder: brands.length + 1,
      }

      const brandId = await productService.createBrand(brandData)

      const newBrand: Brand = {
        id: brandId,
        ...brandData,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setBrands(prev => [...prev, newBrand])
      
      if (onBrandCreated) {
        onBrandCreated(newBrand)
      }
      
      setIsCreateDialogOpen(false)
      setNewBrandName('')
      setNewBrandDescription('')
    } catch (error) {
      console.error('Error creating brand:', error)
      alert(`Error al crear la marca: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Lista de marcas */}
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-2 gap-2 pr-4">
          {brands.map(brand => {
            const isSelected = selectedBrandId === brand.id
            return (
              <Card
                key={brand.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-purple-500 bg-purple-50 shadow-md'
                    : 'hover:shadow-md bg-white border-slate-200 hover:scale-[1.02]'
                }`}
                onClick={() => onBrandSelect(brand.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}>
                      <Building2 className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {brand.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                      {brand.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {brands.length === 0 && !loading && (
            <div className="col-span-2 text-center py-8 text-slate-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No hay marcas creadas</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Botón para crear nueva marca */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsCreateDialogOpen(true)}
        className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
        disabled={loading}
      >
        <Plus className="w-4 h-4 mr-2" />
        Crear nueva marca
      </Button>

      {/* Diálogo para crear marca */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle>Crear Nueva Marca</DialogTitle>
                <DialogDescription>
                  Agrega una nueva marca para tus productos
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name" className="text-sm font-medium text-slate-700">
                Nombre de la marca *
              </Label>
              <Input
                id="brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Ej: Nike, Adidas, Zara..."
                className="h-11 border-slate-300"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-description" className="text-sm font-medium text-slate-700">
                Descripción (opcional)
              </Label>
              <Input
                id="brand-description"
                value={newBrandDescription}
                onChange={(e) => setNewBrandDescription(e.target.value)}
                placeholder="Breve descripción de la marca..."
                className="h-11 border-slate-300"
              />
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start gap-2">
                <Tag className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Vista previa</p>
                  <p className="text-sm text-purple-700 mt-1">
                    {newBrandName.trim() || 'Nombre de la marca'}
                  </p>
                  {newBrandDescription.trim() && (
                    <p className="text-xs text-purple-600 mt-0.5">
                      {newBrandDescription.trim()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setNewBrandName('')
                setNewBrandDescription('')
              }}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateBrand}
              disabled={loading || !newBrandName.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Crear Marca
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}




