import { MoreHorizontal, Package, Grid3x3, Edit, Copy, Star, StarOff, Trash2, Infinity, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Product, ProductStatus } from '@/types'

interface MobileProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onDuplicate?: (product: Product) => void
  onToggleFeatured?: (product: Product) => void
  onManageStock?: (product: Product) => void
  onManageVariations?: (product: Product) => void
  onManageImages?: (product: Product) => void
}

const statusLabels: Record<ProductStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
}

const formatCurrency = (value: number | undefined) =>
  value !== undefined
    ? new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    : 'N/A'

export function MobileProductCard({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFeatured,
  onManageStock,
  onManageVariations,
  onManageImages,
}: MobileProductCardProps) {
  const primaryImage = product.images?.[0]
  const hasInfiniteStock = product.variations?.some(v => v.hasInfiniteStock) ?? false

  return (
    <div
      className="bg-card border rounded-lg p-4 active:bg-muted/50 transition-colors touch-manipulation"
      onClick={() => onEdit?.(product)}
    >
      <div className="flex gap-3">
        {/* Imagen */}
        <div
          className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onManageImages?.(product)
          }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{formatCurrency(product.basePrice)}</p>
            </div>
            {product.isFeatured && (
              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Stock Badge */}
            {hasInfiniteStock ? (
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                <Infinity className="w-3 h-3 mr-1" />
                Infinito
              </Badge>
            ) : product.totalInventory === 0 ? (
              <Badge variant="destructive" className="text-xs">Agotado</Badge>
            ) : product.totalInventory <= 5 ? (
              <Badge variant="destructive" className="bg-orange-500 text-xs">Bajo</Badge>
            ) : (
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">{product.totalInventory}</Badge>
            )}

            {/* Status Badge */}
            <Badge variant="outline" className="text-xs">
              {statusLabels[product.status]}
            </Badge>

            {/* Variaciones */}
            {product.variations && product.variations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.variations.length} vars
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onManageStock?.(product)
              }}
              className="h-8 text-xs flex-1"
            >
              <Package className="w-3 h-3 mr-1" />
              Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onManageVariations?.(product)
              }}
              className="h-8 text-xs flex-1"
            >
              <Grid3x3 className="w-3 h-3 mr-1" />
              Vars
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(product)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(product)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFeatured?.(product)}>
                  {product.isFeatured ? (
                    <><StarOff className="mr-2 h-4 w-4" /> Quitar destacado</>
                  ) : (
                    <><Star className="mr-2 h-4 w-4" /> Destacar</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(product)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
