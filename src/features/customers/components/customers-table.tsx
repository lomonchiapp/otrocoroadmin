import { Mail, Phone, MapPin, ShoppingBag, MoreHorizontal, Eye, Edit, Trash2, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Customer } from '@/types/customers'

interface CustomersTableProps {
  customers: Customer[]
  isLoading: boolean
  searchQuery: string
  onEditCustomer: (customer: Customer) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export function CustomersTable({ customers, isLoading, searchQuery, onEditCustomer }: CustomersTableProps) {
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Desktop skeleton */}
        <div className="hidden md:block space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (filteredCustomers.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No se encontraron clientes</p>
        <p className="text-sm text-muted-foreground mt-2">
          {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Los clientes registrados aparecerán aquí'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Desktop view */}
      <div className="hidden md:block space-y-3">
        {filteredCustomers.map((customer) => {
          const fullName = `${customer.firstName} ${customer.lastName}`
          const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()
          
          return (
            <div
              key={customer.id}
              className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Info */}
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{fullName}</h3>
                      {customer.userType === 'wholesale' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Mayorista
                        </Badge>
                      )}
                      {customer.segment === 'vip' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          VIP
                        </Badge>
                      )}
                      <Badge
                        variant={customer.status === 'active' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          customer.status === 'active' ? 'bg-green-100 text-green-800' :
                          customer.status === 'blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {customer.status === 'active' ? 'Activo' : customer.status === 'blocked' ? 'Bloqueado' : 'Inactivo'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.businessName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{customer.businessName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              {/* Stats */}
              <div className="hidden lg:flex items-center gap-6 mr-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Pedidos</p>
                  <p className="font-semibold text-sm">{customer.totalOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Gastado</p>
                  <p className="font-semibold text-sm">{formatCurrency(customer.totalSpent)}</p>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Ver Pedidos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Ban className="mr-2 h-4 w-4" /> Bloquear
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((customer) => {
          const fullName = `${customer.firstName} ${customer.lastName}`
          const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()
          
          return (
            <div
              key={customer.id}
              className="bg-card border rounded-lg p-4 active:bg-muted/50 transition-colors touch-manipulation"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm truncate">{fullName}</h3>
                    {customer.userType === 'wholesale' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        Mayorista
                      </Badge>
                    )}
                    {customer.segment === 'vip' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        VIP
                      </Badge>
                    )}
                  </div>

                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' :
                      customer.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {customer.status === 'active' ? 'Activo' : customer.status === 'blocked' ? 'Bloqueado' : 'Inactivo'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {customer.totalOrders} pedidos
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Ver Pedidos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
        })}
      </div>
    </div>
  )
}
