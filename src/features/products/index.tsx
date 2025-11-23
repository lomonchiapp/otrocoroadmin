import { useEffect, useState } from 'react'
import { Download, Upload, Zap, Package, Plus, PackageOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCurrentStore } from '@/hooks/use-current-store'
import { JewelryProductsPage } from './jewelry-products-page'
import { productService } from '@/services/productService'
import { type Product, type Category } from '@/types'
import { ProductsTable } from './components/products-table'
import { ProductFiltersSheet } from './components/product-filters-sheet'
import { BulkActionsDropdown } from './components/bulk-actions-dropdown'
import { ProductStatsCards } from './components/product-stats-cards'
import { ProductManager } from './components/product-manager'
import { BulkAddProductDialog } from './components/bulk-add-product-dialog'
import { QuickStockManager } from './components/quick-stock-manager'
import { QuickVariationsDialog } from './components/quick-variations-dialog'
import { QuickImageManager } from './components/quick-image-manager'
import { useProducts } from '@/hooks/use-products'
import { BundleFormSheet } from '@/features/bundles/components/BundleFormSheet'

export function Products() {
  const { store: currentStore, storeType } = useCurrentStore()
  
  // Si es tienda de joyería, mostrar página específica
  if (storeType === 'jewelry') {
    return <JewelryProductsPage />
  }
  
  // Página original para ropa
  return <ProductsPage />
}

