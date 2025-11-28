import { useState, useEffect, useRef } from 'react'
import { useProducts } from '@/hooks/use-products'
import { usePosStore } from '@/stores/pos-store'
import { useStoreStore } from '@/stores/store-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Barcode, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function ProductBrowser() {
  const { store } = useStoreStore()
  const { products, isLoading } = useProducts(store?.id)
  const { addToCart } = usePosStore()
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrado de productos
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.variants?.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Auto-focus en search al montar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Manejo de scanner (si el input tiene foco y recibe enter con código exacto)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery) {
      const exactMatch = products.find(p => 
        p.variants?.some(v => v.sku.toLowerCase() === searchQuery.toLowerCase())
      )
      
      if (exactMatch) {
        const variant = exactMatch.variants?.find(v => v.sku.toLowerCase() === searchQuery.toLowerCase())
        addToCart(exactMatch, variant?.id)
        setSearchQuery('') // Limpiar para siguiente scan
        toast.success(`Agregado: ${exactMatch.name}`)
      }
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar producto o escanear código de barras..."
          className="pl-10 h-12 text-lg"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:flex gap-1">
            <Barcode className="h-3 w-3" />
            Scanner Ready
          </Badge>
        </div>
      </div>

      {/* Categories (Chips) - Placeholder */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Todos', 'Ropa', 'Zapatos', 'Accesorios', 'Joyería'].map(cat => (
          <Button key={cat} variant="outline" size="sm" className="rounded-full">
            {cat}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Package className="h-12 w-12 mb-2 opacity-20" />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className={cn(
                  "cursor-pointer hover:border-primary transition-all active:scale-95",
                  product.stockTotal <= 0 && "opacity-60"
                )}
                onClick={() => addToCart(product)}
              >
                <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                  {product.images?.[0] ? (
                    <img 
                      src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                  {product.stockTotal <= 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold text-destructive">
                      AGOTADO
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 h-10 leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1 h-5">
                      Stop: {product.stockTotal}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

