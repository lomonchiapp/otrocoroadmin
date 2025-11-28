import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { userService } from '@/services/userService'
import { useState, useEffect } from 'react'
import type { User } from './data/schema'

const route = getRouteApi('/_authenticated/system/users')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
    
    // Escuchar evento de refresh
    const handleRefresh = () => {
      loadUsers()
    }
    
    window.addEventListener('users-refresh', handleRefresh)
    
    return () => {
      window.removeEventListener('users-refresh', handleRefresh)
    }
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <NotificationBell />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Usuarios</h2>
            <p className='text-muted-foreground'>
              Administra usuarios del sistema y sus roles (Admins, Editores, Vendedores, Clientes).
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : (
            <UsersTable data={users} search={search} navigate={navigate} onRefresh={loadUsers} />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
