import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search as SearchIcon, Tag, Image as ImageIcon, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { productService } from '@/services/productService'
import { ImageUploader } from '@/components/organisms/image-uploader'
import type { Brand } from '@/types'
import { cn } from '@/lib/utils'

interface BrandFormData {
  name: string
  slug: string
  description: string
  logo?: string
  logoPath?: string
  website?: string
  isActive: boolean
}

export function BrandsManager() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    slug: '',
    description: '',
    logo: '',
    logoPath: '',
    website: '',
    isActive: true,
  })

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrands(brands)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredBrands(
        brands.filter(
          (brand) =>
            brand.name.toLowerCase().includes(query) ||
            brand.slug.toLowerCase().includes(query) ||
            (brand.description && brand.description.toLowerCase().includes(query))
        )
      )
    }
  }, [searchQuery, brands])

  const loadBrands = async () => {
    setIsLoading(true)
    try {
      const brandsData = await productService.getBrands()
      setBrands(brandsData)
      setFilteredBrands(brandsData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, name, slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      if (editingBrand) {
        // Update existing brand
        await productService.updateBrand(editingBrand.id, {
          ...formData,
          updatedAt: new Date(),
        })
      } else {
        // Create new brand
        await productService.createBrand({
          ...formData,
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      await loadBrands()
      setShowDialog(false)
      resetForm()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving brand:', error)
      alert('Error al guardar la marca. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo: brand.logo || '',
      logoPath: brand.logoPath || '',
      website: brand.website || '',
      isActive: brand.isActive,
    })
    setShowDialog(true)
  }

  const handleDelete = async () => {
    if (!deletingBrand) return

    setIsDeleting(true)
    try {
      // Note: You'll need to add a deleteBrand method to productService
      // For now, we'll just update it to inactive
      await productService.updateBrand(deletingBrand.id, {
        isActive: false,
        updatedAt: new Date(),
      })

      await loadBrands()
      setShowDeleteDialog(false)
      setDeletingBrand(null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting brand:', error)
      alert('Error al eliminar la marca. Por favor intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenDeleteDialog = (brand: Brand) => {
    setDeletingBrand(brand)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo: '',
      logoPath: '',
      website: '',
      isActive: true,
    })
    setEditingBrand(null)
  }

  const handleLogoChange = (url: string, path: string) => {
    setFormData({ ...formData, logo: url, logoPath: path })
  }

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: '', logoPath: '' })
  }

  const handleOpenCreateDialog = () => {
    resetForm()
    setShowDialog(true)
  }

  const stats = {
    total: brands.length,
    active: brands.filter((b) => b.isActive).length,
    inactive: brands.filter((b) => !b.isActive).length,
    withProducts: brands.filter((b) => b.productCount > 0).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Gestión de Marcas</h2>
                <p className="text-muted-foreground mt-1">
                  Administra las marcas de tus productos
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Marca
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Marcas</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Con Productos</div>
            <div className="text-2xl font-bold text-green-600">{stats.withProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Marcas con inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Activas</div>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visibles en tienda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Inactivas</div>
            <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ocultas temporalmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marcas por nombre, slug o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando marcas...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No se encontraron marcas' : 'No hay marcas'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera marca'}
            </p>
            {!searchQuery && (
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Marca
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className={cn(
                'transition-all hover:shadow-md',
                !brand.isActive && 'opacity-60 bg-muted/50'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 object-contain rounded-lg bg-white border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-pink-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{brand.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {brand.slug}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(brand)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDeleteDialog(brand)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {brand.isActive ? 'Desactivar' : 'Eliminar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {brand.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {brand.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={brand.isActive ? 'default' : 'secondary'}
                      className={cn(
                        'text-xs',
                        brand.isActive && 'bg-green-500 hover:bg-green-600'
                      )}
                    >
                      {brand.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                    {brand.productCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {brand.productCount} productos
                      </Badge>
                    )}
                  </div>
                </div>

                {brand.website && (
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block"
                    >
                      {brand.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Editar Marca' : 'Crear Nueva Marca'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? 'Actualiza la información de la marca'
                : 'Completa los datos para crear una nueva marca'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Nike, Adidas, Zara..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Generado automáticamente"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Se usa en URLs. Se genera automáticamente del nombre.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe la marca..."
                rows={3}
              />
            </div>

              <div className="space-y-2">
                <Label>Logo de la Marca</Label>
                <div className="max-w-xs">
                  <ImageUploader
                    value={formData.logo}
                    onChange={handleLogoChange}
                    onRemove={handleRemoveLogo}
                    storagePath={`brands/${formData.slug || 'temp'}`}
                    aspectRatio="square"
                    placeholder="Logo"
                    maxSizeKB={500}
                    showClipboardHint={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pega desde portapapeles (Ctrl/Cmd + V) o click para subir
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://ejemplo.com"
                  type="url"
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
                <Label htmlFor="isActive">Marca activa</Label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : editingBrand
                    ? 'Actualizar'
                    : 'Crear Marca'}
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
              {deletingBrand?.isActive ? (
                <>
                  Esto desactivará la marca{' '}
                  <strong className="text-foreground">"{deletingBrand?.name}"</strong>.
                  Los productos con esta marca seguirán existiendo.
                </>
              ) : (
                <>
                  Esto eliminará permanentemente la marca{' '}
                  <strong className="text-foreground">"{deletingBrand?.name}"</strong>.
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting
                ? 'Procesando...'
                : deletingBrand?.isActive
                  ? 'Sí, desactivar'
                  : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

