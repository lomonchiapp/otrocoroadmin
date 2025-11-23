import { useState } from 'react'
import { Package, Plus, Minus, Save, X, Infinity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { productService } from '@/services/productService'
import type { Product, ProductVariation } from '@/types'

interface QuickStockManagerProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function QuickStockManager({
  product,
  open,
  onOpenChange,
  onUpdate,
}: QuickStockManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({})
  const [infiniteStockFlags, setInfiniteStockFlags] = useState<Record<string, boolean>>({})

  const hasVariations = product.variations && product.variations.length > 0

  const handleStockChange = (variationId: string, value: number) => {
    setStockChanges(prev => ({
      ...prev,
      [variationId]: Math.max(0, value)
    }))
  }

  const toggleInfiniteStock = (variationId: string) => {
    setInfiniteStockFlags(prev => ({
      ...prev,
      [variationId]: !prev[variationId]
    }))
    // Si activa stock infinito, resetear el stock a 0
    if (!infiniteStockFlags[variationId]) {
      setStockChanges(prev => ({
        ...prev,
        [variationId]: 0
      }))
    }
  }

  const adjustStock = (variationId: string, amount: number) => {
    const currentStock = stockChanges[variationId] ?? 
      (product.variations?.find(v => v.id === variationId)?.inventoryQuantity || 0)
    
    handleStockChange(variationId, currentStock + amount)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (hasVariations) {
        // Update variations with new stock
        const updatedVariations = product.variations!.map(variation => {
          const hasInfinite = infiniteStockFlags[variation.id] ?? variation.hasInfiniteStock ?? false
          return {
            ...variation,
            inventoryQuantity: stockChanges[variation.id] ?? variation.inventoryQuantity,
            hasInfiniteStock: hasInfinite
          }
        })

        await productService.updateProductVariations(product.id, updatedVariations)
      }

      onUpdate()
      onOpenChange(false)
      setStockChanges({})
      setInfiniteStockFlags({})
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating stock:', error)
      alert('Error al actualizar el stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalStock = hasVariations
    ? product.variations!.reduce((sum, v) => {
        const hasInfinite = infiniteStockFlags[v.id] ?? v.hasInfiniteStock ?? false
        if (hasInfinite) return sum + 999999 // Representar stock infinito
        const newStock = stockChanges[v.id] ?? v.inventoryQuantity
        return sum + newStock
      }, 0)
    : 0

  const hasAnyInfiniteStock = hasVariations && product.variations!.some(v => 
    infiniteStockFlags[v.id] ?? v.hasInfiniteStock ?? false
  )

  const getVariationLabel = (variation: ProductVariation) => {
    return variation.attributes
      .map(attr => attr.values.map(v => v.displayValue).join(', '))
      .join(' / ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestión Rápida de Stock
          </DialogTitle>
          <DialogDescription>
            Actualiza el inventario de: <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Stock Total</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {hasAnyInfiniteStock ? (
                  <>
                    <Infinity className="w-6 h-6" />
                    <span className="text-lg">Infinito</span>
                  </>
                ) : (
                  `${totalStock} unidades`
                )}
              </p>
            </div>
            <div>
              <Badge
                variant={hasAnyInfiniteStock ? 'default' : totalStock === 0 ? 'destructive' : totalStock <= 5 ? 'default' : 'secondary'}
                className={hasAnyInfiniteStock || totalStock > 5 ? 'bg-green-500' : ''}
              >
                {hasAnyInfiniteStock ? 'Stock Infinito' : totalStock === 0 ? 'Agotado' : totalStock <= 5 ? 'Stock Bajo' : 'En Stock'}
              </Badge>
            </div>
          </div>

          {/* Info sobre stock infinito */}
          {!hasVariations && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Sin Variaciones</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este producto no tiene variaciones configuradas.
              </p>
              <p className="text-xs text-muted-foreground">
                Agrega atributos al producto para gestionar stock por variación.
              </p>
            </div>
          )}

          {hasVariations && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Infinity className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                    Stock Infinito
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Marca el checkbox "Stock Infinito" en cada variación para productos con disponibilidad ilimitada.
                    Los controles de cantidad se deshabilitarán automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasVariations && (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  Todas las Variaciones ({product.variations!.length})
                </TabsTrigger>
                <TabsTrigger value="low" className="flex-1">
                  Stock Bajo ({product.variations!.filter(v => v.inventoryQuantity <= 5).length})
                </TabsTrigger>
                <TabsTrigger value="out" className="flex-1">
                  Agotados ({product.variations!.filter(v => v.inventoryQuantity === 0).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {product.variations!.map(variation => (
                  <VariationStockControl
                    key={variation.id}
                    variation={variation}
                    label={getVariationLabel(variation)}
                    currentStock={stockChanges[variation.id] ?? variation.inventoryQuantity}
                    onChange={(value) => handleStockChange(variation.id, value)}
                    onAdjust={(amount) => adjustStock(variation.id, amount)}
                    hasInfiniteStock={infiniteStockFlags[variation.id] ?? variation.hasInfiniteStock ?? false}
                    onToggleInfiniteStock={() => toggleInfiniteStock(variation.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="low" className="space-y-3 mt-4">
                {product.variations!
                  .filter(v => {
                    const hasInfinite = infiniteStockFlags[v.id] ?? v.hasInfiniteStock ?? false
                    if (hasInfinite) return false
                    return (stockChanges[v.id] ?? v.inventoryQuantity) <= 5
                  })
                  .map(variation => (
                    <VariationStockControl
                      key={variation.id}
                      variation={variation}
                      label={getVariationLabel(variation)}
                      currentStock={stockChanges[variation.id] ?? variation.inventoryQuantity}
                      onChange={(value) => handleStockChange(variation.id, value)}
                      onAdjust={(amount) => adjustStock(variation.id, amount)}
                      hasInfiniteStock={infiniteStockFlags[variation.id] ?? variation.hasInfiniteStock ?? false}
                      onToggleInfiniteStock={() => toggleInfiniteStock(variation.id)}
                    />
                  ))}
                {product.variations!.filter(v => {
                  const hasInfinite = infiniteStockFlags[v.id] ?? v.hasInfiniteStock ?? false
                  if (hasInfinite) return false
                  return (stockChanges[v.id] ?? v.inventoryQuantity) <= 5
                }).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay variaciones con stock bajo
                  </div>
                )}
              </TabsContent>

              <TabsContent value="out" className="space-y-3 mt-4">
                {product.variations!
                  .filter(v => {
                    const hasInfinite = infiniteStockFlags[v.id] ?? v.hasInfiniteStock ?? false
                    if (hasInfinite) return false
                    return (stockChanges[v.id] ?? v.inventoryQuantity) === 0
                  })
                  .map(variation => (
                    <VariationStockControl
                      key={variation.id}
                      variation={variation}
                      label={getVariationLabel(variation)}
                      currentStock={stockChanges[variation.id] ?? variation.inventoryQuantity}
                      onChange={(value) => handleStockChange(variation.id, value)}
                      onAdjust={(amount) => adjustStock(variation.id, amount)}
                      hasInfiniteStock={infiniteStockFlags[variation.id] ?? variation.hasInfiniteStock ?? false}
                      onToggleInfiniteStock={() => toggleInfiniteStock(variation.id)}
                    />
                  ))}
                {product.variations!.filter(v => {
                  const hasInfinite = infiniteStockFlags[v.id] ?? v.hasInfiniteStock ?? false
                  if (hasInfinite) return false
                  return (stockChanges[v.id] ?? v.inventoryQuantity) === 0
                }).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay variaciones agotadas
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasVariations || (Object.keys(stockChanges).length === 0 && Object.keys(infiniteStockFlags).length === 0)}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface VariationStockControlProps {
  variation: ProductVariation
  label: string
  currentStock: number
  onChange: (value: number) => void
  onAdjust: (amount: number) => void
  hasInfiniteStock: boolean
  onToggleInfiniteStock: () => void
}

function VariationStockControl({
  variation,
  label,
  currentStock,
  onChange,
  onAdjust,
  hasInfiniteStock,
  onToggleInfiniteStock,
}: VariationStockControlProps) {
  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium">{label}</p>
            <Badge
              variant="outline"
              className={
                hasInfiniteStock
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : currentStock === 0
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : currentStock <= 5
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-green-50 text-green-700 border-green-200'
              }
            >
              {hasInfiniteStock ? (
                <span className="flex items-center gap-1">
                  <Infinity className="w-3 h-3" />
                  Infinito
                </span>
              ) : (
                currentStock === 0 ? 'Agotado' : currentStock <= 5 ? 'Bajo' : 'Stock OK'
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">SKU: {variation.sku}</p>
        </div>
      </div>

      {/* Stock Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Infinite Stock Toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`infinite-${variation.id}`}
            checked={hasInfiniteStock}
            onCheckedChange={onToggleInfiniteStock}
          />
          <Label
            htmlFor={`infinite-${variation.id}`}
            className="text-sm cursor-pointer flex items-center gap-1"
          >
            <Infinity className="w-4 h-4" />
            Stock Infinito
          </Label>
        </div>

        {/* Stock Quantity Controls - Disabled if infinite */}
        <div className="flex items-center gap-2">
          {/* Quick adjust buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjust(-10)}
              disabled={currentStock < 10 || hasInfiniteStock}
              className="h-8 w-8 p-0"
            >
              -10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjust(-1)}
              disabled={currentStock === 0 || hasInfiniteStock}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
          </div>

          {/* Stock input */}
          <div className="w-24">
            <Input
              type="number"
              value={hasInfiniteStock ? '∞' : currentStock}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              min={0}
              disabled={hasInfiniteStock}
              className="text-center font-mono"
            />
          </div>

          {/* Quick adjust buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjust(1)}
              disabled={hasInfiniteStock}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjust(10)}
              disabled={hasInfiniteStock}
              className="h-8 w-8 p-0"
            >
              +10
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}











