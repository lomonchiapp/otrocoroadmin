import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Edit, Copy, Trash2, Star, StarOff, Image as ImageIcon, Grid3x3, List, Package, Plus, Infinity, Send, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTable } from '@/components/data-table/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import type { Product, ProductStatus, StoreType, Category } from '@/types'
import { cn } from '@/lib/utils'
import { MobileProductCard } from './mobile-product-card'

interface ProductsTableProps {
  products: Product[]
  storeType?: StoreType
  categories?: Category[]
  selectedProducts: string[]
  onSelectionChange: (products: string[]) => void
  isLoading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onRefresh?: () => void
  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (product: Product) => void
  onDuplicateProduct?: (product: Product) => void
  onToggleFeatured?: (product: Product) => void
  onManageStock?: (product: Product) => void
  onManageVariations?: (product: Product) => void
  onManageImages?: (product: Product) => void
  onTogglePublished?: (product: Product) => void
}

const formatCurrency = (value: number | undefined) =>
  value !== undefined
    ? `RD$${value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—'

const statusLabels: Record<ProductStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
}

export function ProductsTable({
  products,
  storeType: _storeType,
  categories = [],
  selectedProducts: _selectedProducts,
  onSelectionChange,
  isLoading = false,
  pagination,
  onRefresh: _onRefresh,
  viewMode = 'table',
  onViewModeChange,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleFeatured,
  onManageStock,
  onManageVariations,
  onManageImages,
  onTogglePublished,
}: ProductsTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'images',
        header: 'Imagen',
        cell: ({ row }) => {
          const product = row.original
          const primaryImage = product.images?.[0]
          return (
            <div 
              className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
              onClick={(e) => {
                e.stopPropagation()
                onManageImages?.(product)
              }}
              title="Click para gestionar imágenes"
            >
              {primaryImage ? (
                <img 
                  src={primaryImage} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Producto',
        cell: ({ row }) => {
          const product = row.original
          const sku = product.attributes?.find((attr) => attr.attribute.slug === 'sku')?.values[0]?.value
          const createdDate = new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(product.createdAt)
          
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1 min-w-[200px] cursor-help">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{product.name}</span>
                      {product.isFeatured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Destacado
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.slug}</p>
                    {product.shortDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDescription}</p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">SKU</p>
                      <p className="font-mono text-sm">{sku || 'Sin SKU'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha de creación</p>
                      <p className="text-sm">{createdDate}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
      // SKU column - Hidden (now shown in product name tooltip)
      // {
      //   accessorKey: 'sku',
      //   header: 'SKU',
      //   cell: ({ row }) => {
      //     const sku = row.original.attributes?.find((attr) => attr.attribute.slug === 'sku')?.values[0]?.value
      //     return (
      //       <span className="font-mono text-xs">{sku || '—'}</span>
      //     )
      //   },
      // },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ row }) => {
          const type = row.original.type
          return (
            <Badge variant="outline">
              {type === 'clothing' ? 'Ropa' : type === 'jewelry' ? 'Joyería' : type}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'categoryId',
        header: 'Categoría',
        cell: ({ row }) => {
          const category = categories.find(cat => cat.id === row.original.categoryId)
          const subcategory = row.original.subcategoryId 
            ? categories.find(cat => cat.id === row.original.subcategoryId)
            : null
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm">{category?.name || '—'}</span>
              {subcategory && (
                <span className="text-xs text-muted-foreground">{subcategory.name}</span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const product = row.original
          const { status, totalInventory, variations } = product
          
          // Verificar si tiene stock infinito
          const hasInfiniteStock = variations?.some(v => v.hasInfiniteStock) ?? false
          
          return (
            <div className="flex items-center gap-2">
              {/* Badge de estado */}
              <div>
                {hasInfiniteStock && status === 'published' ? (
                  <Badge variant="default" className="bg-green-500">Publicado</Badge>
                ) : !hasInfiniteStock && totalInventory === 0 && status === 'published' ? (
                  <Badge variant="destructive">Sin stock</Badge>
                ) : status === 'published' ? (
                  <Badge variant="default" className="bg-green-500">Publicado</Badge>
                ) : status === 'draft' ? (
                  <Badge variant="secondary">Borrador</Badge>
                ) : status === 'archived' ? (
                  <Badge variant="outline">Archivado</Badge>
                ) : (
                  <Badge variant="secondary">{statusLabels[status]}</Badge>
                )}
              </div>

              {/* Botón de toggle publish/draft */}
              {status !== 'archived' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTogglePublished?.(product)
                        }}
                        className="h-7 w-7 p-0 hover:bg-primary/10"
                      >
                        {status === 'published' ? (
                          <FileText className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Send className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {status === 'published' 
                        ? 'Cambiar a borrador' 
                        : 'Publicar producto'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'basePrice',
        header: 'Precio',
        cell: ({ row }) => {
          const product = row.original
          const hasDiscount = product.compareAtPrice && product.compareAtPrice > (product.basePrice || 0)
          return (
            <div className="space-y-1">
              <p className="font-semibold text-sm">{formatCurrency(product.basePrice)}</p>
              {hasDiscount && (
                <>
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                  <Badge variant="destructive" className="text-xs">
                    -{Math.round(((product.compareAtPrice! - (product.basePrice || 0)) / product.compareAtPrice!) * 100)}%
                  </Badge>
                </>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'totalInventory',
        header: 'Inventario',
        cell: ({ row }) => {
          const product = row.original
          const { totalInventory } = product

          // Verificar si alguna variación tiene stock infinito
          const hasInfiniteStock = product.variations?.some(v => v.hasInfiniteStock) ?? false

          return (
            <div className="flex items-center gap-2">
              {hasInfiniteStock ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Infinity className="w-3 h-3 mr-1" />
                  Infinito
                </Badge>
              ) : totalInventory === 0 ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onManageStock?.(product)
                  }}
                  className="h-6"
                >
                  <Package className="w-3 h-3 mr-1" />
                  Agotado
                </Button>
              ) : totalInventory <= 5 ? (
                <Badge variant="destructive" className="bg-orange-500">Bajo ({totalInventory})</Badge>
              ) : totalInventory <= 10 ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medio ({totalInventory})</Badge>
              ) : (
                <Badge variant="default" className="bg-green-100 text-green-800">{totalInventory} unidades</Badge>
              )}
              
              {/* Botón para agregar stock */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onManageStock?.(product)
                }}
                className="h-6 w-6 p-0 hover:bg-primary/10"
                title="Gestionar stock"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )
        },
      },
      {
        accessorKey: 'variations',
        header: 'Variantes',
        cell: ({ row }) => {
          const product = row.original
          const variationsCount = product.variations?.length || 0
          
          if (variationsCount === 0) {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onManageVariations?.(product)
                }}
                className="h-6 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Crear
              </Button>
            )
          }
          
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onManageVariations?.(product)
              }}
              className="h-6 px-2"
            >
              <Badge variant="outline" className="font-mono">
                {variationsCount}
              </Badge>
            </Button>
          )
        },
      },
      {
        accessorKey: 'tags',
        header: 'Etiquetas',
        cell: ({ row }) => {
          const tags = row.original.tags || []
          if (tags.length === 0) return <span className="text-muted-foreground">—</span>
          return (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )
        },
      },
      // Created date column - Hidden (now shown in product name tooltip)
      // {
      //   accessorKey: 'createdAt',
      //   header: 'Creado',
      //   cell: ({ row }) => {
      //     const date = row.original.createdAt
      //     return (
      //       <div className="text-sm">
      //         <div>{new Intl.DateTimeFormat('es-CO', {
      //           year: 'numeric',
      //           month: 'short',
      //           day: 'numeric',
      //         }).format(date)}</div>
      //         <div className="text-xs text-muted-foreground">
      //           {new Intl.DateTimeFormat('es-CO', {
      //             hour: '2-digit',
      //             minute: '2-digit',
      //           }).format(date)}
      //         </div>
      //       </div>
      //     )
      //   },
      // },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const product = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditProduct?.(product)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageStock?.(product)}>
                  <Package className="mr-2 h-4 w-4" /> Gestionar Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicateProduct?.(product)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleFeatured?.(product)}>
                  {product.isFeatured ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" /> Quitar destacado
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" /> Destacar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteProduct?.(product)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [categories, onEditProduct, onDeleteProduct, onDuplicateProduct, onToggleFeatured, onManageStock, onManageVariations, onManageImages, onTogglePublished],
  )

  // Vista de cuadrícula/thumbnails
  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        {/* Controles de vista */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {products.length} productos encontrados
          </p>
          {onViewModeChange && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Cuadrícula
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Tabla
              </Button>
            </div>
          )}
        </div>

        {/* Grid de productos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
              const category = categories.find(cat => cat.id === product.categoryId)
              const isSelected = selectedProducts.includes(product.id)
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > (product.basePrice || 0)

              return (
                <div
                  key={product.id}
                  className={cn(
                    "group bg-card rounded-xl border transition-all duration-200 hover:shadow-lg hover:border-primary/50",
                    isSelected && "border-primary ring-2 ring-primary/20"
                  )}
                >
                  {/* Imagen del producto */}
                  <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Badges flotantes */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      {product.isFeatured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Destacado
                        </Badge>
                      )}
                      {hasDiscount && (
                        <Badge variant="destructive">
                          -{Math.round(((product.compareAtPrice! - (product.basePrice || 0)) / product.compareAtPrice!) * 100)}%
                        </Badge>
                      )}
                    </div>

                    {/* Checkbox de selección */}
                    <div className="absolute top-2 right-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onSelectionChange([...selectedProducts, product.id])
                          } else {
                            onSelectionChange(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                        className="bg-white shadow-lg"
                      />
                    </div>

                    {/* Stock badge */}
                    <div className="absolute bottom-2 right-2">
                      {product.totalInventory === 0 ? (
                        <Badge variant="destructive">Agotado</Badge>
                      ) : product.totalInventory <= 5 ? (
                        <Badge variant="destructive" className="bg-orange-500">
                          Quedan {product.totalInventory}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="p-4 space-y-3">
                    {/* Categoría y tipo */}
                    <div className="flex items-center gap-2">
                      {category && (
                        <Badge variant="outline" className="text-xs">
                          {category.name}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {product.type === 'clothing' ? 'Ropa' : 'Joyería'}
                      </Badge>
                    </div>

                    {/* Nombre */}
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {/* Precio */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">
                        {formatCurrency(product.basePrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Estado y variantes */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{product.variations?.length || 0} variantes</span>
                      </div>
                      {product.status === 'published' ? (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {statusLabels[product.status]}
                        </Badge>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="default" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {product.isFeatured ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" /> Quitar destacado
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" /> Destacar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Vista de tabla
  return (
    <div className="space-y-4">
      {/* Controles de vista */}
      {onViewModeChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {products.length} productos encontrados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Cuadrícula
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('table')}
            >
              <List className="h-4 w-4 mr-2" />
              Tabla
            </Button>
          </div>
        </div>
      )}

      {/* Tabla desktop */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={products}
          onSelectedRowsChange={onSelectionChange}
          loading={isLoading}
          pagination={pagination}
        />
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        ) : (
          products.map(product => (
            <MobileProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onDuplicate={onDuplicateProduct}
              onToggleFeatured={onToggleFeatured}
              onManageStock={onManageStock}
              onManageVariations={onManageVariations}
              onManageImages={onManageImages}
            />
          ))
        )}
      </div>
    </div>
  )
}

