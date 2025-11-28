import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Store, Package, Palette, Settings, CheckCircle2 } from 'lucide-react'
import { storeService, type CreateStoreData } from '@/services/storeService'
import { toast } from 'sonner'

const storeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  type: z.enum(['fashion', 'jewelry']),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  logo: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido'),
  currency: z.string(),
  timezone: z.string(),
  defaultTaxRate: z.number().min(0).max(100),
})

type StoreFormData = z.infer<typeof storeSchema>

interface StoreSetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (storeId: string) => void
}

const STEPS = [
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Nombre y detalles de la tienda',
    icon: Store,
  },
  {
    id: 'branding',
    title: 'Identidad Visual',
    description: 'Logo y colores',
    icon: Palette,
  },
  {
    id: 'business',
    title: 'Configuración de Negocio',
    description: 'Moneda, impuestos y zona horaria',
    icon: Settings,
  },
  {
    id: 'setup',
    title: 'Configuración Automática',
    description: 'Preparando tu tienda',
    icon: Package,
  },
]

export function StoreSetupWizard({
  open,
  onOpenChange,
  onSuccess,
}: StoreSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: 'fashion',
      description: '',
      logo: '',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      currency: 'DOP',
      timezone: 'America/Santo_Domingo',
      defaultTaxRate: 18,
    },
  })

  const handleNameChange = (value: string) => {
    form.setValue('name', value)
    // Auto-generar slug
    const slug = storeService.generateSlug(value)
    form.setValue('slug', slug)
  }

  const nextStep = async () => {
    const fields = getStepFields(currentStep)
    const isValid = await form.trigger(fields)
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const getStepFields = (step: number): (keyof StoreFormData)[] => {
    switch (step) {
      case 0:
        return ['name', 'slug', 'type', 'description']
      case 1:
        return ['primaryColor', 'secondaryColor']
      case 2:
        return ['currency', 'timezone', 'defaultTaxRate']
      default:
        return []
    }
  }

  const onSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true)
    setCurrentStep(3) // Ir al paso de setup

    try {
      // Simular progreso
      setSetupProgress(20)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSetupProgress(40)
      const storeId = await storeService.createStore(data)
      
      setSetupProgress(70)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSetupProgress(100)
      
      toast.success('¡Tienda creada exitosamente!')
      
      setTimeout(() => {
        onOpenChange(false)
        form.reset()
        setCurrentStep(0)
        setSetupProgress(0)
        onSuccess?.(storeId)
      }, 1000)
    } catch (error) {
      console.error('Error creating store:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la tienda')
      setCurrentStep(2) // Volver al paso anterior
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tienda</DialogTitle>
          <DialogDescription>
            Sigue los pasos para configurar tu nueva tienda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 ${
                    index === currentStep ? 'text-primary font-medium' : ''
                  }`}
                >
                  <step.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 0: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Tienda</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Otro Coro Fashion"
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="otro-coro-fashion" {...field} />
                        </FormControl>
                        <FormDescription>
                          Se usará en la URL: /tienda/{field.value}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Tienda</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fashion">Moda</SelectItem>
                            <SelectItem value="jewelry">Joyería</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu tienda..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 1: Branding */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://ejemplo.com/logo.png"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          URL de la imagen del logo (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Primario</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-20" />
                              <Input {...field} placeholder="#000000" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Secundario</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-20" />
                              <Input {...field} placeholder="#ffffff" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Config */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la moneda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DOP">DOP - Peso Dominicano</SelectItem>
                            <SelectItem value="USD">USD - Dólar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona Horaria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la zona horaria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="America/Santo_Domingo">
                              Santo Domingo (GMT-4)
                            </SelectItem>
                            <SelectItem value="America/New_York">
                              New York (GMT-5)
                            </SelectItem>
                            <SelectItem value="America/Los_Angeles">
                              Los Angeles (GMT-8)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultTaxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasa de Impuesto por Defecto (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="18"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          ITBIS en República Dominicana es 18%
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Setup Progress */}
              {currentStep === 3 && (
                <div className="space-y-6 py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    {setupProgress < 100 ? (
                      <>
                        <Package className="h-16 w-16 text-primary animate-pulse mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Configurando tu tienda...
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Estamos creando las colecciones y configuraciones iniciales
                        </p>
                        <Progress value={setupProgress} className="w-full max-w-md" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {setupProgress}% completado
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          ¡Tienda creada exitosamente!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tu tienda está lista para usar
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {currentStep < 3 && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
            >
              Anterior
            </Button>
            {currentStep < 2 ? (
              <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                Siguiente
              </Button>
            ) : (
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                Crear Tienda
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}



