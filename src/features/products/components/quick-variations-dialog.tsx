import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Package, Sparkles, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { productService } from '@/services/productService'
import { attributeService } from '@/services/attributeService'
import type { Product, Attribute, ProductVariation, ProductAttribute } from '@/types'
import { useCurrentStore } from '@/stores/store-store'
import { QuickCreateAttributeDialog } from './quick-create-attribute-dialog'

interface QuickVariationsDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function QuickVariationsDialog({
  product,
  open,
  onOpenChange,
  onUpdate,
}: QuickVariationsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false)
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<Map<string, string[]>>(new Map())
  const [generatedVariations, setGeneratedVariations] = useState<ProductVariation[]>([])
  const [showCreateAttributeDialog, setShowCreateAttributeDialog] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const { store: currentStore } = useCurrentStore()

  useEffect(() => {
    if (open && currentStore) {
      loadAttributes()
      loadExistingSelections()
    }
  }, [open, product, currentStore])

  const loadAttributes = async () => {
    if (!currentStore?.id) return
    
    setIsLoadingAttributes(true)
    try {
      // Usar getVariationAttributes que filtra automáticamente los atributos de variación
      const attributes = await attributeService.getVariationAttributes(
        currentStore.id,
        product.type
      )
      setAllAttributes(attributes)
      console.log('✅ Atributos de variación cargados:', attributes.length, 'atributos')
    } catch (error) {
      console.error('❌ Error loading attributes:', error)
      // Intentar sin filtro de tipo como fallback
      try {
        const allAttrs = await attributeService.getAttributesByStore(currentStore.id)
        const variationAttrs = allAttrs.filter(attr => attr.isVariationAttribute)
        setAllAttributes(variationAttrs)
        console.log('✅ Atributos cargados (fallback):', variationAttrs.length, 'atributos')
      } catch (fallbackError) {
        console.error('❌ Error loading attributes (fallback):', fallbackError)
        setAllAttributes([])
      }
    } finally {
      setIsLoadingAttributes(false)
    }
  }

  const loadExistingSelections = () => {
    if (product.attributes && product.attributes.length > 0) {
      const newMap = new Map<string, string[]>()
      product.attributes.forEach(attr => {
        if (attr.valueIds && attr.valueIds.length > 0) {
          newMap.set(attr.attributeId, attr.valueIds)
        }
      })
      setSelectedAttributes(newMap)
    }
  }

  const handleInitializeDefaultAttributes = async () => {
    if (!currentStore?.id) return

    setIsInitializing(true)
    try {
      console.log('🚀 Inicializando atributos por defecto...')
      await attributeService.initializeStoreAttributes(
        currentStore.id,
        product.type === 'clothing' ? 'fashion' : 'jewelry'
      )
      console.log('✅ Atributos inicializados correctamente')
      
      // Recargar los atributos
      await loadAttributes()
    } catch (error) {
      console.error('❌ Error inicializando atributos:', error)
      alert('Error al inicializar atributos. Intenta crear uno manualmente.')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleAttributeCreated = (newAttribute: Attribute) => {
    console.log('✅ Nuevo atributo creado:', newAttribute)
    setAllAttributes([...allAttributes, newAttribute])
  }

  const handleAttributeToggle = (attributeId: string, valueId: string) => {
    setSelectedAttributes(prev => {
      const newMap = new Map(prev)
      const currentValues = newMap.get(attributeId) || []

      if (currentValues.includes(valueId)) {
        const filtered = currentValues.filter(v => v !== valueId)
        if (filtered.length === 0) {
          newMap.delete(attributeId)
        } else {
          newMap.set(attributeId, filtered)
        }
      } else {
        newMap.set(attributeId, [...currentValues, valueId])
      }

      return newMap
    })
  }

  const generateVariations = () => {
    if (selectedAttributes.size === 0) {
      setGeneratedVariations([])
      return
    }

    // Obtener solo los atributos seleccionados
    const variationAttributes = Array.from(selectedAttributes.entries())
      .map(([attrId, valueIds]) => {
        const attr = allAttributes.find(a => a.id === attrId)
        if (!attr) return null
        return { attribute: attr, valueIds }
      })
      .filter(Boolean) as Array<{ attribute: Attribute; valueIds: string[] }>

    if (variationAttributes.length === 0) {
      setGeneratedVariations([])
      return
    }

    // Generar combinaciones
    const generateCombinations = (
      attrs: Array<{ attribute: Attribute; valueIds: string[] }>,
      current: Array<{ attrId: string; valueId: string }> = [],
      index = 0
    ): Array<Array<{ attrId: string; valueId: string }>> => {
      if (index === attrs.length) {
        return [current]
      }

      const { attribute, valueIds } = attrs[index]
      const results: Array<Array<{ attrId: string; valueId: string }>> = []

      for (const valueId of valueIds) {
        const newCurrent = [...current, { attrId: attribute.id, valueId }]
        results.push(...generateCombinations(attrs, newCurrent, index + 1))
      }

      return results
    }

    const combinations = generateCombinations(variationAttributes)

    // Crear variaciones
    const basePrice = product.basePrice || 0
    const newVariations: ProductVariation[] = combinations.map((combination, index) => {
      const varAttrs: ProductAttribute[] = combination.map(({ attrId, valueId }) => {
        const attr = allAttributes.find(a => a.id === attrId)!
        const value = attr.values.find(v => v.id === valueId)!
        return {
          attributeId: attrId,
          attribute: attr,
          valueIds: [valueId],
          values: [value],
        }
      })

      // Buscar si ya existe esta variación
      const existingVariation = product.variations?.find(v => {
        return v.attributes.every(va => 
          varAttrs.some(na => 
            na.attributeId === va.attributeId && 
            na.valueIds[0] === va.valueIds[0]
          )
        )
      })

      const sku = existingVariation?.sku || `SKU-${Date.now()}-${index}`

      return {
        id: existingVariation?.id || `var_${Date.now()}_${index}`,
        productId: product.id,
        sku,
        attributes: varAttrs,
        price: existingVariation?.price || basePrice,
        compareAtPrice: existingVariation?.compareAtPrice || 0,
        inventoryQuantity: existingVariation?.inventoryQuantity || 0,
        inventoryPolicy: 'deny' as const,
        images: existingVariation?.images || [],
        isActive: existingVariation?.isActive !== undefined ? existingVariation.isActive : true,
        position: index,
        createdAt: existingVariation?.createdAt || new Date(),
        updatedAt: new Date(),
      }
    })

    setGeneratedVariations(newVariations)
  }

  useEffect(() => {
    generateVariations()
  }, [selectedAttributes])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Preparar atributos del producto
      const productAttributes: ProductAttribute[] = Array.from(selectedAttributes.entries())
        .map(([attrId, valueIds]) => {
          const attr = allAttributes.find(a => a.id === attrId)
          if (!attr) return null
          const values = attr.values.filter(v => valueIds.includes(v.id))
          return {
            attributeId: attrId,
            attribute: attr,
            valueIds,
            values,
          }
        })
        .filter(Boolean) as ProductAttribute[]

      // Actualizar el producto con los nuevos atributos y variaciones
      await productService.updateProduct(product.id, {
        attributes: productAttributes,
      })

      // Actualizar las variaciones
      if (generatedVariations.length > 0) {
        await productService.updateProductVariations(product.id, generatedVariations)
      }

      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating variations:', error)
      alert('Error al actualizar las variaciones')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getVariationLabel = (variation: ProductVariation) => {
    return variation.attributes
      .map(attr => attr.values.map(v => v.displayValue).join(', '))
      .join(' / ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div>Gestionar Variaciones</div>
              <div className="text-sm font-normal text-muted-foreground">{product.name}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Selecciona los atributos para generar variaciones automáticamente
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="attributes" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attributes">
              <Package className="w-4 h-4 mr-2" />
              Atributos ({selectedAttributes.size})
            </TabsTrigger>
            <TabsTrigger value="variations">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Variaciones ({generatedVariations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="flex-1 overflow-y-auto mt-4 space-y-4">
            {isLoadingAttributes ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Cargando atributos...</p>
              </div>
            ) : allAttributes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div>
                  <p className="font-bold text-lg text-foreground">No hay atributos de variación</p>
                  <p className="text-sm mt-2">
                    Necesitas crear atributos (Color, Talla, etc.) para generar variaciones
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
                  <Button 
                    variant="default"
                    size="lg"
                    onClick={handleInitializeDefaultAttributes}
                    disabled={isInitializing}
                    className="w-full sm:w-auto"
                  >
                    {isInitializing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Inicializando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Crear Atributos por Defecto
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowCreateAttributeDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Atributo Manual
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                  <p className="font-semibold mb-1">💡 Tip:</p>
                  <p>Los atributos por defecto incluyen: Color, Talla, Material y más según el tipo de producto</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    {allAttributes.length} atributos disponibles
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateAttributeDialog(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Nuevo Atributo
                  </Button>
                </div>

                {allAttributes.map((attribute) => (
                  <div key={attribute.id} className="space-y-3 p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">{attribute.name}</Label>
                      <Badge variant="outline" className="text-xs">
                        {attribute.slug}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {attribute.values.map((value) => {
                      const isSelected = selectedAttributes.get(attribute.id)?.includes(value.id) || false
                      return (
                        <label
                          key={value.id}
                          className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-all hover:bg-accent ${
                            isSelected ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleAttributeToggle(attribute.id, value.id)}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {value.hexCode && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: value.hexCode }}
                              />
                            )}
                            <span className="text-sm">{value.displayValue}</span>
                          </div>
                        </label>
                      )
                    })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="variations" className="flex-1 overflow-y-auto mt-4">
            {generatedVariations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No hay variaciones generadas</p>
                <p className="text-sm mt-1">Selecciona atributos para generar variaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    {generatedVariations.length} variaciones generadas
                  </p>
                </div>
                {generatedVariations.map((variation, index) => (
                  <div
                    key={variation.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{getVariationLabel(variation)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          SKU: {variation.sku} • Stock: {variation.inventoryQuantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={variation.isActive ? 'default' : 'secondary'} className="text-xs">
                        {variation.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {generatedVariations.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Listo para guardar {generatedVariations.length} variaciones</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || generatedVariations.length === 0}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar Variaciones
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Dialog para crear atributos */}
        {currentStore && (
          <QuickCreateAttributeDialog
            open={showCreateAttributeDialog}
            onOpenChange={setShowCreateAttributeDialog}
            storeId={currentStore.id}
            productType={product.type}
            onAttributeCreated={handleAttributeCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
