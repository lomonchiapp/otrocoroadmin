import { useState } from 'react'
import { MoreHorizontal, Trash2, Archive, Eye, EyeOff, Star, StarOff, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'

interface BulkActionsDropdownProps {
  selectedProducts: string[]
  onSelectionChange: (products: string[]) => void
}

export function BulkActionsDropdown({ 
  selectedProducts, 
  onSelectionChange 
}: BulkActionsDropdownProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkAction = async (action: string) => {
    setIsLoading(true)
    
    try {
      switch (action) {
        case 'activate':
          console.log('Activating products:', selectedProducts)
          break
        case 'deactivate':
          console.log('Deactivating products:', selectedProducts)
          break
        case 'feature':
          console.log('Featuring products:', selectedProducts)
          break
        case 'unfeature':
          console.log('Unfeaturing products:', selectedProducts)
          break
        case 'archive':
          console.log('Archiving products:', selectedProducts)
          break
        case 'export':
          console.log('Exporting products:', selectedProducts)
          break
        case 'delete':
          console.log('Deleting products:', selectedProducts)
          setShowDeleteDialog(false)
          break
      }
      
      // En una implementación real, aquí harías la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Limpiar selección después de la acción
      onSelectionChange([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedProducts.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-2 py-1">
          {selectedProducts.length} seleccionados
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              Acciones
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Acciones en Lote</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => handleBulkAction('activate')}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Activar productos
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleBulkAction('deactivate')}
              disabled={isLoading}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Desactivar productos
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => handleBulkAction('feature')}
              disabled={isLoading}
            >
              <Star className="w-4 h-4 mr-2" />
              Marcar como destacado
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleBulkAction('unfeature')}
              disabled={isLoading}
            >
              <StarOff className="w-4 h-4 mr-2" />
              Quitar destacado
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => handleBulkAction('export')}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar seleccionados
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleBulkAction('archive')}
              disabled={isLoading}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archivar productos
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar productos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onSelectionChange([])}
        >
          Cancelar
        </Button>
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar productos seleccionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedProducts.length} producto(s) seleccionado(s).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction('delete')}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
