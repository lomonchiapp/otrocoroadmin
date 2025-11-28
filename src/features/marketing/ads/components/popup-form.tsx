import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { adService } from '@/services/adService'
import type { Popup, CreatePopupInput, PopupStyle } from '@/types/ads'
import { toast } from 'sonner'
import { Eye, Laptop, Smartphone, Palette, MousePointerClick, Settings2 } from 'lucide-react'

const popupFormSchema = z.object({
  // Contenido Básico
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  type: z.enum(['info', 'lead_capture', 'coupon']),
  
  imageUrl: z.string().optional(),
  imagePosition: z.enum(['top', 'left', 'right', 'background']),
  
  buttonText: z.string().optional(),
  buttonLink: z.string().url('URL inválida').optional().or(z.literal('')),
  
  couponCode: z.string().optional(),
  couponSuccessMessage: z.string().optional(),
  
  formSuccessMessage: z.string().optional(),
  
  // Diseño
  style: z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    buttonColor: z.string().optional(),
    buttonTextColor: z.string().optional(),
    overlayColor: z.string().optional(),
    borderColor: z.string().optional(),
    animation: z.enum(['fade', 'slide-up', 'slide-down', 'zoom', 'bounce']),
  }),
  position: z.enum(['center', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']),
  size: z.enum(['small', 'medium', 'large', 'fullscreen']),
  showCloseButton: z.boolean(),
  
  // Reglas
  trigger: z.enum(['immediate', 'delay', 'scroll', 'exit-intent', 'page-visit', 'inactivity']),
  triggerDelay: z.number().min(0).optional(),
  frequency: z.enum(['always', 'once_session', 'once_day', 'once_week', 'once_forever']),
  closeOnBackdropClick: z.boolean(),
  closeAfterSeconds: z.number().min(0).optional(),
  
  // Segmentación
  status: z.enum(['active', 'inactive', 'scheduled', 'expired']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetAudience: z.enum(['all', 'new', 'returning', 'vip']),
  targetDevice: z.enum(['all', 'desktop', 'mobile']),
  minCartValue: z.number().optional(),
  maxCartValue: z.number().optional(),
  showOnPages: z.string().optional(),
  hideOnPages: z.string().optional(),
})

type PopupFormValues = z.infer<typeof popupFormSchema>

interface PopupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  popup?: Popup | null
  onSuccess: () => void
  createdBy: string
}

const DEFAULT_STYLE: PopupStyle = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  buttonColor: '#000000',
  buttonTextColor: '#ffffff',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  animation: 'fade'
}

