import * as React from 'react'
import { Check, ChevronsUpDown, Store as StoreIcon, Plus, Settings } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useStoreStore, useCurrentStore, useStorePermissions } from '@/stores/store-store'
import type { Store } from '@/types'

interface StoreSwitcherProps {
  className?: string
}

export function StoreSwitcher({ className }: StoreSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  
  const { availableStores, setCurrentStore, setLoading } = useStoreStore()
  const { store: currentStore, storeName, storeColor } = useCurrentStore()
  const { hasStoreAccess, isSuperAdmin } = useStorePermissions()
  
  // Filtrar tiendas basado en permisos
  const accessibleStores = availableStores.filter(store => 
    isSuperAdmin || hasStoreAccess(store.id)
  )
  
  const handleStoreSelect = (store: Store) => {
    if (currentStore?.id === store.id) return
    
    setLoading(true)
    setCurrentStore(store)
    setOpen(false)
    
    // Simular carga de datos de la tienda
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }
  
  const getStoreIcon = (storeType: 'fashion' | 'jewelry') => {
    switch (storeType) {
      case 'fashion':
        return '👗'
      case 'jewelry':
        return '💎'
      default:
        return '🏪'
    }
  }
  
  const getStoreTypeLabel = (storeType: 'fashion' | 'jewelry') => {
    switch (storeType) {
      case 'fashion':
        return 'Moda'
      case 'jewelry':
        return 'Joyería'
      default:
        return 'Tienda'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar tienda"
          className={cn('w-[200px] justify-between', className)}
          style={{
            borderColor: currentStore ? storeColor : undefined,
          }}
        >
          <div className="flex items-center gap-2">
            {currentStore ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={currentStore.logo} />
                  <AvatarFallback className="text-xs">
                    {getStoreIcon(currentStore.type)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{storeName}</span>
              </>
            ) : (
              <>
                <StoreIcon className="h-4 w-4" />
                <span>Seleccionar tienda</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar tienda..." />
          <CommandEmpty>No se encontraron tiendas.</CommandEmpty>
          
          <CommandList>
            {accessibleStores.length > 0 && (
              <CommandGroup heading="Tiendas disponibles">
                {accessibleStores.map((store) => (
                  <CommandItem
                    key={store.id}
                    value={store.name}
                    onSelect={() => handleStoreSelect(store)}
                    className="text-sm"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={store.logo} />
                          <AvatarFallback className="text-xs">
                            {getStoreIcon(store.type)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col">
                          <span className="font-medium">{store.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {getStoreTypeLabel(store.type)}
                            </Badge>
                            {!store.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Inactiva
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4',
                          currentStore?.id === store.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {isSuperAdmin && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      // TODO: Implementar modal para crear nueva tienda
                      console.log('Crear nueva tienda')
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Crear nueva tienda</span>
                  </CommandItem>
                  
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      // TODO: Navegar a configuración de tiendas
                      console.log('Gestionar tiendas')
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Gestionar tiendas</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Componente para mostrar información de la tienda actual
export function CurrentStoreInfo() {
  const { store: currentStore } = useCurrentStore()
  
  if (!currentStore) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <StoreIcon className="h-4 w-4" />
        <span className="text-sm">No hay tienda seleccionada</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={currentStore.logo} />
        <AvatarFallback className="text-xs">
          {currentStore.type === 'fashion' ? '👗' : '💎'}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{currentStore.name}</span>
        <span className="text-xs text-muted-foreground">
          {currentStore.type === 'fashion' ? 'Moda' : 'Joyería'}
        </span>
      </div>
    </div>
  )
}
