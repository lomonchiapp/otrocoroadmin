/**
 * StatusBadge Component
 * Componente reutilizable para mostrar badges de estado
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}

/**
 * Utility para convertir estados a variantes de badge
 */
export function statusToVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    // Bundle/Product statuses
    active: 'default',
    draft: 'secondary',
    scheduled: 'outline',
    expired: 'destructive',
    archived: 'secondary',
    
    // Order statuses
    pending: 'secondary',
    confirmed: 'default',
    processing: 'default',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
    refunded: 'destructive',
  }

  return statusMap[status.toLowerCase()] || 'default'
}