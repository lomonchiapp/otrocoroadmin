import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Plus, X, FileText, AlertCircle, Loader2, Package, Zap, Tag, DollarSign } from 'lucide-react'
import { useCurrentStore } from '@/stores/store-store'
import { productService } from '@/services/productService'
import { showToast } from '@/lib/show-submitted-data'
import { InlineCategoryManager } from './inline-category-manager'
import type { Product, Category, Brand } from '@/types'

// Schema para bulk add
const bulkProductSchema = z.object({
  products: z.array(z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().min(1, 'La descripción es requerida'),
    price: z.number().min(0, 'El precio debe ser positivo'),
    categoryId: z.string().min(1, 'Selecciona una categoría'),
    subcategoryId: z.string().optional(),
    brandId: z.string().optional(),
  })).min(1, 'Debes agregar al menos un producto')
})

type BulkProductFormData = z.infer<typeof bulkProductSchema>

interface BulkAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsCreated?: (products: Product[]) => void
}

export const BulkAddProductDialog: React.FC<BulkAddProductDialogProps> = ({
  open,
  onOpenChange,
  onProductsCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Array<{
    id: string
    name: string
    description: string
    price: number
    categoryId: string
    subcategoryId: string
    brandId: string
  }>>([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    subcategoryId: '',
    brandId: '',
  })
  const { store: currentStore, type: storeType } = useCurrentStore()

  const form = useForm<BulkProductFormData>({
    resolver: zodResolver(bulkProductSchema),
    defaultValues: {
      products: []
    }
  })

  // Cargar datos iniciales
  React.useEffect(() => {
    if (open && currentStore) {
      loadFormData()
    } else if (!open) {
      setProducts([])
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        subcategoryId: '',
        brandId: '',
      })
    }
  }, [open, currentStore])

  const loadFormData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        productService.getCategoriesByStore(currentStore.id),
        productService.getBrands(),
      ])
      setCategories(categoriesData)
      setBrands(brandsData)
    } catch (error) {
      console.error('Error loading form data:', error)
      showToast({
        title: 'Error',
        message: 'Error al cargar los datos del formulario',
        type: 'error'
      })
    }
  }

  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.description.trim() || !newProduct.categoryId) {
      showToast({
        title: 'Error',
        message: 'Completa los campos requeridos (nombre, descripción y categoría)',
        type: 'error'
      })
      return
    }

    const product = {
      id: Date.now().toString(),
      ...newProduct,
      price: newProduct.price || 0
    }

    setProducts(prev => [...prev, product])
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      subcategoryId: '',
      brandId: '',
    })

    showToast({
      title: 'Producto agregado',
      message: 'El producto ha sido agregado a la lista',
      type: 'success'
    })
  }

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleSubmit = async (data: BulkProductFormData) => {
    if (!currentStore || products.length === 0) return

    setIsSubmitting(true)
    try {
      const createdProducts: Product[] = []

      for (const productData of products) {
        const slug = productData.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim()

        const productPayload = {
          name: productData.name,
          slug,
          description: productData.description,
          shortDescription: productData.description.substring(0, 150),
          type: storeType === 'fashion' ? 'clothing' : storeType || 'clothing',
          storeId: currentStore.id,
          categoryId: productData.categoryId,
          subcategoryId: productData.subcategoryId || undefined,
          brandId: productData.brandId || undefined,
          tags: [],
          status: 'draft' as const,
          isFeatured: false,
          seoTitle: productData.name,
          seoDescription: productData.description.substring(0, 160),
          basePrice: productData.price,
          compareAtPrice: 0,
          variations: [],
          attributes: [],
          metafields: [],
          images: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const createdProduct = await productService.createProduct(productPayload)
        createdProducts.push(createdProduct)
      }

      if (onProductsCreated) {
        onProductsCreated(createdProducts)
      }

      showToast({
        title: 'Productos creados',
        message: `${createdProducts.length} productos han sido creados exitosamente`,
        type: 'success'
      })

      onOpenChange(false)
      setProducts([])
    } catch (error) {
      console.error('Error creating products:', error)
      showToast({
        title: 'Error',
        message: 'Error al crear los productos',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = products.length > 0 ? (products.length / 10) * 100 : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[800px] lg:max-w-[1000px] overflow-y-auto p-0">
        <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <SheetTitle className="text-xl">Agregar Productos en Lote</SheetTitle>
                <SheetDescription>
                  Crea múltiples productos de forma rápida y eficiente
                </SheetDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {products.length} productos agregados
              </span>
              <span className="font-medium">
                {progress.toFixed(0)}% capacidad
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 flex-1 overflow-y-auto">
              {/* Agregar nuevo producto */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="w-4 h-4" />
                    Agregar Producto
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Completa los datos del nuevo producto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Nombre *
                    </Label>
                    <Input
                      placeholder="Ej: Camiseta básica"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="h-9 mt-1.5"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Precio *
                    </Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="h-9 pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Descripción *</Label>
                    <Textarea
                      placeholder="Describe las características principales..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[70px] resize-none text-sm mt-1.5"
                    />
                  </div>

                  <InlineCategoryManager
                    selectedCategoryId={newProduct.categoryId}
                    selectedSubcategoryId={newProduct.subcategoryId}
                    onCategorySelect={(categoryId) => {
                      setNewProduct(prev => ({ ...prev, categoryId, subcategoryId: '' }))
                    }}
                    onSubcategorySelect={(subcategoryId) => {
                      setNewProduct(prev => ({ ...prev, subcategoryId }))
                    }}
                    onCategoriesChange={(updatedCategories) => {
                      setCategories(updatedCategories)
                    }}
                  />

                  <div>
                    <Label className="text-xs font-medium">Marca (opcional)</Label>
                    <Select
                      value={newProduct.brandId}
                      onValueChange={(value) => setNewProduct(prev => ({ ...prev, brandId: value }))}
                    >
                      <SelectTrigger className="h-9 mt-1.5">
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {brand.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    onClick={addProduct}
                    className="w-full h-9 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Agregar a la Lista
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de productos agregados */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4" />
                    Productos en Lista ({products.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Productos listos para crear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                    {products.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-700 mb-1">No hay productos agregados</p>
                        <p className="text-sm text-slate-500">Agrega productos usando el formulario de la izquierda</p>
                      </div>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="border rounded-lg p-2.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 transition-all duration-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs text-slate-900 truncate">{product.name}</h4>
                              <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-green-50 text-green-700 border-green-200">
                                  ${product.price.toLocaleString()}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-blue-50 text-blue-700">
                                  {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                                </Badge>
                                {product.subcategoryId && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-purple-50 text-purple-700 border-purple-200">
                                    {categories.find(c => c.id === product.categoryId)?.subcategories?.find(s => s.id === product.subcategoryId)?.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(product.id)}
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer con acciones */}
            <div className="sticky bottom-0 bg-background border-t px-6 py-4 mt-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Los productos se crearán como borradores</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none h-9"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || products.length === 0}
                    className="flex-1 sm:flex-none h-9 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 mr-1.5" />
                        Crear {products.length}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
