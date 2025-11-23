import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreStore } from '@/stores/store-store'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { isMobile } = useSidebar()
  const { store: currentStore } = useCurrentStore()
  const { availableStores, setCurrentStore } = useStoreStore()
  
  // Mapear tiendas disponibles a teams
  const storeTeams = availableStores.map(store => ({
    id: store.id,
    name: store.name,
    logo: store.type === 'fashion' ? teams[0].logo : teams[1].logo,
    plan: store.type === 'fashion' ? 'Tienda de Moda' : 'Joyería de Prestigio',
    type: store.type
  }))
  
  
  const activeTeam = storeTeams.find(team => team.id === currentStore?.id) || storeTeams[0]
  
  const handleTeamSelect = (team: typeof storeTeams[0]) => {
    const store = availableStores.find(s => s.id === team.id)
    if (store) {
      setCurrentStore(store)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <activeTeam.logo className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs'>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Tiendas
            </DropdownMenuLabel>
            {storeTeams.map((team, index) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <team.logo className='size-4 shrink-0' />
                </div>
                <div className='flex flex-col'>
                  <span className='font-medium'>{team.name}</span>
                  <span className='text-xs text-muted-foreground'>{team.plan}</span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>Agregar tienda</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
