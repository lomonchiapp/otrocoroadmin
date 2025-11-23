import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { JewelryService } from '@/services/jewelryService'
import type { 
  GoldColor, 
  JewelryType, 
  JewelryWeave, 
  JewelryThickness, 
  JewelryKarat, 
  JewelryLength,
  JewelryVariation
} from '@/types/jewelry'
import { 
  GOLD_COLORS,
  JEWELRY_TYPES,
  JEWELRY_WEAVES,
  JEWELRY_THICKNESS,
  JEWELRY_KARATS,
  JEWELRY_LENGTHS
} from '@/types/jewelry'

// Schema específico para joyería
const jewelryProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  goldColor: z.enum(['white', 'yellow', 'rose']),
  jewelryType: z.enum(['chain', 'bracelet', 'earrings', 'rings', 'medals']),
  karat: z.enum(['10k', '14k', '18k', '21k', '24k']),
  weave: z.enum(['cuban', 'figaro', 'mariner', 'lunar', 'franco', 'box', 'monaco']).optional(),
  thickness: z.enum(['0.5-1mm', '1.5-2mm', '2.5-3mm', '3.5-4mm', '4.5-5mm', '5-6mm', '7-8mm', '9-12+mm']).optional(),
  length: z.enum(['18in', '20in', '22in', '24in', '26in', '28in', '30in', 'up-to-6.5in-baby', 'up-to-8.5in-adult', 'anklet']).optional(),
  basePrice: z.number().min(0, 'El precio debe ser positivo'),
  weight: z.number().min(0, 'El peso debe ser positivo').optional(),
})

type JewelryProductFormData = z.infer<typeof jewelryProductSchema>

interface JewelryProductFormProps {
  onSubmit: (data: JewelryProductFormData & { variations: JewelryVariation[] }) => void
  initialData?: Partial<JewelryProductFormData>
  isLoading?: boolean
}

export const JewelryProductForm: React.FC<JewelryProductFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const [variations, setVariations] = useState<JewelryVariation[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<{
    goldColor?: GoldColor
    jewelryType?: JewelryType
    weave?: JewelryWeave
    thickness?: JewelryThickness
    karat?: JewelryKarat
    length?: JewelryLength
  }>({})

  const form = useForm<JewelryProductFormData>({
    resolver: zodResolver(jewelryProductSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      goldColor: initialData?.goldColor || 'yellow',
      jewelryType: initialData?.jewelryType || 'chain',
      karat: initialData?.karat || '14k',
      weave: initialData?.weave,
      thickness: initialData?.thickness,
      length: initialData?.length,
      basePrice: initialData?.basePrice || 0,
      weight: initialData?.weight,
    }
  })

  const watchedJewelryType = form.watch('jewelryType')
  const watchedGoldColor = form.watch('goldColor')
  const watchedKarat = form.watch('karat')
  const watchedWeave = form.watch('weave')
  const watchedThickness = form.watch('thickness')
  const watchedLength = form.watch('length')

  // Actualizar atributos seleccionados cuando cambien los valores del formulario
  useEffect(() => {
    setSelectedAttributes({
      goldColor: watchedGoldColor,
      jewelryType: watchedJewelryType,
      weave: watchedWeave,
      thickness: watchedThickness,
      karat: watchedKarat,
      length: watchedLength
    })
  }, [watchedGoldColor, watchedJewelryType, watchedWeave, watchedThickness, watchedKarat, watchedLength])

  // Generar variación automáticamente cuando cambien los atributos
  useEffect(() => {
    if (selectedAttributes.goldColor && selectedAttributes.jewelryType && selectedAttributes.karat) {
      try {
        const variation = JewelryService.createJewelryVariation(
          selectedAttributes.goldColor,
          selectedAttributes.jewelryType,
          selectedAttributes.karat,
          selectedAttributes.weave,
          selectedAttributes.thickness,
          selectedAttributes.length
        )
        setVariations([variation])
        
        // Actualizar el precio en el formulario
        form.setValue('basePrice', variation.price)
      } catch (error) {
        console.error('Error generando variación:', error)
        setVariations([])
      }
    }
  }, [selectedAttributes, form])

  // Obtener longitudes válidas para el tipo de joyería seleccionado
  const getValidLengths = (jewelryType: JewelryType) => {
    return JEWELRY_LENGTHS.filter(length => {
      if (jewelryType === 'chain') {
        return length.applicableTo.includes('chain')
      } else if (jewelryType === 'bracelet') {
        return length.applicableTo.includes('bracelet')
      }
      return false
    })
  }

  const handleSubmit = (data: JewelryProductFormData) => {
    onSubmit({
      ...data,
      variations
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            Información Básica de la Joya
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Joya</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Cadena de Oro Amarillo 14K" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (gramos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ej: 15.5" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe la joya, sus características especiales, acabados, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="goldColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color del Oro</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el color del oro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GOLD_COLORS.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300" 
                                  style={{ backgroundColor: color.hex }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jewelryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Joya</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de joya" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JEWELRY_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <span>{type.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="karat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilataje</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el kilataje" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JEWELRY_KARATS.map((karat) => (
                            <SelectItem key={karat.id} value={karat.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{karat.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {(karat.purity * 100).toFixed(1)}% pureza
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(watchedJewelryType === 'chain' || watchedJewelryType === 'bracelet') && (
                  <FormField
                    control={form.control}
                    name="weave"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tejido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tejido" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {JEWELRY_WEAVES.map((weave) => (
                              <SelectItem key={weave.id} value={weave.id}>
                                {weave.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="thickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grosor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el grosor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JEWELRY_THICKNESS.map((thickness) => (
                            <SelectItem key={thickness.id} value={thickness.id}>
                              {thickness.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(watchedJewelryType === 'chain' || watchedJewelryType === 'bracelet') && (
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la longitud" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getValidLengths(watchedJewelryType).map((length) => (
                              <SelectItem key={length.id} value={length.id}>
                                {length.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Base (COP)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {variations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Variación Generada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">SKU:</span>
                        <Badge variant="outline">{variations[0].sku}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Precio:</span>
                        <span className="text-lg font-bold text-green-600">
                          ${variations[0].price.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                      {variations[0].compareAtPrice && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Precio de Comparación:</span>
                          <span className="text-sm text-gray-500 line-through">
                            ${variations[0].compareAtPrice.toLocaleString('es-CO')} COP
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Joya'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
