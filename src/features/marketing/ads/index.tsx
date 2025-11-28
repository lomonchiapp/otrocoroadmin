import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PopupForm } from './components/popup-form'
import { adService } from '@/services/adService'
import type { Popup, PopupStatus } from '@/types/ads'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

export function Ads() {
  const { user } = useAuthStore()
  const [popups, setPopups] = useState<Popup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [popupToDelete, setPopupToDelete] = useState<Popup | null>(null)
  const [statusFilter, setStatusFilter] = useState<PopupStatus | 'all'>('all')

  useEffect(() => {
    loadPopups()
  }, [])

  const loadPopups = async () => {
    try {
      setIsLoading(true)
      const allPopups = await adService.getAll()
      setPopups(allPopups)
    } catch (error) {
      console.error('Error loading popups:', error)
      toast.error('Error al cargar los anuncios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPopup(null)
    setIsFormOpen(true)
  }

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup)
    setIsFormOpen(true)
  }

  const handleDelete = (popup: Popup) => {
    setPopupToDelete(popup)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!popupToDelete) return

    try {
      await adService.delete(popupToDelete.id)
      toast.success('Anuncio eliminado')
      loadPopups()
      setDeleteDialogOpen(false)
      setPopupToDelete(null)
    } catch (error) {
      console.error('Error deleting popup:', error)
      toast.error('Error al eliminar el anuncio')
    }
  }

  const handleToggleStatus = async (popup: Popup) => {
    try {
      const newStatus: PopupStatus = popup.status === 'active' ? 'inactive' : 'active'
      await adService.updatePopup({
        id: popup.id,
        status: newStatus,
      })
      toast.success(`Anuncio ${newStatus === 'active' ? 'activado' : 'desactivado'}`)
      loadPopups()
    } catch (error) {
      console.error('Error updating popup status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingPopup(null)
    loadPopups()
  }

  const filteredPopups = statusFilter === 'all' 
    ? popups 
    : popups.filter(p => p.status === statusFilter)

  const getStatusBadge = (status: PopupStatus) => {
    const variants: Record<PopupStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      scheduled: 'outline',
      expired: 'destructive',
    }
    const labels: Record<PopupStatus, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      scheduled: 'Programado',
      expired: 'Expirado',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anuncios</h1>
          <p className="text-muted-foreground">
            Crea y gestiona popups que aparecerán en la tienda
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Anuncio
        </Button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('active')}
        >
          Activos
        </Button>
        <Button
          variant={statusFilter === 'inactive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('inactive')}
        >
          Inactivos
        </Button>
        <Button
          variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('scheduled')}
        >
          Programados
        </Button>
      </div>

      {/* Tabla de anuncios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Anuncios</CardTitle>
          <CardDescription>
            {filteredPopups.length} anuncio{filteredPopups.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando anuncios...
            </div>
          ) : filteredPopups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay anuncios. Crea uno nuevo para comenzar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPopups.map((popup) => (
                  <TableRow key={popup.id}>
                    <TableCell className="font-medium">{popup.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{popup.position}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{popup.trigger}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(popup.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                          <Eye className="h-3 w-3 inline mr-1" />
                          {popup.views || 0}
                        </span>
                        <span>
                          <BarChart3 className="h-3 w-3 inline mr-1" />
                          {popup.clicks || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {popup.startDate || popup.endDate ? (
                        <div className="text-sm text-muted-foreground">
                          {popup.startDate && (
                            <div>Inicio: {new Date(popup.startDate).toLocaleDateString()}</div>
                          )}
                          {popup.endDate && (
                            <div>Fin: {new Date(popup.endDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(popup)}
                          title={popup.status === 'active' ? 'Desactivar' : 'Activar'}
                        >
                          {popup.status === 'active' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(popup)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(popup)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Formulario de crear/editar */}
      <PopupForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        popup={editingPopup}
        onSuccess={handleFormSuccess}
        createdBy={user?.id || ''}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar anuncio?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El anuncio será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



