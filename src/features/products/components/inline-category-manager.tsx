import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  FolderPlus, 
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Folder
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useCurrentStore } from '@/stores/store-store'
import type { Category } from '@/types'

// Tipo extendido con subcategorías para uso interno
interface CategoryWithSubs extends Category {
  subcategories?: CategoryWithSubs[]
}

interface InlineCategoryManagerProps {
  selectedCategoryId?: string
  selectedSubcategoryId?: string
  onCategorySelect: (categoryId: string) => void
  onSubcategorySelect: (subcategoryId: string) => void
  onCategoriesChange: (categories: Category[]) => void
  showCreateButtons?: boolean
  allowSubcategoryCreation?: boolean
}

export const InlineCategoryManager: React.FC<InlineCategoryManagerProps> = ({
  selectedCategoryId,
  selectedSubcategoryId,
  onCategorySelect,
  onSubcategorySelect,
  onCategoriesChange,
  showCreateButtons = true,
  allowSubcategoryCreation = true,
}) => {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [creatingSubcategoryFor, setCreatingSubcategoryFor] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const { store: currentStore } = useCurrentStore()

  const loadCategories = useCallback(async () => {
    if (!currentStore) return
    
    try {
      setLoading(true)
      const categoriesData = await productService.getCategoriesByStore(currentStore.id)
      setCategories(categoriesData as CategoryWithSubs[])
      onCategoriesChange(categoriesData)
    } finally {
      setLoading(false)
    }
  }, [currentStore, onCategoriesChange])

  // Cargar categorías al montar el componente
  React.useEffect(() => {
    if (currentStore) {
      loadCategories()
    }
  }, [currentStore, loadCategories])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !currentStore) return

    try {
      setLoading(true)
      const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-')
      const categoryId = await productService.createCategory({
        name: newCategoryName.trim(),
        slug,
        storeId: currentStore.id,
        level: 1,
        parentId: undefined,
        productType: 'clothing',
        description: '',
        isActive: true,
        sortOrder: categories.length + 1,
        seoTitle: newCategoryName.trim(),
        seoDescription: '',
      })

      const newCategory: CategoryWithSubs = {
        id: categoryId,
        name: newCategoryName.trim(),
        slug,
        storeId: currentStore.id,
        level: 1,
        parentId: undefined,
        productType: 'clothing',
        description: '',
        isActive: true,
        sortOrder: categories.length + 1,
        seoTitle: newCategoryName.trim(),
        seoDescription: '',
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subcategories: []
      }

      const updatedCategories = [...categories, newCategory]
      setCategories(updatedCategories)
      onCategoriesChange(updatedCategories)
      setNewCategoryName('')
      setIsCreatingCategory(false)
    } catch (error) {
      alert(`Error al crear la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubcategory = async (parentId: string) => {
    if (!newSubcategoryName.trim() || !currentStore) return

    try {
      setLoading(true)
      
      // Encontrar el nivel del padre
      const findCategoryLevel = (cats: CategoryWithSubs[], id: string, currentLevel: number = 1): number => {
        for (const cat of cats) {
          if (cat.id === id) return currentLevel
          if (cat.subcategories) {
            const found = findCategoryLevel(cat.subcategories, id, currentLevel + 1)
            if (found > 0) return found
          }
        }
        return 0
      }
      
      const parentLevel = findCategoryLevel(categories, parentId)
      const newLevel = parentLevel + 1
      const slug = newSubcategoryName.trim().toLowerCase().replace(/\s+/g, '-')

      const subcategoryId = await productService.createCategory({
        name: newSubcategoryName.trim(),
        slug,
        storeId: currentStore.id,
        level: newLevel,
        parentId: parentId,
        productType: 'clothing',
        description: '',
        isActive: true,
        sortOrder: 1,
        seoTitle: newSubcategoryName.trim(),
        seoDescription: '',
      })

      const newSubcategory: CategoryWithSubs = {
        id: subcategoryId,
        name: newSubcategoryName.trim(),
        slug,
        storeId: currentStore.id,
        level: newLevel,
        parentId: parentId,
        productType: 'clothing',
        description: '',
        isActive: true,
        sortOrder: 1,
        seoTitle: newSubcategoryName.trim(),
        seoDescription: '',
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subcategories: []
      }

      // Función recursiva para actualizar categorías
      const updateCategoriesRecursively = (cats: CategoryWithSubs[]): CategoryWithSubs[] => {
        return cats.map(cat => {
          if (cat.id === parentId) {
            return { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] }
          }
          if (cat.subcategories && cat.subcategories.length > 0) {
            return { ...cat, subcategories: updateCategoriesRecursively(cat.subcategories) }
          }
          return cat
        })
      }

      const updatedCategories = updateCategoriesRecursively(categories)
      setCategories(updatedCategories)
      onCategoriesChange(updatedCategories)
      setNewSubcategoryName('')
      setCreatingSubcategoryFor(null)
    } catch (error) {
      alert(`Error al crear la subcategoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (categoryId: string, newName: string, _level: number) => {
    if (!newName.trim()) return

    try {
      setLoading(true)
      await productService.updateCategory(categoryId, {
        name: newName.trim(),
        updatedAt: new Date(),
      })

      // Función recursiva para actualizar el nombre
      const updateNameRecursively = (cats: CategoryWithSubs[]): CategoryWithSubs[] => {
        return cats.map(cat => {
          if (cat.id === categoryId) {
            return { ...cat, name: newName.trim() }
          }
          if (cat.subcategories && cat.subcategories.length > 0) {
            return { ...cat, subcategories: updateNameRecursively(cat.subcategories) }
          }
          return cat
        })
      }

      const updatedCategories = updateNameRecursively(categories)
      setCategories(updatedCategories)
      onCategoriesChange(updatedCategories)
      setEditingCategory(null)
      setNewCategoryName('')
    } catch (error) {
      alert(`Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return

    try {
      setLoading(true)
      await productService.deleteCategory(categoryId)

      // Función recursiva para eliminar
      const deleteRecursively = (cats: CategoryWithSubs[]): CategoryWithSubs[] => {
        return cats
          .filter(cat => cat.id !== categoryId)
          .map(cat => {
            if (cat.subcategories && cat.subcategories.length > 0) {
              return { ...cat, subcategories: deleteRecursively(cat.subcategories) }
            }
            return cat
          })
      }

      const updatedCategories = deleteRecursively(categories)
      setCategories(updatedCategories)
      onCategoriesChange(updatedCategories)
    } catch (error) {
      alert(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  // Función recursiva para renderizar categorías con sus subcategorías
  const renderCategoryItem = (category: CategoryWithSubs, level: number = 0): React.ReactNode => {
    const isSelected = level === 0 
      ? selectedCategoryId === category.id
      : selectedSubcategoryId === category.id
    const isExpanded = expandedCategories.has(category.id)
    const isEditing = editingCategory === category.id
    const isCreatingSub = creatingSubcategoryFor === category.id
    const hasSubcategories = category.subcategories && category.subcategories.length > 0
    const indent = level * 16

    return (
      <div key={category.id} className="space-y-2">
        <Card
          style={{ marginLeft: `${indent}px` }}
          className={`cursor-pointer transition-all duration-200 ${
            isSelected
              ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md border-blue-300'
              : 'hover:shadow-md hover:border-slate-300 bg-white border-slate-200'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {/* Botón de expandir/colapsar */}
              {(hasSubcategories || allowSubcategoryCreation) && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCategory(category.id)
                  }}
                  className="h-7 w-7 p-0 hover:bg-slate-100 flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                </Button>
              )}

              {/* Icono de categoría */}
              <div
                onClick={() => !isEditing && (level === 0 ? onCategorySelect(category.id) : onSubcategorySelect(category.id))}
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : level === 0
                    ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                    : 'bg-gradient-to-br from-purple-400 to-purple-500'
                }`}
              >
                <Folder className="w-4 h-4 text-white" />
              </div>

              {/* Contenido de la categoría */}
              <div 
                onClick={() => !isEditing && (level === 0 ? onCategorySelect(category.id) : onSubcategorySelect(category.id))}
                className="flex-1 min-w-0"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 h-8"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditCategory(category.id, newCategoryName, category.level)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCategory(category.id, newCategoryName, category.level)
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingCategory(null)
                        setNewCategoryName('')
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-slate-900 truncate ${level === 0 ? 'text-base' : 'text-sm'}`}>
                      {category.name}
                    </span>
                    {isSelected && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        ✓
                      </Badge>
                    )}
                    {hasSubcategories && !isExpanded && (
                      <Badge variant="outline" className="text-xs">
                        {category.subcategories!.length}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              {!isEditing && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {allowSubcategoryCreation && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCreatingSubcategoryFor(category.id)
                        setNewSubcategoryName('')
                        if (!isExpanded) {
                          toggleCategory(category.id)
                        }
                      }}
                      className="h-7 w-7 p-0 hover:bg-green-50 text-green-600"
                      title="Agregar subcategoría"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCategory(category.id)
                      setNewCategoryName(category.name)
                    }}
                    className="h-7 w-7 p-0 hover:bg-slate-100"
                    title="Editar"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category.id)
                    }}
                    className="h-7 w-7 p-0 hover:bg-red-50 text-red-600"
                    disabled={loading}
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulario para crear subcategoría */}
        {isCreatingSub && isExpanded && (
          <Card 
            style={{ marginLeft: `${indent + 16}px` }}
            className="bg-green-50 border-green-200"
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-green-600 flex-shrink-0" />
                <Input
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="Nueva subcategoría"
                  className="flex-1 h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateSubcategory(category.id)
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleCreateSubcategory(category.id)}
                  disabled={loading || !newSubcategoryName.trim()}
                  className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCreatingSubcategoryFor(null)
                    setNewSubcategoryName('')
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Renderizar subcategorías recursivamente */}
        {isExpanded && hasSubcategories && (
          <div className="space-y-2">
            {category.subcategories!.map((subcategory: CategoryWithSubs) => 
              renderCategoryItem(subcategory, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  if (!currentStore) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-slate-600">Cargando tienda...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-blue-600" />
          Categorías
        </h3>
        {showCreateButtons && (
          <Button
            type="button"
            onClick={() => setIsCreatingCategory(true)}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva
          </Button>
        )}
      </div>

      {/* Crear nueva categoría */}
      {isCreatingCategory && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={loading || !newCategoryName.trim()}
                className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreatingCategory(false)
                  setNewCategoryName('')
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de categorías */}
      <ScrollArea className="h-[450px] pr-4">
        <div className="space-y-2">
          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-slate-600">Cargando categorías...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No hay categorías</p>
              <p className="text-xs text-slate-400">Crea tu primera categoría</p>
            </div>
          ) : (
            categories.map(category => renderCategoryItem(category, 0))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

