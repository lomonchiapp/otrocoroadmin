import { useState } from 'react'
import { MoreHorizontal, Edit, Eye, Trash2, Copy, Star, StarOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import type { StoreType } from '@/types'

interface ProductsTableProps {
  storeId: string
  storeType?: StoreType
  searchQuery: string
  activeTab: string
  selectedProducts: string[]
  onSelectionChange: (products: string[]) => void
}

// Mock data para productos
const mockProducts = [
  {
    id: 'prod-001',
    name: 'Vestido Elegante Negro',
    slug: 'vestido-elegante-negro',
    sku: 'VEN001',
    image: '/products/vestido-negro.jpg',
    price: 120000,
    compareAtPrice: 150000,
    stock: 15,
    status: 'active',
    isFeatured: true,
    category: 'Vestidos',
    variants: 3,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'prod-002',
    name: 'Blusa Casual Blanca',
    slug: 'blusa-casual-blanca',
    sku: 'BCB002',
    image: '/products/blusa-blanca.jpg',
    price: 65000,
    compareAtPrice: null,
    stock: 0,
    status: 'out_of_stock',
    isFeatured: false,
    category: 'Tops',
    variants: 5,
    createdAt: new Date('2024-11-28'),
  },
  {
    id: 'prod-003',
    name: 'Jeans Slim Fit',
    slug: 'jeans-slim-fit',
    sku: 'JSF003',
    image: '/products/jeans-slim.jpg',
    price: 95000,
    compareAtPrice: 110000,
    stock: 8,
    status: 'active',
    isFeatured: true,
    category: 'Pantalones',
    variants: 4,
    createdAt: new Date('2024-11-25'),
  },
  {
    id: 'prod-004',
    name: 'Chaqueta de Cuero',
    slug: 'chaqueta-de-cuero',
    sku: 'CDC004',
    image: '/products/chaqueta-cuero.jpg',
    price: 280000,
    compareAtPrice: 320000,
    stock: 2,
    status: 'active',
    isFeatured: false,
    category: 'Chaquetas',
    variants: 6,
    createdAt: new Date('2024-11-20'),
  },
  {
    id: 'prod-005',
    name: 'Zapatos Deportivos',
    slug: 'zapatos-deportivos',
    sku: 'ZD005',
    image: '/products/zapatos-deportivos.jpg',
    price: 150000,
    compareAtPrice: null,
    stock: 1,
    status: 'draft',
    isFeatured: false,
    category: 'Calzado',
    variants: 8,
    createdAt: new Date('2024-11-18'),
  },
]

export function ProductsTable({
  storeId,
  storeType,
  searchQuery,
  activeTab,
  selectedProducts,
  onSelectionChange,
}: ProductsTableProps) {
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filtrar productos basado en la búsqueda y el tab activo
  const filteredProducts = mockProducts.filter(product => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !product.name.toLowerCase().includes(query) &&
        !product.sku.toLowerCase().includes(query) &&
        !product.category.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    // Filtro por tab
    switch (activeTab) {
      case 'active':
        return product.status === 'active'
      case 'draft':
        return product.status === 'draft'
      case 'out-of-stock':
        return product.status === 'out_of_stock' || product.stock === 0
      case 'featured':
        return product.isFeatured
      default:
        return true
    }
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredProducts.map(p => p.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProducts, productId])
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId))
    }
  }

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default">Activo</Badge>
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>
      case 'archived':
        return <Badge variant="outline">Archivado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Agotado</Badge>
    } else if (stock <= 5) {
      return <Badge variant="destructive">Bajo Stock</Badge>
    } else if (stock <= 10) {
      return <Badge variant="secondary">Stock Medio</Badge>
    } else {
      return <Badge variant="default">En Stock</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  if (filteredProducts.length === 0) {
    return (
      <Card className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-muted-foreground">
            No se encontraron productos
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery 
              ? `No hay productos que coincidan con "${searchQuery}"`
              : 'No hay productos en esta categoría'
            }
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  filteredProducts.length > 0 &&
                  selectedProducts.length === filteredProducts.length
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Variantes</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => 
                    handleSelectProduct(product.id, checked as boolean)
                  }
                />
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={product.image} alt={product.name} />
                    <AvatarFallback>
                      {product.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm leading-none">
                        {product.name}
                      </p>
                      {product.isFeatured && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {product.slug}
                    </p>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {product.sku}
                </code>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(product.status, product.stock)}
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{formatPrice(product.price)}</p>
                  {product.compareAtPrice && (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{product.stock}</p>
                  {getStockBadge(product.stock)}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline">{product.category}</Badge>
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary">{product.variants}</Badge>
              </TableCell>
              
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(product.createdAt)}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver producto
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      {product.isFeatured ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Quitar destacado
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Marcar destacado
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
