import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FolderTree, Folder } from 'lucide-react'
import type { Category } from '@/types'

interface CategoriesWidgetProps {
  categories: Category[]
}

export function CategoriesWidget({ categories }: CategoriesWidgetProps) {
  const rootCategories = categories.filter(c => !c.parentId && c.isActive)
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0)
  
  // Encontrar la categoría con más productos
  const topCategory = categories.length > 0 
    ? categories.reduce((prev, current) => 
        (prev.productCount > current.productCount) ? prev : current
      )
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-purple-600" />
          Categorías Activas
        </CardTitle>
        <CardDescription>
          Distribución de productos por categoría
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rootCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderTree className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay categorías activas</p>
          </div>
        ) : (
          <>
            {/* Categoría destacada */}
            {topCategory && topCategory.productCount > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-purple-900">{topCategory.name}</p>
                    <p className="text-xs text-purple-700">Categoría más popular</p>
                  </div>
                  <Badge className="bg-purple-600">
                    {topCategory.productCount} productos
                  </Badge>
                </div>
                <Progress 
                  value={totalProducts > 0 ? (topCategory.productCount / totalProducts) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-purple-700 mt-2">
                  {totalProducts > 0 ? Math.round((topCategory.productCount / totalProducts) * 100) : 0}% del total
                </p>
              </div>
            )}

            {/* Lista de categorías */}
            <div className="space-y-3">
              {rootCategories
                .sort((a, b) => b.productCount - a.productCount)
                .slice(0, 5)
                .map((category) => {
                  const subcategories = categories.filter(c => c.parentId === category.id)
                  const totalCategoryProducts = category.productCount + 
                    subcategories.reduce((sum, sub) => sum + sub.productCount, 0)
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={totalProducts > 0 ? (totalCategoryProducts / totalProducts) * 100 : 0} 
                              className="h-1.5 flex-1"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {totalCategoryProducts}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subcategorías */}
                      {subcategories.length > 0 && (
                        <div className="ml-11 space-y-1">
                          {subcategories
                            .filter(sub => sub.productCount > 0)
                            .slice(0, 3)
                            .map(sub => (
                              <div key={sub.id} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground truncate">{sub.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {sub.productCount}
                                </Badge>
                              </div>
                            ))}
                          {subcategories.filter(sub => sub.productCount > 0).length > 3 && (
                            <p className="text-xs text-muted-foreground italic">
                              +{subcategories.filter(sub => sub.productCount > 0).length - 3} más
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Resumen */}
            <div className="pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de categorías</span>
              <Badge variant="outline">{categories.filter(c => c.isActive).length}</Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}












