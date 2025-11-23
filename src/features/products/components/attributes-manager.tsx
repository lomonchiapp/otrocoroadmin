import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentStore } from '@/stores/store-store'
import { attributeService } from '@/services/attributeService'
import type { Attribute, AttributeType, AttributeInputType, ProductTypeContext } from '@/types'
import { AttributeValuesManager } from './attribute-values-manager'

interface AttributesManagerProps {
  onAttributeSelect?: (attribute: Attribute) => void
}

export function AttributesManager({ onAttributeSelect: _onAttributeSelect }: AttributesManagerProps) {
  const { store: currentStore, type: storeType } = useCurrentStore()
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [managingValuesAttribute, setManagingValuesAttribute] = useState<Attribute | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as AttributeType,
    inputType: 'select' as AttributeInputType,
    productTypes: ['all'] as ProductTypeContext[],
    isRequired: false,
    isVariationAttribute: false,
    isFilterable: true,
    isVisible: true,
    description: ''
  })

  useEffect(() => {
    if (currentStore) {
      loadAttributes()
    }
  }, [currentStore])

  const loadAttributes = async () => {
    if (!currentStore) return
    
    try {
      setLoading(true)
      const storeAttributes = await attributeService.getAttributesByStore(currentStore.id)
      setAttributes(storeAttributes)
    } catch (error) {
      console.error('Error loading attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAttribute = async () => {
    if (!currentStore) return

    try {
      const attributeId = await attributeService.createAttribute(currentStore.id, {
        ...formData,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        values: [],
        sortOrder: attributes.length,
        isActive: true,
        createdBy: 'current-user', // TODO: get from auth
        updatedBy: 'current-user'
      })

      await loadAttributes()
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating attribute:', error)
    }
  }

  const handleUpdateAttribute = async () => {
    if (!selectedAttribute) return

    try {
      await attributeService.updateAttribute(selectedAttribute.id, {
        ...formData,
        updatedBy: 'current-user' // TODO: get from auth
      })

      await loadAttributes()
      setIsEditDialogOpen(false)
      setSelectedAttribute(null)
      resetForm()
    } catch (error) {
      console.error('Error updating attribute:', error)
    }
  }

  const handleDeleteAttribute = async (attributeId: string) => {
    try {
      await attributeService.deleteAttribute(attributeId)
      await loadAttributes()
    } catch (error) {
      console.error('Error deleting attribute:', error)
    }
  }

  const handleToggleAttribute = async (attributeId: string, isActive: boolean) => {
    try {
      await attributeService.updateAttribute(attributeId, { 
        isActive,
        updatedBy: 'current-user' // TODO: get from auth
      })
      await loadAttributes()
    } catch (error) {
      console.error('Error toggling attribute:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      inputType: 'select',
      productTypes: ['all'],
      isRequired: false,
      isVariationAttribute: false,
      isFilterable: true,
      isVisible: true,
      description: ''
    })
  }

  const openEditDialog = (attribute: Attribute) => {
    setSelectedAttribute(attribute)
    setFormData({
      name: attribute.name,
      type: attribute.type,
      inputType: attribute.inputType,
      productTypes: attribute.productTypes,
      isRequired: attribute.isRequired,
      isVariationAttribute: attribute.isVariationAttribute,
      isFilterable: attribute.isFilterable,
      isVisible: attribute.isVisible,
      description: attribute.description || ''
    })
    setIsEditDialogOpen(true)
  }

  if (!currentStore) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Selecciona una tienda para gestionar atributos</p>
        </CardContent>
      </Card>
    )
  }

  const getAttributeTypeColor = (type: AttributeType) => {
    const colors = {
      color: 'bg-red-100 text-red-800',
      size: 'bg-blue-100 text-blue-800',
      material: 'bg-green-100 text-green-800',
      gender: 'bg-purple-100 text-purple-800',
      season: 'bg-yellow-100 text-yellow-800',
      fit: 'bg-indigo-100 text-indigo-800',
      metal: 'bg-orange-100 text-orange-800',
      gemstone: 'bg-pink-100 text-pink-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.custom
  }

  // Función auxiliar para determinar si un color es claro
  const isLightColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155
  }

  // Calcular estadísticas
  const stats = {
    total: attributes.length,
    active: attributes.filter(a => a.isActive).length,
    variation: attributes.filter(a => a.isVariationAttribute).length,
    filterable: attributes.filter(a => a.isFilterable).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Atributos de Productos</h2>
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200">
                  {currentStore.name} • {storeType === 'fashion' ? 'Moda' : 'Joyería'}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              Define las propiedades y características de tus productos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => storeType && attributeService.initializeStoreAttributes(currentStore.id, storeType)}
              disabled={!storeType}
              className="text-slate-600 hover:text-slate-900"
            >
              <Settings className="w-4 h-4 mr-2" />
              Inicializar Predefinidos
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Atributo
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Atributo</DialogTitle>
                <DialogDescription>
                  Configura un nuevo atributo para los productos de tu tienda.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Color, Talla, Material"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Atributo</Label>
                  <Select value={formData.type} onValueChange={(value: AttributeType) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="size">Talla</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="gender">Género</SelectItem>
                      <SelectItem value="season">Temporada</SelectItem>
                      <SelectItem value="fit">Tipo de Ajuste</SelectItem>
                      {storeType === 'jewelry' && (
                        <>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="gemstone">Piedra Preciosa</SelectItem>
                        </>
                      )}
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="inputType">Tipo de Input</Label>
                  <Select value={formData.inputType} onValueChange={(value: AttributeInputType) => setFormData(prev => ({ ...prev, inputType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Selección Simple</SelectItem>
                      <SelectItem value="multiselect">Selección Múltiple</SelectItem>
                      <SelectItem value="color_picker">Selector de Color</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="measurement">Medida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isVariationAttribute"
                      checked={formData.isVariationAttribute}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVariationAttribute: checked }))}
                    />
                    <Label htmlFor="isVariationAttribute">Usar para variaciones</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFilterable"
                      checked={formData.isFilterable}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFilterable: checked }))}
                    />
                    <Label htmlFor="isFilterable">Mostrar en filtros</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isRequired"
                      checked={formData.isRequired}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                    />
                    <Label htmlFor="isRequired">Requerido</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAttribute}>
                  Crear Atributo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Atributos</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active} activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Para Variaciones</div>
            <div className="text-2xl font-bold text-blue-600">{stats.variation}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Generan variantes de productos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Para Filtros</div>
            <div className="text-2xl font-bold text-green-600">{stats.filterable}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visibles en frontend
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Valores</div>
            <div className="text-2xl font-bold text-purple-600">
              {attributes.reduce((sum, attr) => sum + attr.values.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Opciones disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="variation">Para Variaciones</TabsTrigger>
          <TabsTrigger value="filter">Para Filtros</TabsTrigger>
          <TabsTrigger value="inactive">Inactivos</TabsTrigger>
        </TabsList>

        {/* Renderizar atributos */}
        {['all', 'variation', 'filter', 'inactive'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando atributos...</p>
              </div>
            ) : (() => {
              const filteredAttributes = attributes.filter(attr => {
                if (tabValue === 'variation') return attr.isVariationAttribute && attr.isActive
                if (tabValue === 'filter') return attr.isFilterable && attr.isActive
                if (tabValue === 'inactive') return !attr.isActive
                return attr.isActive // 'all'
              })

              if (filteredAttributes.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        {tabValue === 'all' 
                          ? 'No hay atributos configurados para esta tienda.'
                          : `No hay atributos ${tabValue === 'variation' ? 'para variaciones' : tabValue === 'filter' ? 'para filtros' : 'inactivos'}.`
                        }
                      </p>
                      {tabValue === 'all' && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Primer Atributo
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              }

              return (
                <div className="grid gap-4">
                  {filteredAttributes.map((attribute) => (
                    <Card key={attribute.id} className={attribute.isActive ? '' : 'opacity-60'}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold">{attribute.name}</h3>
                                <Badge className={getAttributeTypeColor(attribute.type)}>
                                  {attribute.type}
                                </Badge>
                                {attribute.isVariationAttribute && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Variación
                                  </Badge>
                                )}
                                {attribute.isFilterable && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Filtro
                                  </Badge>
                                )}
                                {attribute.isRequired && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Requerido
                                  </Badge>
                                )}
                                {!attribute.isActive && (
                                  <Badge variant="secondary">Inactivo</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="font-mono text-xs">{attribute.slug}</span>
                                <span>•</span>
                                <span>{attribute.values.length} valores</span>
                                <span>•</span>
                                <span className="capitalize">{attribute.inputType?.replace('_', ' ') || 'N/A'}</span>
                              </div>
                              {attribute.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {attribute.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAttribute(attribute.id, !attribute.isActive)}
                              title={attribute.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {attribute.isActive ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(attribute)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Atributo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setManagingValuesAttribute(attribute)}>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Gestionar Valores
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteAttribute(attribute.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Mostrar valores del atributo */}
                        {attribute.values.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-2">
                              {attribute.values.slice(0, 10).map((value) => (
                                <Badge
                                  key={value.id}
                                  variant="secondary"
                                  className="text-xs"
                                  style={value.hexCode ? { 
                                    backgroundColor: value.hexCode, 
                                    color: isLightColor(value.hexCode) ? '#000' : '#fff',
                                    borderColor: value.hexCode
                                  } : {}}
                                >
                                  {value.hexCode && (
                                    <div 
                                      className="w-3 h-3 rounded-full mr-1 border" 
                                      style={{ backgroundColor: value.hexCode }}
                                    />
                                  )}
                                  {value.displayValue}
                                </Badge>
                              ))}
                              {attribute.values.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                  +{attribute.values.length - 10} más
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            })()}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Atributo</DialogTitle>
            <DialogDescription>
              Modifica la configuración del atributo.
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form as create but with update handler */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isVariationAttribute"
                  checked={formData.isVariationAttribute}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVariationAttribute: checked }))}
                />
                <Label htmlFor="edit-isVariationAttribute">Usar para variaciones</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isFilterable"
                  checked={formData.isFilterable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFilterable: checked }))}
                />
                <Label htmlFor="edit-isFilterable">Mostrar en filtros</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                />
                <Label htmlFor="edit-isRequired">Requerido</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateAttribute}>
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attribute Values Manager */}
      {managingValuesAttribute && (
        <AttributeValuesManager
          attribute={managingValuesAttribute}
          onClose={() => setManagingValuesAttribute(null)}
          onUpdate={() => {
            loadAttributes()
          }}
        />
      )}
    </div>
  )
}
