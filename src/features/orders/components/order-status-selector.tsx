import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/orders'

interface OrderStatusSelectorProps {
  currentStatus: OrderStatus
  onStatusChange: (status: OrderStatus) => void
  variant?: 'default' | 'compact'
}

interface PaymentStatusSelectorProps {
  currentStatus: PaymentStatus
  onStatusChange: (status: PaymentStatus) => void
  variant?: 'default' | 'compact'
}

interface FulfillmentStatusSelectorProps {
  currentStatus: FulfillmentStatus
  onStatusChange: (status: FulfillmentStatus) => void
  variant?: 'default' | 'compact'
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon?: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  partially_refunded: { label: 'Parcialmente Reembolsado', color: 'bg-orange-100 text-orange-800 border-orange-300' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  authorized: { label: 'Autorizado', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-300' },
  partially_paid: { label: 'Parcialmente Pagado', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800 border-red-300' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800 border-gray-300' },
}

const fulfillmentStatusConfig: Record<FulfillmentStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' },
}

export function OrderStatusSelector({ currentStatus, onStatusChange, variant = 'default' }: OrderStatusSelectorProps) {
  const [open, setOpen] = useState(false)
  const config = statusConfig[currentStatus]

  const handleSelect = (status: OrderStatus) => {
    onStatusChange(status)
    setOpen(false)
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1">
            <Badge className={config.color}>{config.label}</Badge>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(statusConfig) as OrderStatus[]).map((status) => {
            const statusCfg = statusConfig[status]
            const isSelected = status === currentStatus
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleSelect(status)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{statusCfg.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <Badge className={config.color}>{config.label}</Badge>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar Estado de Orden</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(statusConfig) as OrderStatus[]).map((status) => {
          const statusCfg = statusConfig[status]
          const isSelected = status === currentStatus
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleSelect(status)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{statusCfg.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PaymentStatusSelector({ currentStatus, onStatusChange, variant = 'default' }: PaymentStatusSelectorProps) {
  const [open, setOpen] = useState(false)
  const config = paymentStatusConfig[currentStatus]

  const handleSelect = (status: PaymentStatus) => {
    onStatusChange(status)
    setOpen(false)
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1">
            <Badge className={config.color}>{config.label}</Badge>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Cambiar Estado de Pago</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map((status) => {
            const statusCfg = paymentStatusConfig[status]
            const isSelected = status === currentStatus
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleSelect(status)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{statusCfg.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <Badge className={config.color}>{config.label}</Badge>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar Estado de Pago</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map((status) => {
          const statusCfg = paymentStatusConfig[status]
          const isSelected = status === currentStatus
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleSelect(status)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{statusCfg.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FulfillmentStatusSelector({ currentStatus, onStatusChange, variant = 'default' }: FulfillmentStatusSelectorProps) {
  const [open, setOpen] = useState(false)
  const config = fulfillmentStatusConfig[currentStatus]

  const handleSelect = (status: FulfillmentStatus) => {
    onStatusChange(status)
    setOpen(false)
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1">
            <Badge className={config.color}>{config.label}</Badge>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Cambiar Estado de Envío</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(fulfillmentStatusConfig) as FulfillmentStatus[]).map((status) => {
            const statusCfg = fulfillmentStatusConfig[status]
            const isSelected = status === currentStatus
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleSelect(status)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{statusCfg.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <Badge className={config.color}>{config.label}</Badge>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar Estado de Envío</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(fulfillmentStatusConfig) as FulfillmentStatus[]).map((status) => {
          const statusCfg = fulfillmentStatusConfig[status]
          const isSelected = status === currentStatus
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleSelect(status)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{statusCfg.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}



