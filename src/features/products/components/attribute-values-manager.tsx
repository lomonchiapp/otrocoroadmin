import { useState } from 'react'
import { Plus, Edit, Trash2, X, Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { attributeService } from '@/services/attributeService'
import type { Attribute, AttributeValue } from '@/types'
import { cn } from '@/lib/utils'

interface AttributeValuesManagerProps {
  attribute: Attribute
  onClose: () => void
  onUpdate: () => void
}

interface ValueFormData {
  value: string
  displayValue: string
  hexCode?: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
}

export function AttributeValuesManager({
  attribute,
  onClose,
  onUpdate,
}: AttributeValuesManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null)
  const [deletingValue, setDeletingValue] = useState<AttributeValue | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState<ValueFormData>({
    value: '',
    displayValue: '',
    hexCode: '',
    imageUrl: '',
    sortOrder: attribute.values.length,
    isActive: true,
  })

  const handleValueChange = (value: string) => {
    const displayValue = value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    setFormData({ ...formData, value, displayValue })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      const newValue: AttributeValue = {
        id: editingValue?.id || `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        value: formData.value,
        displayValue: formData.displayValue,
        hexCode: formData.hexCode || undefined,
        imageUrl: formData.imageUrl || undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      }

      let updatedValues: AttributeValue[]
      if (editingValue) {
        // Update existing value
        updatedValues = attribute.values.map((v) =>
          v.id === editingValue.id ? newValue : v
        )
      } else {
        // Add new value
        updatedValues = [...attribute.values, newValue]
      }

      await attributeService.updateAttribute(attribute.id, {
        values: updatedValues,
        updatedBy: 'current-user', // TODO: get from auth
      })

      onUpdate()
      setShowDialog(false)
      resetForm()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving value:', error)
      alert('Error al guardar el valor. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (value: AttributeValue) => {
    setEditingValue(value)
    setFormData({
      value: value.value,
      displayValue: value.displayValue,
      hexCode: value.hexCode || '',
      imageUrl: value.imageUrl || '',
      sortOrder: value.sortOrder,
      isActive: value.isActive,
    })
    setShowDialog(true)
  }

  const handleDelete = async () => {
    if (!deletingValue) return

    setIsDeleting(true)
    try {
      const updatedValues = attribute.values.filter(
        (v) => v.id !== deletingValue.id
      )

      await attributeService.updateAttribute(attribute.id, {
        values: updatedValues,
        updatedBy: 'current-user', // TODO: get from auth
      })

      onUpdate()
      setShowDeleteDialog(false)
      setDeletingValue(null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting value:', error)
      alert('Error al eliminar el valor. Por favor intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenDeleteDialog = (value: AttributeValue) => {
    setDeletingValue(value)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setFormData({
      value: '',
      displayValue: '',
      hexCode: '',
      imageUrl: '',
      sortOrder: attribute.values.length,
      isActive: true,
    })
    setEditingValue(null)
  }

  const handleOpenCreateDialog = () => {
    resetForm()
    setShowDialog(true)
  }

  const isLightColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155
  }

  const sortedValues = [...attribute.values].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Gestionar Valores: <span className="text-blue-600">{attribute.name}</span>
            </DialogTitle>
            <DialogDescription>
              Administra los valores disponibles para este atributo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add New Value Button */}
            <Button onClick={handleOpenCreateDialog} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Nuevo Valor
            </Button>

            {/* Values List */}
            {sortedValues.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  No hay valores configurados para este atributo
                </p>
                <Button onClick={handleOpenCreateDialog} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Valor
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedValues.map((value) => (
                  <div
                    key={value.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      value.isActive ? 'bg-white' : 'bg-muted/50 opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Visual Indicator */}
                      {attribute.type === 'color' && value.hexCode ? (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: value.hexCode }}
                          title={value.hexCode}
                        />
                      ) : value.imageUrl ? (
                        <img
                          src={value.imageUrl}
                          alt={value.displayValue}
                          className="w-8 h-8 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {value.displayValue.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Value Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{value.displayValue}</span>
                          <Badge
                            variant={value.isActive ? 'default' : 'secondary'}
                            className={cn(
                              'text-xs',
                              value.isActive && 'bg-green-500 hover:bg-green-600'
                            )}
                          >
                            {value.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="font-mono">{value.value}</span>
                          {value.hexCode && (
                            <>
                              <span>•</span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={
                                  value.hexCode
                                    ? {
                                        backgroundColor: value.hexCode,
                                        color: isLightColor(value.hexCode) ? '#000' : '#fff',
                                        borderColor: value.hexCode,
                                      }
                                    : {}
                                }
                              >
                                {value.hexCode}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(value)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(value)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Value Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingValue ? 'Editar Valor' : 'Agregar Nuevo Valor'}
            </DialogTitle>
            <DialogDescription>
              {editingValue
                ? 'Actualiza la información del valor'
                : 'Completa los datos para agregar un nuevo valor'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (Clave) *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder="Ej: rojo, xl, algodon..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Se usa internamente. Minúsculas sin espacios.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayValue">Nombre para Mostrar *</Label>
              <Input
                id="displayValue"
                value={formData.displayValue}
                onChange={(e) =>
                  setFormData({ ...formData, displayValue: e.target.value })
                }
                placeholder="Rojo, XL, Algodón..."
                required
              />
            </div>

            {attribute.type === 'color' && (
              <div className="space-y-2">
                <Label htmlFor="hexCode" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Código de Color (Hex)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hexCode"
                    value={formData.hexCode}
                    onChange={(e) =>
                      setFormData({ ...formData, hexCode: e.target.value })
                    }
                    placeholder="#FF0000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  {formData.hexCode && (
                    <div
                      className="w-12 h-10 rounded border-2"
                      style={{ backgroundColor: formData.hexCode }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de Imagen (Opcional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://ejemplo.com/imagen.png"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Valor activo</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Guardando...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingValue ? 'Actualizar' : 'Agregar'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente el valor{' '}
              <strong className="text-foreground">"{deletingValue?.displayValue}"</strong>.
              Los productos que usan este valor podrían verse afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar valor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

