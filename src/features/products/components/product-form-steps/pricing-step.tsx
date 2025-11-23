import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CheckCircle2 } from 'lucide-react'

interface PricingStepProps {
  form: UseFormReturn<any>
}

export const PricingStep: React.FC<PricingStepProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Precio del Producto</h3>
          <p className="text-sm text-slate-600">Define el precio base del producto</p>
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Precio base *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-lg">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-12 pl-8 text-lg border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Precio inteligente</p>
              <p className="text-xs text-green-700 mt-1">
                Este será el precio base. Si creas variaciones en el siguiente paso, podrás ajustar el precio para cada una.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

