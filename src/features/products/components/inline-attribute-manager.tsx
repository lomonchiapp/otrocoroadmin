import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Check,
  X,
  Sparkles,
  Palette,
  Ruler,
  Tag,
  CheckCircle2
} from 'lucide-react'
import { attributeService } from '@/services/attributeService'
import type { Attribute } from '@/types'
import { useCurrentStore } from '@/stores/store-store'

// Atributos por defecto
const DEFAULT_ATTRIBUTES = [
  {
    name: 'Color',
    slug: 'color',
    type: 'color' as const,
    inputType: 'color_picker' as const,
    description: 'Color del producto',
    values: [
      { value: 'negro', displayValue: 'Negro', hexCode: '#000000' },
      { value: 'blanco', displayValue: 'Blanco', hexCode: '#FFFFFF' },
      { value: 'rojo', displayValue: 'Rojo', hexCode: '#DC2626' },
      { value: 'azul', displayValue: 'Azul', hexCode: '#2563EB' },
      { value: 'verde', displayValue: 'Verde', hexCode: '#16A34A' },
      { value: 'amarillo', displayValue: 'Amarillo', hexCode: '#EAB308' },
      { value: 'rosa', displayValue: 'Rosa', hexCode: '#EC4899' },
      { value: 'morado', displayValue: 'Morado', hexCode: '#9333EA' },
      { value: 'gris', displayValue: 'Gris', hexCode: '#6B7280' },
      { value: 'beige', displayValue: 'Beige', hexCode: '#F5F5DC' },
    ]
  },
  {
    name: 'Talla',
    slug: 'size',
    type: 'size' as const,
    inputType: 'select' as const,
    description: 'Talla del producto',
    values: [
      { value: 'xs', displayValue: 'XS' },
      { value: 's', displayValue: 'S' },
      { value: 'm', displayValue: 'M' },
      { value: 'l', displayValue: 'L' },
      { value: 'xl', displayValue: 'XL' },
      { value: 'xxl', displayValue: 'XXL' },
    ]
  },
  {
    name: 'Material',
    slug: 'material',
    type: 'material' as const,
    inputType: 'multiselect' as const,
    description: 'Material de fabricación',
    values: [
      { value: 'algodon', displayValue: 'Algodón' },
      { value: 'poliester', displayValue: 'Poliéster' },
      { value: 'lana', displayValue: 'Lana' },
      { value: 'seda', displayValue: 'Seda' },
      { value: 'lino', displayValue: 'Lino' },
      { value: 'denim', displayValue: 'Denim' },
      { value: 'cuero', displayValue: 'Cuero' },
    ]
  },
  {
    name: 'Género',
    slug: 'gender',
    type: 'gender' as const,
    inputType: 'select' as const,
    description: 'Género al que está dirigido',
    values: [
      { value: 'men', displayValue: 'Hombre' },
      { value: 'women', displayValue: 'Mujer' },
      { value: 'unisex', displayValue: 'Unisex' },
      { value: 'kids', displayValue: 'Niños' },
    ]
  }
]

interface InlineAttributeManagerProps {
  selectedAttributes: Map<string, string[]>
  onAttributeToggle: (attributeId: string, valueId: string) => void
  onAttributesChange: (attributes: Attribute[]) => void
}

