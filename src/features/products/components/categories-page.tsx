import { useState, useMemo } from 'react'
import { Plus, FolderTree, Edit, Trash2, MoreHorizontal, Search as SearchIcon, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImageUploader } from '@/components/organisms'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCurrentStore } from '@/stores/store-store'
import { useCategories } from '@/hooks/use-categories'
import type { Category, ProductType } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryFormData {
  name: string
  slug: string
  description: string
  image?: string
  imagePath?: string // Path en Firebase Storage
  parentId?: string
  productType: ProductType
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  sortOrder: number
}

export function CategoriesPage() {
  const { store: currentStore } = useCurrentStore()
  const {
    categories,
    categoryTree,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategories(currentStore?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    productType: 'clothing' as ProductType,
    isActive: true,
    sortOrder: 0,
  })

  // Generar slug automáticamente del nombre
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, name, slug })
  }

  // Manejar cambio de imagen
  const handleImageChange = (imageUrl: string, storagePath: string) => {
    setFormData({ ...formData, image: imageUrl, imagePath: storagePath })
  }

  // Remover imagen
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: undefined, imagePath: undefined })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentStore?.id) return

    const categoryData = {
      ...formData,
      storeId: currentStore.id,
      level: formData.parentId ? 1 : 0, // Simplificado, se puede calcular mejor
    }

    if (editingCategory) {
      updateCategory(
        { categoryId: editingCategory.id, updates: categoryData },
        {
          onSuccess: () => {
            setShowDialog(false)
            resetForm()
          },
        }
      )
    } else {
      createCategory(categoryData, {
        onSuccess: () => {
          setShowDialog(false)
          resetForm()
        },
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      productType: 'clothing' as ProductType,
      isActive: true,
      sortOrder: 0,
    })
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image,
      imagePath: (category as any).imagePath, // Storage path si existe
      parentId: category.parentId,
      productType: category.productType,
      isActive: category.isActive,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      sortOrder: category.sortOrder,
    })
    setShowDialog(true)
  }

  const handleNewCategory = () => {
    resetForm()
    setShowDialog(true)
  }

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id, {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setDeletingCategory(null)
        },
      })
    }
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Filtrar categorías por búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    
    const query = searchQuery.toLowerCase()
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  // Renderizar árbol de categorías
  const renderCategoryTree = (items: (Category & { children?: Category[] })[], level = 0) => {
    return items.map((category) => {
      const hasChildren = category.children && category.children.length > 0
      const isExpanded = expandedCategories.has(category.id)
      const shouldShow = !searchQuery || filteredCategories.some(c => c.id === category.id)

      if (!shouldShow) return null

      return (
        <div key={category.id} className={cn('border-l-2 border-muted', level > 0 && 'ml-6')}>
          <div
            className={cn(
              'flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-r-lg group',
              level === 0 && 'bg-card'
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Botón expandir/contraer */}
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="p-1 hover:bg-muted rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}

              {/* Icono de carpeta */}
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                level === 0 ? 'bg-primary/10' : 'bg-muted'
              )}>
                <FolderTree className={cn(
                  'w-5 h-5',
                  level === 0 ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>

              {/* Información de categoría */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  {!category.isActive && (
                    <Badge variant="secondary">Inactiva</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {category.productType === 'clothing' ? 'Ropa' : 'Joyería'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{category.slug}</span>
                  {category.productCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {category.productCount} producto{category.productCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Badges de nivel */}
              {level > 0 && (
                <Badge variant="outline" className="text-xs">
                  Nivel {level + 1}
                </Badge>
              )}
            </div>

            {/* Acciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setFormData({ ...formData, parentId: category.id })
                    setShowDialog(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar subcategoría
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleDeleteClick(category)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Renderizar hijos si está expandido */}
          {hasChildren && isExpanded && (
            <div className="ml-6">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  if (!currentStore) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Selecciona una tienda
          </h2>
          <p className="text-muted-foreground">
            Para gestionar categorías, primero debes seleccionar una tienda en el encabezado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <FolderTree className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Categorías</h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200">
                  {currentStore.name}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              Organiza tus productos en categorías jerárquicas
            </p>
          </div>

          <Button onClick={handleNewCategory} className="bg-gradient-to-r from-green-600 to-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorías por nombre, slug o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Categorías</div>
            <div className="text-2xl font-bold">{categories.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Categorías Raíz</div>
            <div className="text-2xl font-bold">
              {categories.filter(c => !c.parentId).length}
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Activas</div>
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Con Productos</div>
            <div className="text-2xl font-bold">
              {categories.filter(c => c.productCount > 0).length}
            </div>
          </div>
        </div>
      </div>

      {/* Árbol de categorías */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Cargando categorías...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <FolderTree className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No hay categorías</h3>
            <p className="text-muted-foreground text-sm">
              Crea tu primera categoría para comenzar a organizar tus productos
            </p>
            <Button onClick={handleNewCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Categoría
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {renderCategoryTree(categoryTree)}
          </div>
        )}
      </div>

      {/* Dialog de creación/edición */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Modifica los detalles de la categoría'
                : 'Completa los detalles para crear una nueva categoría'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="font-semibold">Información Básica</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Camisetas"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ej-camisetas"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la categoría..."
                  rows={3}
                />
              </div>

              {/* Imagen de portada */}
              <div className="space-y-2">
                <Label>Imagen de Portada</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Tamaño recomendado: 800x600px • Las imágenes se optimizan automáticamente
                </p>
                {currentStore && (
                  <ImageUploader
                    value={formData.image}
                    onChange={handleImageChange}
                    onRemove={handleRemoveImage}
                    storagePath={`categories/${currentStore.id}/${editingCategory?.id || 'temp'}`}
                    aspectRatio="video"
                    placeholder="Subir imagen de categoría"
                    maxSizeKB={800}
                    showClipboardHint={true}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de Producto *</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value as ProductType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clothing">Ropa</SelectItem>
                      <SelectItem value="jewelry">Joyería</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentId">Categoría Padre</Label>
                  <Select
                    value={formData.parentId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguna (categoría raíz)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna (categoría raíz)</SelectItem>
                      {categories
                        .filter(c => c.id !== editingCategory?.id && !c.parentId)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Estado</Label>
                  <div className="text-sm text-muted-foreground">
                    Las categorías inactivas no se muestran en el frontend
                  </div>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">SEO (Opcional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Título SEO</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Título para motores de búsqueda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Descripción SEO</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription || ''}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Descripción para motores de búsqueda"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? 'Guardando...'
                  : editingCategory
                    ? 'Actualizar'
                    : 'Crear Categoría'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Estás a punto de eliminar la categoría{' '}
                <span className="font-semibold text-foreground">"{deletingCategory?.name}"</span>.
              </p>
              <p className="text-sm">
                Esta acción no se puede deshacer. La categoría solo se eliminará si:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>No tiene productos asociados</li>
                <li>No tiene subcategorías</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}








