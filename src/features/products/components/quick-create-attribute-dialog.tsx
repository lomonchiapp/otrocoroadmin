import React, { useState } from 'react'
import { Plus, Palette, Ruler, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { attributeService } from '@/services/attributeService'
import type { Attribute, AttributeValue } from '@/types'

interface QuickCreateAttributeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  productType: string
  onAttributeCreated: (attribute: Attribute) => void
}

const ATTRIBUTE_TYPES = [
  { value: 'color', label: 'Color', icon: Palette },
  { value: 'size', label: 'Talla', icon: Ruler },
  { value: 'material', label: 'Material', icon: Plus },
  { value: 'style', label: 'Estilo', icon: Plus },
]

const DEFAULT_VALUES = {
  color: [
    { value: 'rojo', displayValue: 'Rojo', hexCode: '#FF0000' },
    { value: 'azul', displayValue: 'Azul', hexCode: '#0000FF' },
    { value: 'negro', displayValue: 'Negro', hexCode: '#000000' },
    { value: 'blanco', displayValue: 'Blanco', hexCode: '#FFFFFF' },
    { value: 'verde', displayValue: 'Verde', hexCode: '#00FF00' },
  ],
  size: [
    { value: 'xs', displayValue: 'XS' },
    { value: 's', displayValue: 'S' },
    { value: 'm', displayValue: 'M' },
    { value: 'l', displayValue: 'L' },
    { value: 'xl', displayValue: 'XL' },
  ],
  material: [
    { value: 'algodon', displayValue: 'Algodón' },
    { value: 'poliester', displayValue: 'Poliéster' },
    { value: 'lana', displayValue: 'Lana' },
    { value: 'seda', displayValue: 'Seda' },
  ],
  style: [
    { value: 'casual', displayValue: 'Casual' },
    { value: 'formal', displayValue: 'Formal' },
    { value: 'deportivo', displayValue: 'Deportivo' },
  ],
}

export function QuickCreateAttributeDialog({
  open,
  onOpenChange,
  storeId,
  productType,
  onAttributeCreated,
}: QuickCreateAttributeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attributeType, setAttributeType] = useState<string>('color')
  const [attributeName, setAttributeName] = useState<string>('Color')
  const [values, setValues] = useState<Array<{ value: string; displayValue: string; hexCode?: string }>>(
    DEFAULT_VALUES.color
  )
  const [newValue, setNewValue] = useState({ value: '', displayValue: '', hexCode: '' })

  const handleTypeChange = (type: string) => {
    setAttributeType(type)
    setAttributeName(ATTRIBUTE_TYPES.find(t => t.value === type)?.label || type)
    setValues(DEFAULT_VALUES[type as keyof typeof DEFAULT_VALUES] || [])
  }

  const handleAddValue = () => {
    if (newValue.value && newValue.displayValue) {
      setValues([...values, { ...newValue }])
      setNewValue({ value: '', displayValue: '', hexCode: '' })
    }
  }

  const handleRemoveValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!attributeName || values.length === 0) {
      alert('Por favor completa todos los campos')
      return
    }

    setIsSubmitting(true)
    try {
      // Primero crear el atributo sin valores
      const newAttributeId = await attributeService.createAttribute(storeId, {
        name: attributeName,
        slug: attributeName.toLowerCase().replace(/\s+/g, '-'),
        type: attributeType,
        description: `Atributo de ${attributeName}`,
        isVariationAttribute: true,
        isRequired: false,
        isSearchable: true,
        isFilterable: true,
        isVisibleOnFront: true,
        productTypes: [productType as any],
        values: [], // Inicialmente vacío
        sortOrder: 0,
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
      })

      // Ahora crear los valores con el attributeId correcto (limpiando undefined)
      const attributeValues: AttributeValue[] = values.map((val, index) => {
        const cleanValue: any = {
          id: `${newAttributeId}_value_${index}`,
          attributeId: newAttributeId,
          value: val.value,
          displayValue: val.displayValue,
          sortOrder: index,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        // Solo agregar hexCode si existe y no está vacío
        if (val.hexCode && val.hexCode.trim() !== '') {
          cleanValue.hexCode = val.hexCode
        }
        
        return cleanValue as AttributeValue
      })

      // Actualizar el atributo con los valores
      await attributeService.updateAttribute(newAttributeId, {
        values: attributeValues,
      })

      // Crear el objeto del atributo completo para retornar (con valores limpios)
      const cleanAttributeValues = attributeValues.map(val => {
        const cleanVal: any = {
          id: val.id,
          attributeId: val.attributeId,
          value: val.value,
          displayValue: val.displayValue,
          sortOrder: val.sortOrder,
          isActive: val.isActive,
          createdAt: val.createdAt,
          updatedAt: val.updatedAt,
        }
        
        if (val.hexCode) {
          cleanVal.hexCode = val.hexCode
        }
        
        return cleanVal as AttributeValue
      })

      const createdAttribute: Attribute = {
        id: newAttributeId,
        storeId,
        name: attributeName,
        slug: attributeName.toLowerCase().replace(/\s+/g, '-'),
        type: attributeType,
        description: `Atributo de ${attributeName}`,
        isVariationAttribute: true,
        isRequired: false,
        isSearchable: true,
        isFilterable: true,
        isVisibleOnFront: true,
        productTypes: [productType as any],
        values: cleanAttributeValues,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin',
      }

      onAttributeCreated(createdAttribute)
      onOpenChange(false)

      // Reset form
      setAttributeType('color')
      setAttributeName('Color')
      setValues(DEFAULT_VALUES.color)
    } catch (error) {
      console.error('Error creating attribute:', error)
      alert(`Error al crear el atributo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Atributo de Variación</DialogTitle>
          <DialogDescription>
            Crea un nuevo atributo (Color, Talla, etc.) para generar variaciones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Atributo */}
          <div className="space-y-2">
            <Label>Tipo de Atributo</Label>
            <Select value={attributeType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nombre del Atributo */}
          <div className="space-y-2">
            <Label>Nombre del Atributo</Label>
            <Input
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              placeholder="Ej: Color, Talla, Material"
            />
          </div>

          {/* Valores del Atributo */}
          <div className="space-y-2">
            <Label>Valores del Atributo</Label>
            <div className="border rounded-lg p-4 space-y-3">
              {/* Lista de valores existentes */}
              <div className="flex flex-wrap gap-2">
                {values.map((val, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {val.hexCode && (
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: val.hexCode }}
                      />
                    )}
                    <span>{val.displayValue}</span>
                    <button
                      onClick={() => handleRemoveValue(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Agregar nuevo valor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Valor (slug)"
                  value={newValue.value}
                  onChange={(e) => setNewValue({ ...newValue, value: e.target.value })}
                />
                <Input
                  placeholder="Nombre visible"
                  value={newValue.displayValue}
                  onChange={(e) => setNewValue({ ...newValue, displayValue: e.target.value })}
                />
                <div className="flex gap-2">
                  {attributeType === 'color' && (
                    <Input
                      type="color"
                      value={newValue.hexCode || '#000000'}
                      onChange={(e) => setNewValue({ ...newValue, hexCode: e.target.value })}
                      className="w-16"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddValue}
                    disabled={!newValue.value || !newValue.displayValue}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || values.length === 0}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Crear Atributo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