export const InlineAttributeManager: React.FC<InlineAttributeManagerProps> = ({
  selectedAttributes,
  onAttributeToggle,
  onAttributesChange,
}) => {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [creatingValueForAttribute, setCreatingValueForAttribute] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newValueName, setNewValueName] = useState('')
  const [newValueHex, setNewValueHex] = useState('')
  const { store: currentStore } = useCurrentStore()

  // Estado para crear nuevo atributo
  const [newAttributeData, setNewAttributeData] = useState({
    name: '',
    description: '',
    type: 'custom' as const,
    inputType: 'select' as const,
  })

  // ✅ Función para inicializar atributos por defecto
  const initializeDefaultAttributes = useCallback(async () => {
    if (!currentStore) return

    try {
      setLoading(true)

      for (const defaultAttr of DEFAULT_ATTRIBUTES) {
        // Crear el atributo
        const attributeId = await attributeService.createAttribute(currentStore.id, {
          name: defaultAttr.name,
          slug: defaultAttr.slug,
          type: defaultAttr.type,
          description: defaultAttr.description,
          isVariationAttribute: true,
          isRequired: false,
          isSearchable: true,
          isFilterable: true,
          isVisibleOnFront: true,
          productTypes: ['clothing', 'jewelry'],
          values: [],
          sortOrder: 0,
          isActive: true,
          createdBy: 'admin',
          updatedBy: 'admin',
        })

        // Crear los valores del atributo
        const attributeValues = defaultAttr.values.map((val, index) => {
          const cleanValue: any = {
            id: `${attributeId}_value_${index}`,
            attributeId: attributeId,
            value: val.value,
            displayValue: val.displayValue,
            sortOrder: index,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          if (val.hexCode && val.hexCode.trim() !== '') {
            cleanValue.hexCode = val.hexCode
          }
          
          return cleanValue
        })

        // Actualizar el atributo con los valores
        await attributeService.updateAttribute(attributeId, {
          values: attributeValues,
        })
      }

      // Recargar atributos
      const attributesData = await attributeService.getAttributesByStore(currentStore.id)
      setAttributes(attributesData)
      onAttributesChange(attributesData)
    } catch (error) {
      console.error('Error initializing default attributes:', error)
    } finally {
      setLoading(false)
    }
  }, [currentStore, onAttributesChange])

  // ✅ Función para cargar atributos - ahora con useCallback
  const loadAttributes = useCallback(async () => {
    if (!currentStore) return

    try {
      setLoading(true)
      const attributesData = await attributeService.getAttributesByStore(currentStore.id)
      setAttributes(attributesData)

      // Si no hay atributos, crear los por defecto
      if (attributesData.length === 0) {
        await initializeDefaultAttributes()
      }
    } catch (error) {
      console.error('Error loading attributes:', error)
    } finally {
      setLoading(false)
    }
  }, [currentStore, initializeDefaultAttributes])

  // Cargar atributos al montar el componente
  React.useEffect(() => {
    loadAttributes()
  }, [loadAttributes])

  const handleCreateAttribute = async () => {
    if (!newAttributeData.name.trim() || !currentStore) return

    try {
      setLoading(true)
      const attributeId = await attributeService.createAttribute(currentStore.id, {
        name: newAttributeData.name.trim(),
        slug: newAttributeData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        type: newAttributeData.type,
        inputType: newAttributeData.inputType,
        productTypes: ['clothing'],
        isRequired: false,
        isVariationAttribute: false,
        isFilterable: true,
        isVisible: true,
        sortOrder: attributes.length,
        description: newAttributeData.description,
        values: [],
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
      })

      const newAttribute: Attribute = {
        id: attributeId,
        storeId: currentStore.id,
        name: newAttributeData.name.trim(),
        slug: newAttributeData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        type: newAttributeData.type,
        inputType: newAttributeData.inputType,
        productTypes: ['clothing'],
        isRequired: false,
        isVariationAttribute: false,
        isFilterable: true,
        isVisible: true,
        sortOrder: attributes.length,
        description: newAttributeData.description,
        values: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin',
      }

      const updatedAttributes = [...attributes, newAttribute]
      setAttributes(updatedAttributes)
      onAttributesChange(updatedAttributes)

      setIsCreateDialogOpen(false)
      setNewAttributeData({
        name: '',
        description: '',
        type: 'custom',
        inputType: 'select',
      })
    } catch (error) {
      console.error('Error creating attribute:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateValue = async (attributeId: string) => {
    if (!newValueName.trim()) return

    try {
      setLoading(true)
      const attributeValueData: {
        value: string
        displayValue: string
        sortOrder: number
        isActive: boolean
        hexCode?: string
      } = {
        value: newValueName.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        displayValue: newValueName.trim(),
        sortOrder: 0,
        isActive: true,
      }

      // Solo incluir hexCode si tiene un valor
      if (newValueHex && newValueHex.trim() !== '') {
        attributeValueData.hexCode = newValueHex.trim()
      }

      const valueId = await attributeService.createAttributeValue(attributeId, attributeValueData)

      // Actualizar el atributo localmente
      const updatedAttributes = attributes.map(attr =>
        attr.id === attributeId
          ? {
              ...attr,
              values: [
                ...attr.values,
                {
                  id: valueId,
                  attributeId,
                  value: newValueName.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
                  displayValue: newValueName.trim(),
                  sortOrder: 0,
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              ]
            }
          : attr
      )

      setAttributes(updatedAttributes)
      onAttributesChange(updatedAttributes)
      setCreatingValueForAttribute(null)
      setNewValueName('')
      setNewValueHex('')
    } catch (error) {
      console.error('Error creating attribute value:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderAttributeCard = (attribute: Attribute) => {
    const isCreatingValue = creatingValueForAttribute === attribute.id
    const selectedValues = selectedAttributes.get(attribute.id) || []

    return (
      <Card key={attribute.id} className="border-slate-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header del atributo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  attribute.type === 'color' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  attribute.type === 'size' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  'bg-gradient-to-br from-slate-500 to-slate-600'
                }`}>
                  {attribute.type === 'color' && <Palette className="w-4 h-4 text-white" />}
                  {attribute.type === 'size' && <Ruler className="w-4 h-4 text-white" />}
                  {attribute.type !== 'color' && attribute.type !== 'size' && <Tag className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{attribute.name}</h4>
                  <p className="text-xs text-slate-500">{attribute.description}</p>
                  {attribute.isVariationAttribute && (
                    <Badge variant="secondary" className="mt-1 text-xs bg-indigo-100 text-indigo-700">
                      Crea variaciones
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatingValueForAttribute(attribute.id)}
                className="h-8 text-xs"
                disabled={loading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar valor
              </Button>
            </div>

            {/* Crear nuevo valor */}
            {isCreatingValue && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newValueName}
                      onChange={(e) => setNewValueName(e.target.value)}
                      placeholder={`Nuevo ${attribute.name.toLowerCase()}`}
                      className="h-8 text-sm flex-1"
                      autoFocus
                    />
                    {attribute.type === 'color' && (
                      <Input
                        type="color"
                        value={newValueHex}
                        onChange={(e) => setNewValueHex(e.target.value)}
                        className="h-8 w-16 p-1"
                        title="Seleccionar color"
                      />
                    )}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCreateValue(attribute.id)}
                      disabled={loading || !newValueName.trim()}
                      className="h-8 px-3"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Crear
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCreatingValueForAttribute(null)
                        setNewValueName('')
                        setNewValueHex('')
                      }}
                      className="h-8 w-7 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Valores del atributo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {attribute.values.map(value => {
                const isSelected = selectedValues.includes(value.id)

                return (
                  <div
                    key={value.id}
                    onClick={() => onAttributeToggle(attribute.id, value.id)}
                    className={`
                      cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md
                      ${isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <div className="flex-1 min-w-0">
                        {value.hexCode && (
                          <div
                            className="w-4 h-4 rounded-full border border-slate-300 mr-2 flex-shrink-0"
                            style={{ backgroundColor: value.hexCode }}
                          />
                        )}
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {value.displayValue}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {attribute.values.length === 0 && !isCreatingValue && (
              <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No hay valores disponibles</p>
                <p className="text-xs">Agrega valores para este atributo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de crear atributo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          Atributos y Variaciones
        </h3>
        <Button
          type="button"
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={loading}
          size="default"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Atributo
        </Button>
      </div>

      <ScrollArea className="h-[450px]">
        <div className="space-y-6 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-slate-600">Cargando atributos...</span>
            </div>
          ) : attributes.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">No hay atributos configurados</p>
              <p className="text-sm text-slate-500 mb-4">
                Crea atributos para gestionar variaciones de productos
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Atributo
              </Button>
            </div>
          ) : (
            attributes
              .filter(attr => attr.isActive)
              .map(renderAttributeCard)
          )}
        </div>
      </ScrollArea>

      {/* Diálogo para crear nuevo atributo */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle>Crear Nuevo Atributo</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo atributo para tus productos
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attribute-name" className="text-sm font-medium text-slate-700">
                Nombre del atributo *
              </Label>
              <Input
                id="attribute-name"
                value={newAttributeData.name}
                onChange={(e) => setNewAttributeData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Estilo, Temporada, Marca..."
                className="h-11 border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attribute-description" className="text-sm font-medium text-slate-700">
                Descripción
              </Label>
              <Textarea
                id="attribute-description"
                value={newAttributeData.description}
                onChange={(e) => setNewAttributeData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descripción del atributo..."
                className="min-h-[80px] border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Tipo</Label>
                <Select
                  value={newAttributeData.type}
                  onValueChange={(value: string) => setNewAttributeData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger className="h-11 border-slate-300">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="size">Talla</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="gender">Género</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Tipo de entrada</Label>
                <Select
                  value={newAttributeData.inputType}
                  onValueChange={(value: string) => setNewAttributeData(prev => ({ ...prev, inputType: value as any }))}
                >
                  <SelectTrigger className="h-11 border-slate-300">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">Selección única</SelectItem>
                    <SelectItem value="multiselect">Selección múltiple</SelectItem>
                    <SelectItem value="color_picker">Selector de color</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Vista previa</p>
                  <p className="text-sm text-indigo-700 mt-1">
                    <strong>{newAttributeData.name || 'Nombre del atributo'}</strong>
                  </p>
                  {newAttributeData.description && (
                    <p className="text-xs text-indigo-600 mt-0.5">
                      {newAttributeData.description}
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
                setNewAttributeData({
                  name: '',
                  description: '',
                  type: 'custom',
                  inputType: 'select',
                })
              }}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateAttribute}
              disabled={loading || !newAttributeData.name.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Crear Atributo
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

