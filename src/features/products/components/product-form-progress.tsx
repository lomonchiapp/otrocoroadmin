import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2 } from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string
}

interface ProductFormProgressProps {
  currentStep: number
  totalSteps: number
  progress: number
  steps: Step[]
}

export const ProductFormProgress: React.FC<ProductFormProgressProps> = ({
  currentStep,
  totalSteps,
  progress,
  steps,
}) => {
  return (
    <div className="px-6 py-4 bg-slate-50 border-b">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Paso {currentStep + 1} de {totalSteps}
          </Badge>
          <span className="font-semibold text-slate-900">
            {steps[currentStep]?.title}
          </span>
        </div>
        <div className="text-sm text-slate-500">
          {Math.round(progress)}% completado
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-3" />

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 min-w-0">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${isCompleted
                  ? 'bg-green-500 text-white shadow-md'
                  : isCurrent
                  ? 'bg-blue-500 text-white ring-2 ring-blue-200 shadow-lg'
                  : 'bg-slate-200 text-slate-500'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs text-center leading-tight px-1 ${
                isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'
              }`}>
                {step.title.split(' ')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

