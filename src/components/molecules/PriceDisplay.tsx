/**
 * Componente para mostrar precios con descuentos
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  price: number
  compareAtPrice?: number
  wholesalePrice?: number
  currency?: string
  showSavings?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({
  price,
  compareAtPrice,
  wholesalePrice,
  currency = '$',
  showSavings = true,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price
  const savings = hasDiscount ? compareAtPrice - price : 0
  const savingsPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Precio actual */}
      <span className={cn('font-bold', sizeClasses[size])}>
        {currency}{price.toFixed(2)}
      </span>

      {/* Precio anterior */}
      {hasDiscount && (
        <>
          <span className={cn('text-muted-foreground line-through', 
            size === 'lg' ? 'text-lg' : 'text-sm'
          )}>
            {currency}{compareAtPrice.toFixed(2)}
          </span>

          {/* Badge de descuento */}
          {showSavings && (
            <Badge variant="destructive" className="bg-red-500">
              -{savingsPercentage}%
            </Badge>
          )}
        </>
      )}

      {/* Precio mayorista */}
      {wholesalePrice && wholesalePrice < price && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Mayorista: {currency}{wholesalePrice.toFixed(2)}
        </Badge>
      )}
    </div>
  )
}

/**
 * Versión compacta solo con precio
 */
export function PriceDisplayCompact({ price, currency = '$' }: { price: number; currency?: string }) {
  return (
    <span className="font-semibold">
      {currency}{price.toFixed(2)}
    </span>
  )
}





