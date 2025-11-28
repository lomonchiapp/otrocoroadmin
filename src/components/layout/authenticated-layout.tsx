import { Outlet } from '@tanstack/react-router'
import { useStoreInitialization } from '@/hooks/use-store-initialization'
import { getCookie } from '@/lib/cookies'
import { LayoutProvider } from '@/context/layout-provider'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { cn } from '@/lib/utils'
import { NotificationInitializer } from '@/components/notifications/NotificationInitializer'
import { CommandMenu } from '@/components/command-menu'
import { SearchInitializer } from '@/components/search-initializer'
import { AuthInitializer } from '@/components/auth-initializer'
import { useAuth } from '@/hooks/use-auth'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { loading: authLoading } = useAuth()

  // Initialize stores
  const { isLoading: storeLoading } = useStoreInitialization()

  // Mostrar loading mientras se inicializa la autenticación
  if (authLoading || storeLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <LayoutProvider>
      <AuthInitializer />
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <SidebarInset
          className={cn(
            // Set content container, so we can use container queries
            '@container/content',

            // If layout is fixed, set the height
            // to 100svh to prevent overflow
            'has-[[data-layout=fixed]]:h-svh',

            // If layout is fixed and sidebar is inset,
            // set the height to 100svh - spacing (total margins) to prevent overflow
            'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
          )}
        >
          {children ?? <Outlet />}
        </SidebarInset>
      </SidebarProvider>
      <NotificationInitializer />
      <SearchInitializer />
      <CommandMenu />
    </LayoutProvider>
  )
}
