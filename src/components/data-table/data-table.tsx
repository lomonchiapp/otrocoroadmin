import { useState, useEffect } from 'react'
import { type ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, type RowSelectionState } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onSelectedRowsChange?: (rows: string[]) => void
  loading?: boolean
  searchKey?: string
  searchValue?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectedRowsChange,
  loading = false,
  searchKey,
  searchValue,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Filtrar datos si hay búsqueda
  const filteredData = searchKey && searchValue
    ? data.filter((item: TData) => {
        const value = (item as Record<string, unknown>)[searchKey]
        return value && value.toString().toLowerCase().includes(searchValue.toLowerCase())
      })
    : data

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    pageCount: pagination?.totalPages || 1,
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newRowSelection)
      if (onSelectedRowsChange) {
        const selectedIds = Object.keys(newRowSelection).filter(key => newRowSelection[key])
        onSelectedRowsChange(selectedIds)
      }
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(table.getState().pagination) : updater
      table.setState(prev => ({ ...prev, pagination: newPagination }))
    },
    state: {
      rowSelection,
      pagination: {
        pageIndex: (pagination?.page || 1) - 1,
        pageSize: pagination?.limit || 10,
      },
    },
  })

  // Sincronizar paginación externa con el table
  useEffect(() => {
    const currentPage = (pagination?.page || 1) - 1
    const currentPageSize = pagination?.limit || 10

    if (table.getState().pagination.pageIndex !== currentPage ||
        table.getState().pagination.pageSize !== currentPageSize) {
      table.setPageIndex(currentPage)
      table.setPageSize(currentPageSize)
    }
  }, [pagination, table])

  // Sincronizar paginación externa con el table
  useEffect(() => {
    const currentPage = (pagination?.page || 1) - 1
    const currentPageSize = pagination?.limit || 10

    if (table.getState().pagination.pageIndex !== currentPage ||
        table.getState().pagination.pageSize !== currentPageSize) {
      table.setPageIndex(currentPage)
      table.setPageSize(currentPageSize)
    }
  }, [pagination, table])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, index) => (
                  <TableHead key={index}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  )
}