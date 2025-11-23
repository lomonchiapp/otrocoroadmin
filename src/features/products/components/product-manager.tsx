import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Form } from '@/components/ui/form'
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
import { useCurrentStore } from '@/stores/store-store'
import { productService } from '@/services/productService'
import { attributeService } from '@/services/attributeService'
import { storageService } from '@/services/storageService'
import type {
  Brand,
  Category,
  Product,
  Attribute,
  ProductAttribute,
  ProductVariation
} from '@/types'
import { ProductFormHeader } from './product-form-header'
import { ProductFormProgress } from './product-form-progress'
import { ProductFormContent } from './product-form-content'
import { ProductFormNavigation } from './product-form-navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

// Schema completo para el formulario
const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(0, 'El precio debe ser positivo'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  type: z.enum(['clothing', 'jewelry']).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated?: (product: Product) => void
  onProductUpdated?: (product: Product) => void
  onProductDeleted?: (productId: string) => void
  mode?: 'create' | 'edit'
  product?: Product | null
}

const STEPS = [
  { id: 'basic', title: 'Información Básica', description: 'Nombre y descripción del producto' },
  { id: 'category', title: 'Categorización', description: 'Categoría, subcategoría y marca' },
  { id: 'pricing', title: 'Precio', description: 'Define el precio del producto' },
  { id: 'images', title: 'Imágenes', description: 'Agrega fotos del producto' },
  { id: 'attributes', title: 'Atributos y Variaciones', description: 'Configura opciones del producto' },
  { id: 'confirm', title: 'Confirmación', description: 'Revisa y crea el producto' },
]

