import { useState } from 'react'
import { Plus, Trash2, Edit, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ProductVariation, type AttributeValue } from '@/types'

interface ProductVariationsManagerProps {
  variations: ProductVariation[]
  attributes: Array<{
    id: string
    name: string
    values: AttributeValue[]
  }>
  onVariationsChange: (variations: ProductVariation[]) => void
}

export function ProductVariationsManager({
  variations,
  attributes,
  onVariationsChange,
}: ProductVariationsManagerProps) {
  const [isAddingVariation, setIsAddingVariation] = useState(false)
  const [editingVariation, setEditingVariation] = useState<string | null>(null)
  const [newVariation, setNewVariation] = useState<Partial<ProductVariation>>({
    attributes: [],
    price: 0,
    sku: '',
  })

  const handleAddVariation = () => {
    if (!newVariation.attributes || newVariation.attributes.length === 0) {
      return
    }

    const variation: ProductVariation = {
      id: `var_${Date.now()}`,
      attributes: newVariation.attributes,
      price: newVariation.price || 0,
      sku: newVariation.sku || '',
      isActive: true,
    }

    onVariationsChange([...variations, variation])
    setNewVariation({
      attributes: [],
      price: 0,
      sku: '',
    })
    setIsAddingVariation(false)
  }

  const handleEditVariation = (variationId: string) => {
    setEditingVariation(variationId)
  }

  const handleSaveVariation = (variationId: string, updates: Partial<ProductVariation>) => {
    const updatedVariations = variations.map(variation =>
      variation.id === variationId ? { ...variation, ...updates } : variation
    )
    onVariationsChange(updatedVariations)
    setEditingVariation(null)
  }

  const handleDeleteVariation = (variationId: string) => {
    // Encontrar la variación que se intenta eliminar
    const variation = variations.find(v => v.id === variationId)
    
    // Validar si tiene inventario
    if (variation && variation.inventoryQuantity > 0) {
      alert(
        `No puedes eliminar esta variación porque tiene ${variation.inventoryQuantity} unidades en inventario.\n\n` +
        'Primero debes reducir el inventario a 0 antes de eliminarla.'
      )
      return
    }
    
    const updatedVariations = variations.filter(variation => variation.id !== variationId)
    onVariationsChange(updatedVariations)
  }

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    const attribute = attributes.find(attr => attr.id === attributeId)
    const value = attribute?.values.find(val => val.id === valueId)

    if (attribute && value) {
      setNewVariation(prev => ({
        ...prev,
        attributes: [
          ...(prev.attributes || []),
          {
            attributeId,
            valueId,
            value: value.value,
            displayValue: value.displayValue,
          },
        ],
      }))
    }
  }

  const getAttributeValue = (attributeId: string) => {
    const attr = newVariation.attributes?.find(a => a.attributeId === attributeId)
    return attr?.valueId || ''
  }

  const getVariationDisplayName = (variation: ProductVariation) => {
    return variation.attributes
      .map(attr => attr.displayValue)
      .join(' / ')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Variaciones del Producto</h3>
        <Dialog open={isAddingVariation} onOpenChange={setIsAddingVariation}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Variación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nueva Variación</DialogTitle>
              <DialogDescription>
                Crea una nueva variación del producto con atributos específicos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {attributes.map((attribute) => (
                <div key={attribute.id} className="space-y-2">
                  <Label htmlFor={`attr-${attribute.id}`}>{attribute.name}</Label>
                  <Select
                    value={getAttributeValue(attribute.id)}
                    onValueChange={(valueId) => handleAttributeChange(attribute.id, valueId)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Seleccionar ${attribute.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {attribute.values.map((value) => (
                        <SelectItem key={value.id} value={value.id}>
                          <div className="flex items-center space-x-2">
                            {value.hexCode && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: value.hexCode }}
                              />
                            )}
                            <span>{value.displayValue}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newVariation.price || ''}
                    onChange={(e) =>
                      setNewVariation(prev => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventario</Label>
                  <Input
                    id="inventory"
                    type="number"
                    value="0"
                    onChange={(e) => {
                      // Temporalmente deshabilitado hasta arreglar tipos
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Opcional)</Label>
                <Input
                  id="sku"
                  value={newVariation.sku || ''}
                  onChange={(e) =>
                    setNewVariation(prev => ({
                      ...prev,
                      sku: e.target.value,
                    }))
                  }
                  placeholder="Código único del producto"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddingVariation(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddVariation}
                disabled={Object.keys(newVariation.attributes || {}).length === 0}
              >
                Agregar Variación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {variations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay variaciones creadas</p>
          <p className="text-sm">Agrega variaciones para diferentes colores, tallas, etc.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variación</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Inventario</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map((variation) => (
                <TableRow key={variation.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {variation.attributes.map((attr, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <span className="text-sm">{attr.displayValue}</span>
                          {index < variation.attributes.length - 1 && (
                            <span className="text-muted-foreground">/</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingVariation === variation.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={variation.price}
                        onChange={(e) =>
                          handleSaveVariation(variation.id, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20"
                      />
                    ) : (
                      <span className="font-mono">${variation.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingVariation === variation.id ? (
                      <Input
                        type="number"
                        value="0"
                        onChange={(e) => {
                          // Temporalmente deshabilitado hasta arreglar tipos
                        }}
                        className="w-20"
                      />
                    ) : (
                      <span className="font-mono">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingVariation === variation.id ? (
                      <Input
                        value={variation.sku}
                        onChange={(e) =>
                          handleSaveVariation(variation.id, {
                            sku: e.target.value,
                          })
                        }
                        className="w-32"
                      />
                    ) : (
                      <span className="font-mono text-sm">{variation.sku || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={variation.isActive ? 'default' : 'secondary'}>
                      {variation.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {editingVariation === variation.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingVariation(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditVariation(variation.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteVariation(variation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
