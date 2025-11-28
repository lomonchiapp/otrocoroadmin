import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Power, PowerOff, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Store } from '@/types/stores'

interface StoresTableProps {
  stores: Store[]
  onEdit: (store: Store) => void
  onToggleStatus: (store: Store) => void
  onViewDetails: (store: Store) => void
  isLoading?: boolean
}

export function StoresTable({
  stores,
  onEdit,
  onToggleStatus,
  onViewDetails,
  isLoading,
}: StoresTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando tiendas...</div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-2">No hay tiendas registradas</div>
        <div className="text-sm text-muted-foreground">
          Crea tu primera tienda para comenzar
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {store.logo && (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <div>{store.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {store.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={store.type === 'fashion' ? 'default' : 'secondary'}>
                  {store.type === 'fashion' ? 'Moda' : 'Joyería'}
                </Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {store.slug}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant={store.isActive ? 'success' : 'destructive'}>
                  {store.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell>
                {format(store.createdAt, 'dd MMM yyyy', { locale: es })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(store)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(store)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleStatus(store)}>
                      {store.isActive ? (
                        <>
                          <PowerOff className="mr-2 h-4 w-4" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Power className="mr-2 h-4 w-4" />
                          Activar
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}