function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [showProductManager, setShowProductManager] = useState(false)
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productManagerMode, setProductManagerMode] = useState<'create' | 'edit'>('create')
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [managingStockProduct, setManagingStockProduct] = useState<Product | null>(null)
  const [showStockManager, setShowStockManager] = useState(false)
  const [managingVariationsProduct, setManagingVariationsProduct] = useState<Product | null>(null)
  const [showVariationsDialog, setShowVariationsDialog] = useState(false)
  const [managingImagesProduct, setManagingImagesProduct] = useState<Product | null>(null)
  const [showImageManager, setShowImageManager] = useState(false)
  const [showBundleForm, setShowBundleForm] = useState(false)
  const { store: currentStore, storeType } = useCurrentStore()
  
  // Cargar categorías cuando se tenga una tienda
  useEffect(() => {
    if (currentStore?.id) {
      loadCategories()
    } else {
      setCategories([])
    }
  }, [currentStore])

  // DEBUG: Ver qué tienda está seleccionada
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🏪 ProductsPage - Tienda actual:', currentStore)
    // eslint-disable-next-line no-console
    console.log('🆔 ProductsPage - Store ID:', currentStore?.id)
  }, [currentStore])

  const loadCategories = async () => {
    if (!currentStore?.id) return

    try {
      const categoriesData = await productService.getCategoriesByStore(currentStore.id)
      setCategories(categoriesData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading categories:', error)
    }
  }
  
  const {
    products,
    isLoading,
    pagination,
    productStats,
    updateSearchParams,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
    refetch,
    error,
  } = useProducts(currentStore?.id)
  
  // DEBUG: Ver qué productos llegan
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('📊 ProductsPage - Productos:', products.length, 'productos')
    // eslint-disable-next-line no-console
    console.log('⏳ ProductsPage - isLoading:', isLoading)
    // eslint-disable-next-line no-console
    console.log('❌ ProductsPage - error:', error)
  }, [products, isLoading, error])

  const handleProductCreated = (_product: Product) => {
    refetch()
  }

  const handleProductUpdated = (_product: Product) => {
    refetch()
  }

  const handleProductDeleted = (_productId: string) => {
    refetch()
  }

  const handleProductsCreated = (_products: Product[]) => {
    refetch()
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductManagerMode('edit')
    setShowProductManager(true)
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setProductManagerMode('create')
    setShowProductManager(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product)
    setShowDeleteDialog(true)
  }

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return

    setIsDeleting(true)
    try {
      await productService.deleteProduct(deletingProduct.id)
      refetch()
      setShowDeleteDialog(false)
      setDeletingProduct(null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error eliminando producto:', error)
      alert('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicateProduct = async (product: Product) => {
    if (!currentStore?.id) return
    
    try {
      const newName = `${product.name} (Copia)`
      const newSlug = `${product.slug}-copia-${Date.now()}`
      await productService.duplicateProduct(product.id, newName, newSlug)
      refetch()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error duplicando producto:', error)
      alert('Error al duplicar el producto')
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      await productService.updateProduct(product.id, {
        isFeatured: !product.isFeatured
      })
      refetch()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cambiar destacado:', error)
      alert('Error al cambiar el estado destacado')
    }
  }

  const handleTogglePublished = async (product: Product) => {
    try {
      const newStatus = product.status === 'published' ? 'draft' : 'published'
      await productService.updateProduct(product.id, {
        status: newStatus
      })
      refetch()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cambiar estado de publicación:', error)
      alert('Error al cambiar el estado de publicación')
    }
  }

  const handleManageStock = (product: Product) => {
    setManagingStockProduct(product)
    setShowStockManager(true)
  }

  const handleManageVariations = (product: Product) => {
    setManagingVariationsProduct(product)
    setShowVariationsDialog(true)
  }

  const handleManageImages = (product: Product) => {
    setManagingImagesProduct(product)
    setShowImageManager(true)
  }

  const handleCreateBundle = () => {
    if (selectedProducts.length < 2) {
      alert('Selecciona al menos 2 productos para crear un combo')
      return
    }
    setShowBundleForm(true)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    updateSearchParams({ query: value, page: 1 })
  }

  const applyTabFilters = (tab: string) => {
    switch (tab) {
      case 'all':
        resetFilters()
        break
      case 'active':
        setFilters({ status: ['active'], isFeatured: undefined, hasStock: undefined })
        break
      case 'draft':
        setFilters({ status: ['draft'], isFeatured: undefined, hasStock: undefined })
        break
      case 'out-of-stock':
        setFilters({ hasStock: false, status: undefined, isFeatured: undefined })
        break
      case 'featured':
        setFilters({ isFeatured: true, status: undefined })
        break
      case 'clothing':
        setFilters({ type: 'clothing' })
        break
      case 'jewelry':
        setFilters({ type: 'jewelry' })
        break
      default:
        break
    }
    setPage(1)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    applyTabFilters(value)
  }

  // Unused but may be needed in the future
  // const handlePageChange = (page: number) => {
  //   setPage(page)
  // }

  // const handlePageSizeChange = (limit: number) => {
  //   setLimit(limit)
  // }

  useEffect(() => {
    if (currentStore) {
      updateSearchParams({ filters: { storeId: currentStore.id }, page: 1 })
    }
  }, [currentStore, updateSearchParams])

  // Mostrar mensaje si no hay tienda seleccionada
  if (!currentStore) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-muted-foreground">
                Selecciona una tienda
              </h2>
              <p className="text-muted-foreground">
                Para gestionar productos, primero debes seleccionar una tienda en el encabezado.
              </p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Header de la página */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Productos
                    </h1>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 text-xs"
                    >
                      {currentStore.name}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-600 text-sm md:text-base md:ml-13 hidden md:block">
                  Gestiona el catálogo de productos de {currentStore.name}
                </p>
              </div>

            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
              {/* Acciones bulk si hay productos seleccionados */}
              {selectedProducts.length > 0 && (
                <BulkActionsDropdown
                  selectedProducts={selectedProducts}
                  onSelectionChange={setSelectedProducts}
                />
              )}

              {/* Botones de acciones organizados */}
              <div className="flex items-center gap-1 md:gap-2">
                {/* Import/Export - Oculto en mobile */}
                <div className="hidden md:flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Importar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Importar Productos</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Desde CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Desde Excel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Plantilla CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                {/* Separador visual - Oculto en mobile */}
                <div className="hidden md:block w-px h-8 bg-slate-200"></div>

                {/* Crear productos */}
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    onClick={() => setShowBulkAddDialog(true)}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:from-green-100 hover:to-green-200 hover:text-green-800"
                  >
                    <Package className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Lote</span>
                  </Button>

                  <Button
                    onClick={handleCreateProduct}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Nuevo</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de estadísticas */}
          <ProductStatsCards stats={productStats} />
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-4 md:mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 md:gap-4">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 md:pl-10 h-10 md:h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 touch-manipulation text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
              <ProductFiltersSheet storeType={storeType || undefined} />

              {/* Información adicional */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Búsqueda avanzada disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs para diferentes vistas */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-6">
            <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
              <TabsList className="inline-flex lg:grid w-auto lg:w-full lg:grid-cols-7 h-auto bg-slate-100 p-1 min-w-max">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Todos</TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Activos</TabsTrigger>
                <TabsTrigger value="draft" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Borradores</TabsTrigger>
                <TabsTrigger value="out-of-stock" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Sin Stock</TabsTrigger>
                {storeType === 'fashion' && (
                  <TabsTrigger value="clothing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Ropa</TabsTrigger>
                )}
                {storeType === 'jewelry' && (
                  <TabsTrigger value="jewelry" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Joyería</TabsTrigger>
                )}
                <TabsTrigger value="featured" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 md:px-4 py-2 text-sm whitespace-nowrap touch-manipulation">Destacados</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-6">
            <ProductsTable
              products={products}
              storeType={storeType || undefined}
              categories={categories}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              isLoading={isLoading}
              pagination={pagination}
              onRefresh={refetch}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onToggleFeatured={handleToggleFeatured}
              onTogglePublished={handleTogglePublished}
              onManageStock={handleManageStock}
              onManageVariations={handleManageVariations}
              onManageImages={handleManageImages}
            />
          </TabsContent>
        </Tabs>

        {/* Product Manager (Create/Edit/Delete) */}
        <ProductManager
          open={showProductManager}
          onOpenChange={setShowProductManager}
          mode={productManagerMode}
          product={editingProduct}
          onProductCreated={handleProductCreated}
          onProductUpdated={handleProductUpdated}
          onProductDeleted={handleProductDeleted}
        />

        {/* Dialog de Agregado en Lote */}
        <BulkAddProductDialog
          open={showBulkAddDialog}
          onOpenChange={setShowBulkAddDialog}
          onProductsCreated={handleProductsCreated}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
                <strong className="block mt-2 text-foreground">"{deletingProduct?.name}"</strong>
                y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar producto'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Quick Stock Manager */}
        {managingStockProduct && (
          <QuickStockManager
            product={managingStockProduct}
            open={showStockManager}
            onOpenChange={setShowStockManager}
            onUpdate={refetch}
          />
        )}

        {/* Quick Variations Dialog */}
        {managingVariationsProduct && (
          <QuickVariationsDialog
            product={managingVariationsProduct}
            open={showVariationsDialog}
            onOpenChange={setShowVariationsDialog}
            onUpdate={refetch}
          />
        )}

        {/* Quick Image Manager */}
        {managingImagesProduct && (
          <QuickImageManager
            product={managingImagesProduct}
            open={showImageManager}
            onOpenChange={setShowImageManager}
            onUpdate={refetch}
          />
        )}

        {/* Bundle Form - Crear combo desde productos seleccionados */}
        <BundleFormSheet
          open={showBundleForm}
          onOpenChange={setShowBundleForm}
          preSelectedProducts={selectedProducts.map(id => ({ id, quantity: 1 }))}
        />

        {/* Floating Action Button - Crear Combo */}
        {selectedProducts.length >= 2 && (
          <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
            <Button
              size="lg"
              onClick={handleCreateBundle}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-200 h-14 px-6 text-base"
            >
              <PackageOpen className="w-5 h-5 mr-2" />
              Crear Combo ({selectedProducts.length} productos)
            </Button>
          </div>
        )}
      </Main>
    </>
  )
}