export const ProductManager: React.FC<ProductManagerProps> = ({
  open,
  onOpenChange,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  mode = 'create',
  product = null,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [images, setImages] = useState<string[]>([])
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [selectedAttributes, setSelectedAttributes] = useState<Map<string, string[]>>(new Map())
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([])
  const [variations, setVariations] = useState<ProductVariation[]>([])
  const { store: currentStore, type: storeType } = useCurrentStore()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      subcategoryId: '',
      brandId: '',
      type: storeType === 'fashion' ? 'clothing' : 'jewelry',
    },
  })

  const loadFormData = React.useCallback(async () => {
    if (!currentStore) return

    try {
      const [categoriesData, brandsData, attributesData] = await Promise.all([
        productService.getCategoriesByStore(currentStore.id),
        productService.getBrands(),
        attributeService.getAttributesByStore(currentStore.id),
      ])
      setCategories(categoriesData)
      setBrands(brandsData)
      setAllAttributes(attributesData)
    } catch (_error) {
      // Error loading form data
    }
  }, [currentStore])

  const loadProductData = React.useCallback(() => {
    if (!product || mode !== 'edit') return

    // Cargar datos del producto en el formulario
    form.reset({
      name: product.name,
      description: product.description,
      price: product.basePrice,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || '',
      brandId: product.brandId || '',
      type: product.type,
    })

    // Cargar imágenes
    setImages(product.images?.map(img => img.url) || [])

    // Cargar atributos seleccionados
    if (product.attributes) {
      const attrMap = new Map<string, string[]>()
      product.attributes.forEach((attr) => {
        attrMap.set(attr.attributeId, attr.valueIds)
      })
      setSelectedAttributes(attrMap)
    }

    // Cargar variaciones
    if (product.variations) {
      setVariations(product.variations)
    }
  }, [product, mode, form])

  const resetForm = React.useCallback(() => {
    setCurrentStep(0)
    form.reset({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      subcategoryId: '',
      brandId: '',
      type: storeType === 'fashion' ? 'clothing' : 'jewelry',
    })
    setSubcategories([])
    setImages([])
    setPendingImageFiles([])
    setSelectedAttributes(new Map())
    setVariations([])
  }, [form, storeType])

  const handleAttributesChange = React.useCallback((updatedAttributes: Attribute[]) => {
    setAllAttributes(updatedAttributes)
  }, [])

  // Cargar datos iniciales
  React.useEffect(() => {
    if (open && currentStore) {
      loadFormData()
      if (mode === 'edit' && product) {
        loadProductData()
      }
    } else if (!open) {
      resetForm()
    }
  }, [open, currentStore, mode, product, loadFormData, loadProductData, resetForm])

  const loadSubcategories = React.useCallback(async (categoryId: string) => {
    try {
      const subcats = categories.filter((cat) => cat.parentId === categoryId)
      setSubcategories(subcats)
    } catch (_error) {
      setSubcategories([])
    }
  }, [categories])

  // Cargar subcategorías cuando cambia la categoría
  const categoryId = form.watch('categoryId')
  React.useEffect(() => {
    if (categoryId && open) {
      loadSubcategories(categoryId)
    } else {
      setSubcategories([])
      form.setValue('subcategoryId', '')
    }
  }, [categoryId, open, loadSubcategories, form])

  const handleNext = async () => {
    let fieldsToValidate: (keyof ProductFormData)[] = []

    switch (currentStep) {
      case 0: fieldsToValidate = ['name', 'description']; break
      case 1: fieldsToValidate = ['categoryId']; break
      case 2: fieldsToValidate = ['price']; break
      case 3:
        if (images.length === 0) {
          const proceed = confirm('¿Deseas continuar sin imágenes? Se recomienda agregar al menos una imagen.')
          if (!proceed) return
        }
        break
      case 4:
        if (selectedAttributes.size > 0) {
          generateVariations()
        }
        break
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate)
      if (!isValid) return
    }

    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const filesArray = Array.from(files)
      
      // Agregar archivos a la cola de subida
      setPendingImageFiles(prev => [...prev, ...filesArray])
      
      // Crear previews locales
      const newImages = filesArray.map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    // Determinar si es una imagen existente o pendiente
    const existingImagesCount = product?.images?.length || 0
    
    if (index >= existingImagesCount) {
      // Es una imagen nueva, remover del pending
      const pendingIndex = index - existingImagesCount
      setPendingImageFiles(prev => prev.filter((_, i) => i !== pendingIndex))
    }
    
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAttributeToggle = (attributeId: string, valueId: string) => {
    setSelectedAttributes(prev => {
      const newMap = new Map(prev)
      const currentValues = newMap.get(attributeId) || []

      if (currentValues.includes(valueId)) {
        const filtered = currentValues.filter(v => v !== valueId)
        if (filtered.length === 0) {
          newMap.delete(attributeId)
        } else {
          newMap.set(attributeId, filtered)
        }
      } else {
        newMap.set(attributeId, [...currentValues, valueId])
      }

      return newMap
    })
  }

  const generateVariations = React.useCallback(() => {
    if (selectedAttributes.size === 0) {
      setVariations([])
      return
    }

    // Obtener solo los atributos que son para variaciones
    const variationAttributes = Array.from(selectedAttributes.entries())
      .map(([attrId, valueIds]) => {
        const attr = allAttributes.find(a => a.id === attrId && a.isVariationAttribute)
        if (!attr) return null
        return { attribute: attr, valueIds }
      })
      .filter(Boolean) as { attribute: Attribute; valueIds: string[] }[]

    if (variationAttributes.length === 0) {
      setVariations([])
      return
    }

    // Generar combinaciones de variaciones
    const combinations: { attrId: string; valueId: string }[][] = [[]]

    for (const { attribute, valueIds } of variationAttributes) {
      const newCombinations: { attrId: string; valueId: string }[][] = []
      for (const combination of combinations) {
        for (const valueId of valueIds) {
          newCombinations.push([...combination, { attrId: attribute.id, valueId }])
        }
      }
      combinations.splice(0, combinations.length, ...newCombinations)
    }

    // Crear variaciones
    const basePrice = form.getValues('price') || 0
    const newVariations: ProductVariation[] = combinations.map((combination, index) => {
      const varAttrs: ProductAttribute[] = combination.map(({ attrId, valueId }) => {
        const attr = allAttributes.find(a => a.id === attrId)!
        const value = attr.values.find(v => v.id === valueId)!
        return {
          attributeId: attrId,
          attribute: attr,
          valueIds: [valueId],
          values: [value],
        }
      })

      const sku = mode === 'edit' && product?.variations?.[index]?.sku 
        ? product.variations[index].sku 
        : `SKU-${Date.now()}-${index}`

      return {
        id: mode === 'edit' && product?.variations?.[index]?.id 
          ? product.variations[index].id 
          : `var_${Date.now()}_${index}`,
        productId: product?.id || '',
        sku,
        attributes: varAttrs,
        price: basePrice,
        compareAtPrice: 0,
        inventoryQuantity: mode === 'edit' && product?.variations?.[index]?.inventoryQuantity 
          ? product.variations[index].inventoryQuantity 
          : 0,
        inventoryPolicy: 'deny' as const,
        images: [],
        isActive: true,
        position: index,
        createdAt: mode === 'edit' && product?.variations?.[index]?.createdAt 
          ? product.variations[index].createdAt 
          : new Date(),
        updatedAt: new Date(),
      }
    })

    setVariations(newVariations)
  }, [selectedAttributes, allAttributes, form, mode, product])

  const handleDelete = async () => {
    if (!product?.id) return

    setIsDeleting(true)
    try {
      await productService.deleteProduct(product.id)
      
      if (onProductDeleted) {
        onProductDeleted(product.id)
      }

      setShowDeleteDialog(false)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      alert('Error al eliminar el producto. Por favor intenta de nuevo.')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (data: ProductFormData) => {
    if (!currentStore) return

    setIsSubmitting(true)
    try {
      const slug = data.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()

      // Subir imágenes nuevas a Firebase Storage si hay archivos pendientes
      let uploadedImageUrls: string[] = []
      
      if (pendingImageFiles.length > 0) {
        setIsUploadingImages(true)
        
        // Usar el ID del producto si estamos editando, o un ID temporal para productos nuevos
        const productId = product?.id || `temp-${Date.now()}`
        const basePath = `products/${currentStore.id}/${productId}`
        
        const results = await storageService.uploadImages(
          pendingImageFiles,
          basePath,
          { maxSizeKB: 800 }
        )
        
        uploadedImageUrls = results.map(r => r.url)
        setIsUploadingImages(false)
      }

      // Combinar imágenes existentes con las nuevas subidas
      const existingImages = product?.images?.map(img => img.url) || []
      const allImageUrls = [
        ...existingImages.filter(url => images.includes(url)), // Imágenes existentes que no fueron eliminadas
        ...uploadedImageUrls // Nuevas imágenes subidas
      ]

      // Preparar atributos del producto
      const productAttributes: ProductAttribute[] = Array.from(selectedAttributes.entries())
        .map(([attrId, valueIds]) => {
          const attr = allAttributes.find(a => a.id === attrId)
          if (!attr) return null
          const values = attr.values.filter(v => valueIds.includes(v.id))
          return {
            attributeId: attrId,
            attribute: attr,
            valueIds,
            values,
          }
        })
        .filter(Boolean) as ProductAttribute[]

      // Preparar imágenes
      const productImages = allImageUrls.map((url, index) => ({
        id: mode === 'edit' && product?.images?.[index]?.id 
          ? product.images[index].id 
          : `img_${Date.now()}_${index}`,
        url,
        alt: `${data.name} - Imagen ${index + 1}`,
        position: index,
        isPrimary: index === 0,
        variantIds: [],
        width: 800,
        height: 600,
        format: 'jpg' as const,
        size: 102400,
      }))

      const productData = {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.description.substring(0, 150),
        type: (data.type || (storeType === 'fashion' ? 'clothing' : 'jewelry')) as 'clothing' | 'jewelry',
        storeId: currentStore.id,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || undefined,
        brandId: data.brandId || undefined,
        tags: product?.tags || [],
        status: product?.status || 'draft' as const,
        isFeatured: product?.isFeatured || false,
        seoTitle: data.name,
        seoDescription: data.description.substring(0, 160),
        basePrice: data.price,
        compareAtPrice: product?.compareAtPrice || 0,
        variations,
        attributes: productAttributes,
        metafields: product?.metafields || [],
        images: productImages,
        createdBy: product?.createdBy || 'admin',
        updatedBy: 'admin',
      }

      if (mode === 'edit' && product?.id) {
        // Actualizar producto existente
        await productService.updateProduct(product.id, productData)
        const updatedProduct = await productService.getProduct(product.id)

        if (updatedProduct && onProductUpdated) {
          onProductUpdated(updatedProduct)
        }
      } else {
        // Crear nuevo producto
        const createdProductId = await productService.createProduct(productData)
        const createdProduct = await productService.getProduct(createdProductId as string)

        if (createdProduct && onProductCreated) {
          onProductCreated(createdProduct)
        }
      }

      onOpenChange(false)
      resetForm()
    } catch (error) {
      alert(`Error al ${mode === 'edit' ? 'actualizar' : 'crear'} el producto. Por favor intenta de nuevo.`)
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[100vw] p-0 overflow-hidden bg-white"
        >
          <div className="flex flex-col h-full">
            <ProductFormHeader
              onClose={() => onOpenChange(false)}
              totalSteps={STEPS.length}
              mode={mode}
            >
              {mode === 'edit' && product && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </ProductFormHeader>

            <ProductFormProgress
              currentStep={currentStep}
              totalSteps={STEPS.length}
              progress={((currentStep + 1) / STEPS.length) * 100}
              steps={STEPS}
            />

            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-8">
                      <ProductFormContent
                        currentStep={currentStep}
                        form={form}
                        categories={categories}
                        subcategories={subcategories}
                        brands={brands}
                        images={images}
                        selectedAttributes={selectedAttributes}
                        variations={variations}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={removeImage}
                        onAttributeToggle={handleAttributeToggle}
                        onCategoriesChange={setCategories}
                        onAttributesChange={handleAttributesChange}
                      />
                    </div>
                  </div>

                  <ProductFormNavigation
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    isSubmitting={isSubmitting}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onClose={() => onOpenChange(false)}
                    onSubmit={() => form.handleSubmit(handleSubmit)()}
                  />
                </form>
              </Form>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
              <strong className="block mt-2 text-foreground">"{product?.name}"</strong>
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar producto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

