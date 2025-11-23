import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerWithRange } from '@/components/ui/date-picker'
import { Filter } from 'lucide-react'
import { useState } from 'react'
import type { OrderFilters } from '@/types'

interface OrderFiltersSheetProps {
  onApplyFilters: (filters: Partial<OrderFilters>) => void
}

export function OrderFiltersSheet({ onApplyFilters }: OrderFiltersSheetProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>([])
  const [selectedFulfillmentStatuses, setSelectedFulfillmentStatuses] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | undefined>()

  const orderStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'refunded', label: 'Reembolsado' },
  ]

  const paymentStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'authorized', label: 'Autorizado' },
    { value: 'paid', label: 'Pagado' },
    { value: 'failed', label: 'Fallido' },
    { value: 'refunded', label: 'Reembolsado' },
  ]

  const fulfillmentStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
  ]

  const handleApply = () => {
    const filters: Partial<OrderFilters> = {
      status: selectedStatuses.length > 0 ? (selectedStatuses as any) : undefined,
      paymentStatus: selectedPaymentStatuses.length > 0 ? (selectedPaymentStatuses as any) : undefined,
      fulfillmentStatus: selectedFulfillmentStatuses.length > 0 ? (selectedFulfillmentStatuses as any) : undefined,
      dateRange,
    }

    onApplyFilters(filters)
    setOpen(false)
  }

  const handleReset = () => {
    setSelectedStatuses([])
    setSelectedPaymentStatuses([])
    setSelectedFulfillmentStatuses([])
    setDateRange(undefined)
    onApplyFilters({})
    setOpen(false)
  }

  const toggleStatus = (status: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(status)) {
      setList(list.filter((s) => s !== status))
    } else {
      setList([...list, status])
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros de órdenes</SheetTitle>
          <SheetDescription>
            Filtra las órdenes por estado, pago, envío y fecha
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Estado de orden */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Estado de orden</Label>
            <div className="space-y-2">
              {orderStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={() =>
                      toggleStatus(status.value, selectedStatuses, setSelectedStatuses)
                    }
                  />
                  <label
                    htmlFor={`status-${status.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Estado de pago */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Estado de pago</Label>
            <div className="space-y-2">
              {paymentStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${status.value}`}
                    checked={selectedPaymentStatuses.includes(status.value)}
                    onCheckedChange={() =>
                      toggleStatus(status.value, selectedPaymentStatuses, setSelectedPaymentStatuses)
                    }
                  />
                  <label
                    htmlFor={`payment-${status.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Estado de envío */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Estado de envío</Label>
            <div className="space-y-2">
              {fulfillmentStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fulfillment-${status.value}`}
                    checked={selectedFulfillmentStatuses.includes(status.value)}
                    onCheckedChange={() =>
                      toggleStatus(
                        status.value,
                        selectedFulfillmentStatuses,
                        setSelectedFulfillmentStatuses
                      )
                    }
                  />
                  <label
                    htmlFor={`fulfillment-${status.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Rango de fechas */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Rango de fechas</Label>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={(range) => setDateRange(range)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Aplicar filtros
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Limpiar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}















