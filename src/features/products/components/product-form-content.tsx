import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { BasicInfoStep } from './product-form-steps/basic-info-step'
import { CategorizationStep } from './product-form-steps/categorization-step'
import { PricingStep } from './product-form-steps/pricing-step'
import { ImagesStep } from './product-form-steps/images-step'
import { AttributesStep } from './product-form-steps/attributes-step'
import { ConfirmationStep } from './product-form-steps/confirmation-step'
import type { Category, Brand, ProductVariation, Attribute } from '@/types'

interface ProductFormData {
  name: string
  description: string
  price: number
  categoryId: string
  subcategoryId?: string
  brandId?: string
  type?: 'clothing' | 'jewelry'
}

interface ProductFormContentProps {
  currentStep: number
  form: UseFormReturn<ProductFormData>
  categories: Category[]
  subcategories: Category[]
  brands: Brand[]
  images: string[]
  selectedAttributes: Map<string, string[]>
  variations: ProductVariation[]
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
  onAttributeToggle: (attributeId: string, valueId: string) => void
  onCategoriesChange: (categories: Category[]) => void
  onAttributesChange: (attributes: Attribute[]) => void
}

export const ProductFormContent: React.FC<ProductFormContentProps> = ({
  currentStep,
  form,
  categories,
  subcategories,
  brands,
  images,
  selectedAttributes,
  variations,
  onImageUpload,
  onRemoveImage,
  onAttributeToggle,
  onCategoriesChange,
  onAttributesChange,
}) => {
  switch (currentStep) {
    case 0:
      return <BasicInfoStep form={form} />

    case 1:
      return (
        <CategorizationStep
          form={form}
          categories={categories}
          brands={brands}
          onCategoriesChange={onCategoriesChange}
        />
      )

    case 2:
      return <PricingStep form={form} />

    case 3:
      return (
        <ImagesStep
          images={images}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
        />
      )

    case 4:
      return (
        <AttributesStep
          selectedAttributes={selectedAttributes}
          onAttributeToggle={onAttributeToggle}
          onAttributesChange={onAttributesChange}
        />
      )

    case 5:
      return (
        <ConfirmationStep
          form={form}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          images={images}
          variations={variations}
        />
      )

    default:
      return null
  }
}

