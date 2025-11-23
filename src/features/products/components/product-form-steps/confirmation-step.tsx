import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2 } from 'lucide-react'
import type { Category, Brand, ProductVariation } from '@/types'

interface ConfirmationStepProps {
  form: UseFormReturn<any>
  categories: Category[]
  subcategories: Category[]
  brands: Brand[]
  images: string[]
  variations: ProductVariation[]
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  form,
  categories,
  subcategories,
  brands,
  images,
  variations,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Confirmación</h3>
          <p className="text-sm text-slate-600">Revisa la información y crea el producto</p>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Información básica</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Nombre:</span>
                  <span className="font-medium text-slate-900">{form.getValues('name')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Precio:</span>
                  <span className="font-medium text-green-600">${form.getValues('price')?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Categoría:</span>
                  <span className="font-medium text-purple-600">
                    {categories.find(c => c.id === form.getValues('categoryId'))?.name}
                  </span>
                </div>
                {form.getValues('subcategoryId') && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subcategoría:</span>
                    <span className="font-medium text-purple-500">
                      {subcategories.find((s: Category) => s.id === form.getValues('subcategoryId'))?.name}
                    </span>
                  </div>
                )}
                {form.getValues('brandId') && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Marca:</span>
                    <span className="font-medium text-slate-700">
                      {brands.find(b => b.id === form.getValues('brandId'))?.name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Imágenes</h4>
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={image} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {images.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Sin imágenes</p>
              )}
            </CardContent>
          </Card>

          {variations.length > 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Variaciones ({variations.length})
                </h4>
                <div className="space-y-2">
                  {variations.slice(0, 5).map((variation, index) => (
                    <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700">
                        {variation.attributes.map(a => a.values[0].displayValue).join(' / ')}
                      </span>
                      <span className="font-medium text-slate-900">${variation.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {variations.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      ... y {variations.length - 5} variaciones más
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Listo para crear</p>
                <p className="text-xs text-emerald-700 mt-1">
                  El producto se creará como borrador. Podrás editarlo y activarlo después.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

