import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react'

interface ProductFormNavigationProps {
  currentStep: number
  totalSteps: number
  isSubmitting: boolean
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
  onSubmit: () => Promise<void>
}

export const ProductFormNavigation: React.FC<ProductFormNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onPrevious,
  onNext,
  onClose,
  onSubmit,
}) => {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="border-t bg-slate-50/80 backdrop-blur-sm p-4 sm:p-6 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <Button
          type="button"
          variant="outline"
          onClick={isFirstStep ? onClose : onPrevious}
          disabled={isSubmitting}
          className="h-12 px-6 border-slate-300 hover:bg-slate-50"
        >
          {isFirstStep ? (
            <>
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </>
          )}
        </Button>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="text-sm text-slate-600">
            Paso {currentStep + 1} de {totalSteps}
          </div>
          <div className="w-px h-4 sm:h-8 bg-slate-300 hidden sm:block"></div>
          <div className="text-base sm:text-lg font-semibold text-slate-900 max-w-[200px] truncate">
            {getStepTitle(currentStep, totalSteps)}
          </div>
        </div>

        <div className="flex gap-3">
          {isLastStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12 px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-3" />
                  Crear Producto
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6"
            >
              Siguiente
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Función auxiliar para obtener el título del paso
function getStepTitle(currentStep: number, totalSteps: number): string {
  const stepTitles = [
    'Información Básica',
    'Categorización',
    'Precio',
    'Imágenes',
    'Atributos',
    'Confirmación'
  ]

  return stepTitles[currentStep] || `Paso ${currentStep + 1}`
}

