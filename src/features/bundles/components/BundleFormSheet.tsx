/**
 * Formulario para crear/editar combos
 * UX: Seleccionar productos > Configurar combo > Establecer precio
 */

import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Package, Percent, DollarSign, Calendar, Tag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useProducts from '@/hooks/use-products'
import { useBundles } from '@/hooks'
import type { Bundle, BundleDiscountType, CreateBundleDTO } from '@/types/bundle'
import { cn } from '@/lib/utils'
import { useCurrentStore } from '@/stores/store-store'

interface BundleFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bundle?: Bundle | null
  preSelectedProducts?: Array<{ id: string; quantity: number }>
}

export function BundleFormSheet({
  open,
  onOpenChange,
  bundle,
  preSelectedProducts = [],
}: BundleFormSheetProps) {
  const { store: currentStore } = useCurrentStore()
  const { products, isLoading: isLoadingProducts } = useProducts(currentStore?.id)
  const { createBundle, updateBundle, isCreating, isUpdating } = useBundles(currentStore?.id)

  const [currentStep, setCurrentStep] = useState<'products' | 'details' | 'pricing'>('products')
  
  // Form data
  const [selectedProducts, setSelectedProducts] = useState<Array<{ id: string; quantity: number }>>(preSelectedProducts)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    status: 'draft' as Bundle['status'],
    isFeatured: false,
    discountType: 'percentage' as BundleDiscountType,
    discountValue: 20,
    minQuantity: 1,
    maxQuantity: undefined as number | undefined,
    requiresAllItems: true,
    allowQuantityChange: false,
    tags: '',
    startDate: '',
    endDate: '',
  })

  // Calcular precios
  const totalOriginalPrice = selectedProducts.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id)
    return sum + (product?.pricing?.basePrice || 0) * item.quantity
  }, 0)

  const bundlePrice = 
    formData.discountType === 'percentage'
      ? totalOriginalPrice * (1 - formData.discountValue / 100)
      : formData.discountType === 'fixed'
      ? Math.max(0, totalOriginalPrice - formData.discountValue)
      : formData.discountValue

  const savings = totalOriginalPrice - bundlePrice
  const savingsPercentage = totalOriginalPrice > 0 ? (savings / totalOriginalPrice) * 100 : 0

  // Función para generar slug desde nombre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Auto-generar slug cuando cambia el nombre (solo en modo creación)
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !bundle ? generateSlug(name) : prev.slug
    }))
  }

  // Cargar datos si es edición o resetear si es nuevo
  useEffect(() => {
    if (!open) return

    if (bundle) {
      // Modo edición - cargar datos del bundle
      setSelectedProducts(bundle.items.map(item => ({
        id: item.productId,
        quantity: item.quantity
      })))
      setFormData({
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        shortDescription: bundle.shortDescription || '',
        status: bundle.status,
        isFeatured: bundle.isFeatured,
        discountType: bundle.discount.type,
        discountValue: bundle.discount.value,
        minQuantity: bundle.restrictions.minQuantity,
        maxQuantity: bundle.restrictions.maxQuantity,
        requiresAllItems: bundle.restrictions.requiresAllItems,
        allowQuantityChange: bundle.restrictions.allowQuantityChange,
        tags: bundle.tags.join(', '),
        startDate: bundle.startDate ? new Date(bundle.startDate).toISOString().split('T')[0] : '',
        endDate: bundle.endDate ? new Date(bundle.endDate).toISOString().split('T')[0] : '',
      })
      setCurrentStep('products')
    } else {
      // Modo creación
      setSelectedProducts(preSelectedProducts)
      setCurrentStep(preSelectedProducts.length > 0 ? 'details' : 'products')
      
      // Resetear form data
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        status: 'draft',
        isFeatured: false,
        discountType: 'percentage',
        discountValue: 20,
        minQuantity: 1,
        maxQuantity: undefined,
        requiresAllItems: true,
        allowQuantityChange: false,
        tags: '',
        startDate: '',
        endDate: '',
      })
    }
  }, [open])

  const handleAddProduct = (productId: string) => {
    if (selectedProducts.find(p => p.id === productId)) {
      return
    }
    setSelectedProducts([...selectedProducts, { id: productId, quantity: 1 }])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ))
  }

  const handleSubmit = async () => {
    if (!currentStore?.id) {
      alert('No hay tienda seleccionada')
      return
    }

    if (selectedProducts.length < 2) {
      alert('Debes seleccionar al menos 2 productos')
      return
    }

    if (!formData.name.trim()) {
      alert('El nombre es requerido')
      return
    }

    const bundleData: CreateBundleDTO = {
      storeId: currentStore.id,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      shortDescription: formData.shortDescription,
      status: formData.status,
      isFeatured: formData.isFeatured,
      items: selectedProducts.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      discount: {
        type: formData.discountType,
        value: formData.discountValue,
      },
      restrictions: {
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity,
        requiresAllItems: formData.requiresAllItems,
        allowQuantityChange: formData.allowQuantityChange,
      },
      images: [],
      categoryIds: [],
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      seoTitle: formData.name,
      seoDescription: formData.shortDescription,
    }

    try {
      if (bundle) {
        await updateBundle({ bundleId: bundle.id, updates: bundleData })
      } else {
        await createBundle(bundleData)
      }
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error al guardar combo:', error)
      alert('Error al guardar el combo')
    }
  }

  const resetForm = () => {
    setSelectedProducts([])
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      status: 'draft',
      isFeatured: false,
      discountType: 'percentage',
      discountValue: 20,
      minQuantity: 1,
      maxQuantity: undefined,
      requiresAllItems: true,
      allowQuantityChange: false,
      tags: '',
      startDate: '',
      endDate: '',
    })
    setCurrentStep('products')
  }

  const canProceedToNext = () => {
    if (currentStep === 'products') return selectedProducts.length >= 2
    if (currentStep === 'details') return formData.name.trim().length > 0
    return true
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {bundle ? 'Editar Combo' : 'Crear Nuevo Combo'}
              </div>
              <SheetDescription className="text-sm mt-1">
                Crea un combo seleccionando productos y configurando el descuento
              </SheetDescription>
            </div>
          </SheetTitle>
        </SheetHeader>

        <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products" disabled={!canProceedToNext && currentStep !== 'products'}>
                1. Productos ({selectedProducts.length})
              </TabsTrigger>
              <TabsTrigger value="details" disabled={selectedProducts.length < 2}>
                2. Detalles
              </TabsTrigger>
              <TabsTrigger value="pricing" disabled={!formData.name.trim()}>
                3. Precio
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {/* PASO 1: Seleccionar Productos */}
            <TabsContent value="products" className="space-y-4 mt-4 h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Productos Seleccionados</h3>
                <Badge variant="secondary">{selectedProducts.length} productos</Badge>
              </div>

              {selectedProducts.length > 0 && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  {selectedProducts.map(item => {
                    const product = products.find(p => p.id === item.id)
                    if (!product) return null

                    return (
                      <Card key={item.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || '/placeholder.png'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${product.pricing?.basePrice?.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-20 h-8 text-center"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {selectedProducts.length < 2 && (
                <div className="p-6 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  Selecciona al menos 2 productos para crear un combo
                </div>
              )}

              <div>
                <Label>Agregar Productos</Label>
                {!currentStore ? (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground mt-2">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No hay tienda seleccionada</p>
                    <p className="text-sm mt-1">Selecciona una tienda para ver productos</p>
                  </div>
                ) : isLoadingProducts ? (
                  <div className="p-8 border rounded-lg text-center text-muted-foreground mt-2">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm">Cargando productos...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground mt-2">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No hay productos disponibles</p>
                    <p className="text-sm mt-1">Crea productos primero para poder agregarlos a un combo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-2 max-h-[400px] overflow-y-auto p-2">
                    {products
                      .filter(p => !selectedProducts.find(sp => sp.id === p.id))
                      .map(product => (
                        <Card
                          key={product.id}
                          className={cn(
                            "cursor-pointer hover:border-primary transition-all",
                            "hover:shadow-md"
                          )}
                          onClick={() => handleAddProduct(product.id)}
                        >
                          <CardContent className="p-3">
                            <img
                              src={product.images?.[0]?.url || '/placeholder.png'}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                            <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${product.pricing?.basePrice?.toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setCurrentStep('details')}
                disabled={!canProceedToNext()}
                className="w-full"
              >
                Continuar a Detalles
              </Button>
            </div>
          </TabsContent>

            {/* PASO 2: Detalles */}
            <TabsContent value="details" className="space-y-4 mt-4 h-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Combo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Pack Verano 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="pack-verano-2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Descripción Corta</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Resumen breve del combo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Completa</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada del combo..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="scheduled">Programado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor="featured">Destacado</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="verano, pack, oferta"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('products')}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  onClick={() => setCurrentStep('pricing')}
                  disabled={!canProceedToNext()}
                  className="flex-1"
                >
                  Continuar a Precio
                </Button>
              </div>
            </div>
          </TabsContent>

            {/* PASO 3: Precio y Descuento */}
            <TabsContent value="pricing" className="space-y-4 mt-4 h-full">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Precio Original</p>
                    <p className="text-2xl font-bold line-through">${totalOriginalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Precio Combo</p>
                    <p className="text-3xl font-bold text-primary">${bundlePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ahorro</p>
                    <p className="text-2xl font-bold text-green-600">
                      {savingsPercentage.toFixed(0)}%
                    </p>
                    <p className="text-sm text-green-600">${savings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Descuento</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: BundleDiscountType) => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                    <SelectItem value="bundle_price">Precio Fijo del Combo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage' ? 'Porcentaje de Descuento' :
                   formData.discountType === 'fixed' ? 'Monto de Descuento' :
                   'Precio Final del Combo'}
                </Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step={formData.discountType === 'percentage' ? '1' : '1000'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                  />
                  {formData.discountType === 'percentage' ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Cantidad Mínima</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    min="1"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQuantity">Cantidad Máxima (opcional)</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    min="1"
                    value={formData.maxQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || undefined })}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresAllItems">Requiere todos los items</Label>
                  <Switch
                    id="requiresAllItems"
                    checked={formData.requiresAllItems}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresAllItems: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowQuantityChange">Permitir cambiar cantidades</Label>
                  <Switch
                    id="allowQuantityChange"
                    checked={formData.allowQuantityChange}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowQuantityChange: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha Inicio (opcional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin (opcional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              </div>

              <div className="flex gap-2 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('details')}
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                  className="flex-1"
                >
                  {(isCreating || isUpdating) ? (
                    <>Guardando...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {bundle ? 'Actualizar Combo' : 'Crear Combo'}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
