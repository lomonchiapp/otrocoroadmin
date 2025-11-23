import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Minus, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type StockItem } from '@/types'

const adjustmentSchema = z.object({
  adjustmentType: z.enum(['add', 'subtract', 'set']),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  reason: z.string().min(1, 'La razón es requerida'),
  notes: z.string().optional(),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockItem: StockItem | null
  onAdjust: (data: AdjustmentFormData & { stockItemId: string }) => void
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  stockItem,
  onAdjust,
}: StockAdjustmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: 'add',
      quantity: 1,
      reason: '',
      notes: '',
    },
  })

  const adjustmentType = form.watch('adjustmentType')
  const quantity = form.watch('quantity')

  const handleSubmit = async (data: AdjustmentFormData) => {
    if (!stockItem) return

    setIsSubmitting(true)
    try {
      await onAdjust({
        ...data,
        stockItemId: stockItem.id,
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adjusting stock:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNewQuantity = () => {
    if (!stockItem) return 0

    switch (adjustmentType) {
      case 'add':
        return stockItem.quantity + quantity
      case 'subtract':
        return Math.max(0, stockItem.quantity - quantity)
      case 'set':
        return quantity
      default:
        return stockItem.quantity
    }
  }

  const newQuantity = getNewQuantity()
  const isNegative = newQuantity < 0
  const isReducing = adjustmentType === 'subtract' && quantity > stockItem?.quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Modifica la cantidad de stock para este producto.
          </DialogDescription>
        </DialogHeader>

        {stockItem && (
          <div className="space-y-4">
            {/* Información del producto */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Producto</h4>
              <div className="text-sm text-muted-foreground">
                <div>ID: {stockItem.productId}</div>
                {stockItem.variationId && (
                  <div>
                    Variación: {Object.entries(stockItem.variationAttributes).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
                <div>Ubicación: {stockItem.locationName}</div>
                <div>Stock actual: <span className="font-medium">{stockItem.quantity}</span></div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="adjustmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Ajuste</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="add">
                            <div className="flex items-center">
                              <Plus className="h-4 w-4 mr-2 text-green-600" />
                              Agregar stock
                            </div>
                          </SelectItem>
                          <SelectItem value="subtract">
                            <div className="flex items-center">
                              <Minus className="h-4 w-4 mr-2 text-red-600" />
                              Reducir stock
                            </div>
                          </SelectItem>
                          <SelectItem value="set">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                              Establecer cantidad
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón del Ajuste</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar razón" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inventory_count">Conteo de inventario</SelectItem>
                          <SelectItem value="damage">Producto dañado</SelectItem>
                          <SelectItem value="theft">Robo</SelectItem>
                          <SelectItem value="return">Devolución</SelectItem>
                          <SelectItem value="transfer_in">Transferencia entrante</SelectItem>
                          <SelectItem value="transfer_out">Transferencia saliente</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalles adicionales sobre el ajuste..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resumen del ajuste */}
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium mb-2">Resumen del Ajuste</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Stock actual:</span>
                      <span className="font-mono">{stockItem.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cantidad a {adjustmentType === 'add' ? 'agregar' : adjustmentType === 'subtract' ? 'reducir' : 'establecer'}:</span>
                      <span className="font-mono">{quantity}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Nuevo stock:</span>
                      <span className={`font-mono ${isNegative ? 'text-red-600' : ''}`}>
                        {newQuantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alertas */}
                {isNegative && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      El stock no puede ser negativo. Ajusta la cantidad.
                    </AlertDescription>
                  </Alert>
                )}

                {isReducing && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Estás reduciendo más stock del disponible. Esto puede causar problemas.
                    </AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isNegative}
                  >
                    {isSubmitting ? 'Ajustando...' : 'Ajustar Stock'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

