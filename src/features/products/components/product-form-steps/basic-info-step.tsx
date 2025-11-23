import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'

interface BasicInfoStepProps {
  form: UseFormReturn<any>
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
          <p className="text-sm text-slate-600">Ingresa el nombre y descripción del producto</p>
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Nombre del producto *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Camiseta básica blanca"
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">Descripción *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe las características principales del producto..."
                  className="min-h-[120px] resize-none border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Tip profesional</p>
              <p className="text-xs text-blue-700 mt-1">
                Una buena descripción debe incluir materiales, características principales y beneficios del producto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