export function PopupForm({ open, onOpenChange, popup, onSuccess, createdBy }: PopupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

  const form = useForm<PopupFormValues>({
    resolver: zodResolver(popupFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'info',
      imageUrl: '',
      imagePosition: 'top',
      buttonText: '',
      buttonLink: '',
      couponCode: '',
      couponSuccessMessage: '¡Código copiado!',
      formSuccessMessage: '¡Gracias por suscribirte!',
      style: DEFAULT_STYLE,
      position: 'center',
      size: 'medium',
      showCloseButton: true,
      trigger: 'immediate',
      triggerDelay: 0,
      frequency: 'always',
      closeOnBackdropClick: true,
      closeAfterSeconds: undefined,
      status: 'inactive',
      startDate: '',
      endDate: '',
      targetAudience: 'all',
      targetDevice: 'all',
      minCartValue: undefined,
      maxCartValue: undefined,
      showOnPages: '',
      hideOnPages: '',
    },
  })

  useEffect(() => {
    if (popup) {
      form.reset({
        ...popup,
        imageUrl: popup.imageUrl || '',
        buttonText: popup.buttonText || '',
        buttonLink: popup.buttonLink || '',
        couponCode: popup.couponCode || '',
        couponSuccessMessage: popup.couponSuccessMessage || '¡Código copiado!',
        formSuccessMessage: popup.formSuccessMessage || '¡Gracias por suscribirte!',
        style: { ...DEFAULT_STYLE, ...popup.style },
        triggerDelay: popup.triggerDelay || 0,
        startDate: popup.startDate ? new Date(popup.startDate).toISOString().split('T')[0] : '',
        endDate: popup.endDate ? new Date(popup.endDate).toISOString().split('T')[0] : '',
        showOnPages: popup.showOnPages?.join(', ') || '',
        hideOnPages: popup.hideOnPages?.join(', ') || '',
      })
    } else {
      form.reset({
        title: '',
        content: '',
        type: 'info',
        style: DEFAULT_STYLE,
        position: 'center',
        size: 'medium',
        trigger: 'immediate',
        frequency: 'always',
        status: 'inactive',
        targetAudience: 'all',
        targetDevice: 'all',
        showCloseButton: true,
        closeOnBackdropClick: true,
        imagePosition: 'top'
      })
    }
  }, [popup, form])

  const onSubmit = async (values: PopupFormValues) => {
    try {
      setIsLoading(true)

      const popupData: CreatePopupInput = {
        title: values.title,
        content: values.content,
        type: values.type,
        
        imageUrl: values.imageUrl || undefined,
        imagePosition: values.imagePosition,
        
        buttonText: values.buttonText || undefined,
        buttonLink: values.buttonLink || undefined,
        
        couponCode: values.couponCode || undefined,
        couponSuccessMessage: values.couponSuccessMessage || undefined,
        
        formSuccessMessage: values.formSuccessMessage || undefined,
        
        style: values.style,
        position: values.position,
        size: values.size,
        showCloseButton: values.showCloseButton,
        
        trigger: values.trigger,
        triggerDelay: values.triggerDelay,
        frequency: values.frequency,
        closeOnBackdropClick: values.closeOnBackdropClick,
        closeAfterSeconds: values.closeAfterSeconds,
        
        status: values.status,
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        endDate: values.endDate ? new Date(values.endDate) : undefined,
        
        targetAudience: values.targetAudience,
        targetDevice: values.targetDevice,
        minCartValue: values.minCartValue,
        maxCartValue: values.maxCartValue,
        
        showOnPages: values.showOnPages
          ? values.showOnPages.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        hideOnPages: values.hideOnPages
          ? values.hideOnPages.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        
        createdBy: createdBy,
        storeId: popup?.storeId // Maintain storeId if editing
      }

      if (popup) {
        await adService.updatePopup({
          id: popup.id,
          ...popupData,
        })
        toast.success('Anuncio actualizado')
      } else {
        await adService.createPopup(popupData, createdBy)
        toast.success('Anuncio creado')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving popup:', error)
      toast.error('Error al guardar el anuncio')
    } finally {
      setIsLoading(false)
    }
  }

  const popupType = form.watch('type')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{popup ? 'Editar Anuncio' : 'Nuevo Anuncio'}</DialogTitle>
          <DialogDescription>
            Diseña popups atractivos y segmentados para tu tienda
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">
                  <Eye className="w-4 h-4 mr-2" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger value="design">
                  <Palette className="w-4 h-4 mr-2" />
                  Diseño
                </TabsTrigger>
                <TabsTrigger value="rules">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Reglas y Segmentación
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                {/* TAB: CONTENIDO */}
                <TabsContent value="content" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Anuncio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="info">Informativo / Promocional</SelectItem>
                            <SelectItem value="lead_capture">Captura de Emails (Newsletter)</SelectItem>
                            <SelectItem value="coupon">Código de Cupón</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: ¡10% de Descuento!" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenido</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu oferta o mensaje..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Soporta HTML básico</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Imagen</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imagePosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición Imagen</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="top">Arriba</SelectItem>
                              <SelectItem value="left">Izquierda</SelectItem>
                              <SelectItem value="right">Derecha</SelectItem>
                              <SelectItem value="background">Fondo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Campos específicos según Tipo */}
                  {popupType === 'info' && (
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <FormField
                        control={form.control}
                        name="buttonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto del Botón</FormLabel>
                            <FormControl>
                              <Input placeholder="Ver Oferta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="buttonLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enlace del Botón</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {popupType === 'coupon' && (
                    <div className="space-y-4 border-t pt-4">
                      <FormField
                        control={form.control}
                        name="couponCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código del Cupón</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: BIENVENIDA10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="couponSuccessMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensaje al copiar</FormLabel>
                            <FormControl>
                              <Input placeholder="¡Código copiado al portapapeles!" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {popupType === 'lead_capture' && (
                    <div className="border-t pt-4">
                      <FormField
                        control={form.control}
                        name="formSuccessMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensaje de éxito</FormLabel>
                            <FormControl>
                              <Input placeholder="¡Gracias por suscribirte!" {...field} />
                            </FormControl>
                            <FormDescription>Se mostrará después de enviar el formulario</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </TabsContent>

                {/* TAB: DISEÑO */}
                <TabsContent value="design" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición en pantalla</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="center">Centro</SelectItem>
                              <SelectItem value="top">Arriba (Barra)</SelectItem>
                              <SelectItem value="bottom">Abajo (Barra)</SelectItem>
                              <SelectItem value="top-left">Arriba Izquierda</SelectItem>
                              <SelectItem value="top-right">Arriba Derecha</SelectItem>
                              <SelectItem value="bottom-left">Abajo Izquierda</SelectItem>
                              <SelectItem value="bottom-right">Abajo Derecha</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="small">Pequeño</SelectItem>
                              <SelectItem value="medium">Mediano</SelectItem>
                              <SelectItem value="large">Grande</SelectItem>
                              <SelectItem value="fullscreen">Pantalla Completa</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style.animation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Animación de entrada</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fade">Desvanecer (Fade)</SelectItem>
                              <SelectItem value="slide-up">Deslizar Arriba</SelectItem>
                              <SelectItem value="slide-down">Deslizar Abajo</SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="bounce">Rebote</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="style.backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de Fondo</FormLabel>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                            <Input type="text" placeholder="#ffffff" {...field} />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style.textColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de Texto</FormLabel>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                            <Input type="text" placeholder="#000000" {...field} />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style.buttonColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color del Botón</FormLabel>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                            <Input type="text" placeholder="#000000" {...field} />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style.buttonTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Texto Botón</FormLabel>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                            <Input type="text" placeholder="#ffffff" {...field} />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* TAB: REGLAS Y SEGMENTACIÓN */}
                <TabsContent value="rules" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                              <SelectItem value="scheduled">Programado</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trigger"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disparador (Trigger)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediato</SelectItem>
                              <SelectItem value="delay">Retraso (Tiempo)</SelectItem>
                              <SelectItem value="scroll">Scroll (%)</SelectItem>
                              <SelectItem value="exit-intent">Intención de Salida</SelectItem>
                              <SelectItem value="page-visit">Nro de Visitas</SelectItem>
                              <SelectItem value="inactivity">Inactividad</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {form.watch('trigger') !== 'immediate' && form.watch('trigger') !== 'exit-intent' && (
                      <FormField
                        control={form.control}
                        name="triggerDelay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor del Trigger (segundos, %, visitas)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="always">Siempre</SelectItem>
                              <SelectItem value="once_session">Una vez por sesión</SelectItem>
                              <SelectItem value="once_day">Una vez al día</SelectItem>
                              <SelectItem value="once_week">Una vez a la semana</SelectItem>
                              <SelectItem value="once_forever">Una vez para siempre</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium">Segmentación</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targetDevice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dispositivo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="desktop">Solo Escritorio</SelectItem>
                                <SelectItem value="mobile">Solo Móvil</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audiencia</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="new">Nuevos Visitantes</SelectItem>
                                <SelectItem value="returning">Usuarios Recurrentes</SelectItem>
                                <SelectItem value="vip">Usuarios VIP</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minCartValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Mínimo Carrito</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="0" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxCartValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Máximo Carrito</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="Sin límite" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="showOnPages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mostrar solo en URLs que contengan</FormLabel>
                          <FormControl>
                            <Input placeholder="ej: /productos, /ofertas" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <FormField
                      control={form.control}
                      name="showCloseButton"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Mostrar botón de cerrar</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="closeOnBackdropClick"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-2">
                          <div className="space-y-0.5">
                            <FormLabel>Cerrar al hacer clic fuera</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Anuncio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
