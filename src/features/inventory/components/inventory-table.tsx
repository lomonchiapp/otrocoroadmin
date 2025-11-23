import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type StockItem, type InventoryStatus } from '@/types'

interface InventoryTableProps {
  data: StockItem[]
  onEdit?: (item: StockItem) => void
  onAdjust?: (item: StockItem) => void
  onTransfer?: (item: StockItem) => void
  onViewHistory?: (item: StockItem) => void
}

const statusColors: Record<InventoryStatus, string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-blue-100 text-blue-800',
  damaged: 'bg-red-100 text-red-800',
  returned: 'bg-purple-100 text-purple-800',
  transferred: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<InventoryStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
  damaged: 'Dañado',
  returned: 'Devuelto',
  transferred: 'Transferido',
}

export function InventoryTable({ data, onEdit, onAdjust, onTransfer, onViewHistory }: InventoryTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const columns: ColumnDef<StockItem>[] = [
    {
      accessorKey: 'productId',
      header: 'Producto',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{item.productId}</div>
              {item.variationId && (
                <div className="text-sm text-muted-foreground">
                  {Object.entries(item.variationAttributes).map(([key, value]) => (
                    <span key={key} className="mr-2">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'locationName',
      header: 'Ubicación',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('locationName')}</div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Cantidad Total',
      cell: ({ row }) => {
        const quantity = row.getValue('quantity') as number
        return (
          <div className="text-center font-mono">
            {quantity}
          </div>
        )
      },
    },
    {
      accessorKey: 'availableQuantity',
      header: 'Disponible',
      cell: ({ row }) => {
        const available = row.getValue('availableQuantity') as number
        const reserved = row.original.reservedQuantity
        return (
          <div className="text-center">
            <div className="font-mono font-medium">{available}</div>
            {reserved > 0 && (
              <div className="text-xs text-muted-foreground">
                -{reserved} reservado
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as InventoryStatus
        return (
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Precio',
      cell: ({ row }) => {
        const price = row.getValue('sellingPrice') as number
        return price ? (
          <div className="text-right font-mono">
            ${price.toLocaleString()}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'lastMovementAt',
      header: 'Último Movimiento',
      cell: ({ row }) => {
        const date = row.getValue('lastMovementAt') as Date
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      id: 'stockStatus',
      header: 'Estado Stock',
      cell: ({ row }) => {
        const available = row.original.availableQuantity
        const total = row.original.quantity
        
        if (available === 0) {
          return (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm">Sin Stock</span>
            </div>
          )
        }
        
        if (available <= 5) {
          return (
            <div className="flex items-center text-yellow-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-sm">Bajo Stock</span>
            </div>
          )
        }
        
        return (
          <div className="flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">Normal</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit?.(item)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAdjust?.(item)}>
                Ajustar Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTransfer?.(item)}>
                Transferir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewHistory?.(item)}>
                Ver Historial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
    />
  )
}