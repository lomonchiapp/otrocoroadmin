import React from 'react'
import { InlineAttributeManager } from '../inline-attribute-manager'
import type { Attribute } from '@/types'

interface AttributesStepProps {
  selectedAttributes: Map<string, string[]>
  onAttributeToggle: (attributeId: string, valueId: string) => void
  onAttributesChange: (attributes: Attribute[]) => void
}

export const AttributesStep: React.FC<AttributesStepProps> = ({
  selectedAttributes,
  onAttributeToggle,
  onAttributesChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Atributos y Variaciones</h3>
          <p className="text-sm text-slate-600">Configura colores, tallas y otras opciones del producto</p>
          <p className="text-xs text-slate-500 mt-1">
            Puedes usar atributos existentes o crear nuevos. Las variaciones se generan automáticamente.
          </p>
        </div>
      </div>

      <InlineAttributeManager
        selectedAttributes={selectedAttributes}
        onAttributeToggle={onAttributeToggle}
        onAttributesChange={onAttributesChange}
      />
    </div>
  )
}
