import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useJewelryAttributes } from '@/hooks/use-jewelry-attributes'
import { JewelrySearchWizardComponent } from '@/components/jewelry/jewelry-search-wizard'
import { JewelryProductForm } from '@/components/jewelry/jewelry-product-form'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { JewelrySearchWizard, JewelryVariation } from '@/types/jewelry'
import { Search, Plus, Filter, Grid, List } from 'lucide-react'

interface JewelryProduct {
  id: string
  name: string
  description: string
  goldColor: string
  jewelryType: string
  karat: string
  weave?: string
  thickness?: string
  length?: string
  price: number
  compareAtPrice?: number
  images: string[]
  variations: JewelryVariation[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const JewelryProductsPage: React.FC = () => {
  const { store: currentStore } = useCurrentStore()
  const { jewelryAttributes, isLoading: loadingAttributes } = useJewelryAttributes(currentStore?.id)
  
  const [products, setProducts] = useState<JewelryProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<JewelryProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCriteria, setSearchCriteria] = useState<JewelrySearchWizard>({})
  const [showSearchWizard, setShowSearchWizard] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)

  // Datos mock para demostración
  const mockProducts: JewelryProduct[] = [
    {
      id: '1',
      name: 'Cadena de Oro Amarillo 14K Cubano',
      description: 'Hermosa cadena de oro amarillo 14K con tejido cubano clásico',
      goldColor: 'amarillo',
      jewelryType: 'cadena',
      karat: '14k',
      weave: 'cubano',
      thickness: '2.5-3mm',
      length: '20"',
      price: 450000,
      compareAtPrice: 540000,
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
      variations: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Anillo de Oro Blanco 18K',
      description: 'Elegante anillo de oro blanco 18K con diseño minimalista',
      goldColor: 'blanco',
      jewelryType: 'anillos',
      karat: '18k',
      thickness: '1.5-2mm',
      price: 320000,
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
      variations: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Guillo de Oro Rosado 14K Figaro',
      description: 'Delicado guillo de oro rosado 14K con tejido figaro',
      goldColor: 'rosado',
      jewelryType: 'guillo',
      karat: '14k',
      weave: 'figaro',
      thickness: '1.5-2mm',
      length: 'hasta-8.5"',
      price: 280000,
      images: ['https://images.unsplash.com/photo-1617038220319-276d4d2e0d0b?w=400'],
      variations: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  useEffect(() => {
    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
  }, [])

  // Filtrar productos basado en criterios de búsqueda
  useEffect(() => {
    let filtered = products

    // Filtro por texto de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtros específicos de joyería
    if (searchCriteria.goldColor) {
      filtered = filtered.filter(product => product.goldColor === searchCriteria.goldColor)
    }

    if (searchCriteria.jewelryType) {
      filtered = filtered.filter(product => product.jewelryType === searchCriteria.jewelryType)
    }

    if (searchCriteria.karat) {
      filtered = filtered.filter(product => product.karat === searchCriteria.karat)
    }

    if (searchCriteria.weave) {
      filtered = filtered.filter(product => product.weave === searchCriteria.weave)
    }

    if (searchCriteria.thickness) {
      filtered = filtered.filter(product => product.thickness === searchCriteria.thickness)
    }

    if (searchCriteria.length) {
      filtered = filtered.filter(product => product.length === searchCriteria.length)
    }

    if (searchCriteria.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= searchCriteria.priceRange!.min &&
        product.price <= searchCriteria.priceRange!.max
      )
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, searchCriteria])

  const handleSearch = (criteria: JewelrySearchWizard) => {
    setSearchCriteria(criteria)
    setShowSearchWizard(false)
  }

  const handleReset = () => {
    setSearchCriteria({})
    setSearchQuery('')
  }

  const handleProductCreated = (newProduct: any) => {
    // En una implementación real, esto vendría del servicio
    console.log('Producto creado:', newProduct)
    setShowProductForm(false)
  }

  const getGoldColorLabel = (color: string) => {
    const colors = {
      'blanco': 'Oro Blanco',
      'amarillo': 'Oro Amarillo',
      'rosado': 'Oro Rosado'
    }
    return colors[color as keyof typeof colors] || color
  }

  const getJewelryTypeLabel = (type: string) => {
    const types = {
      'cadena': 'Cadena',
      'guillo': 'Guillo',
      'pendientes': 'Aretes',
      'anillos': 'Anillo',
      'medallas': 'Medalla'
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Joyería</h1>
          <p className="text-muted-foreground">
            Gestiona tu colección de joyería de oro
          </p>
        </div>
        <Button onClick={() => setShowProductForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Joya
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar joyas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSearchWizard(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros Avanzados
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Filtros */}
      {(Object.keys(searchCriteria).length > 0 || searchQuery) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filtros aplicados:</span>
                {searchQuery && (
                  <Badge variant="secondary">"{searchQuery}"</Badge>
                )}
                {searchCriteria.goldColor && (
                  <Badge variant="secondary">{getGoldColorLabel(searchCriteria.goldColor)}</Badge>
                )}
                {searchCriteria.jewelryType && (
                  <Badge variant="secondary">{getJewelryTypeLabel(searchCriteria.jewelryType)}</Badge>
                )}
                {searchCriteria.karat && (
                  <Badge variant="secondary">{searchCriteria.karat.toUpperCase()}</Badge>
                )}
                {searchCriteria.priceRange && (
                  <Badge variant="secondary">
                    ${searchCriteria.priceRange.min.toLocaleString()} - ${searchCriteria.priceRange.max.toLocaleString()}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 relative">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl">💎</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {getGoldColorLabel(product.goldColor)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {product.karat.toUpperCase()}
                  </Badge>
                  {product.weave && (
                    <Badge variant="outline" className="text-xs">
                      {product.weave}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      ${product.price.toLocaleString('es-CO')}
                    </div>
                    {product.compareAtPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        ${product.compareAtPrice.toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron joyas</h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(searchCriteria).length > 0 || searchQuery
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primera joya'
              }
            </p>
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Joya
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wizard de Búsqueda */}
      <Sheet open={showSearchWizard} onOpenChange={setShowSearchWizard}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <JewelrySearchWizardComponent
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>

      {/* Formulario de Producto */}
      <Sheet open={showProductForm} onOpenChange={setShowProductForm}>
        <SheetContent side="right" className="w-full sm:max-w-4xl">
          <JewelryProductForm
            onSubmit={handleProductCreated}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

