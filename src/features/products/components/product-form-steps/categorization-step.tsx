import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Package } from 'lucide-react'
import { InlineCategoryManager } from '../inline-category-manager'
import { InlineBrandCreator } from '../inline-brand-creator'
import type { Category, Brand } from '@/types'

interface CategorizationStepProps {
  form: UseFormReturn<any>
  categories: Category[]
  brands: Brand[]
  onCategoriesChange: (categories: Category[]) => void
}

export const CategorizationStep: React.FC<CategorizationStepProps> = ({
  form,
  categories,
  brands,
  onCategoriesChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Categorización y Marca</h3>
          <p className="text-sm text-slate-600">Organiza el producto y selecciona la marca</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Categorías */}
        <div>
          <InlineCategoryManager
            selectedCategoryId={form.watch('categoryId')}
            selectedSubcategoryId={form.watch('subcategoryId')}
            onCategorySelect={(categoryId) => {
              form.setValue('categoryId', categoryId)
              form.setValue('subcategoryId', '')
            }}
            onSubcategorySelect={(subcategoryId) => {
              form.setValue('subcategoryId', subcategoryId)
            }}
            onCategoriesChange={onCategoriesChange}
            showCreateButtons={true}
            allowSubcategoryCreation={true}
          />
        </div>

        <Separator />

        {/* Marcas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Marca del producto
          </Label>

          <InlineBrandCreator
            selectedBrandId={form.watch('brandId')}
            onBrandSelect={(brandId: string) => form.setValue('brandId', brandId)}
            onBrandCreated={(newBrand: Brand) => {
              // La lógica de actualización se maneja en el componente padre
            }}
          />

          <p className="text-xs text-slate-500">
            Si la marca no existe, puedes crearla directamente desde aquí
          </p>
        </div>
      </div>
    </div>
  )
}

