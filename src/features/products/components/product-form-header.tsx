import React from 'react'
import { Button } from '@/components/ui/button'
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { X, Plus, Edit } from 'lucide-react'

interface ProductFormHeaderProps {
  onClose: () => void
  totalSteps: number
  mode?: 'create' | 'edit'
  children?: React.ReactNode
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  onClose,
  totalSteps,
  mode = 'create',
  children,
}) => {
  const isEdit = mode === 'edit'

  return (
    <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
          isEdit 
            ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}>
          {isEdit ? <Edit className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
        </div>
        <div className="flex-1">
          <SheetTitle className="text-2xl font-bold">
            {isEdit ? 'Editar Producto' : 'Agregar Producto Profesional'}
          </SheetTitle>
          <SheetDescription className="text-base">
            {isEdit 
              ? `Actualiza la información del producto en ${totalSteps} pasos` 
              : `Crea un producto completo en ${totalSteps} pasos con todas las características avanzadas`
            }
          </SheetDescription>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </SheetHeader>
  )
}

