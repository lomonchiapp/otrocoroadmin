import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { authService } from '@/services/authService'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // Verificar si hay un usuario autenticado
    const currentUser = authService.getCurrentUser()
    
    if (!currentUser) {
      // Redirigir a login con la ruta actual como redirect
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Verificar que el usuario es admin activo
    try {
      const adminUser = await authService.getAdminUserById(currentUser.uid)
      if (!adminUser || adminUser.status !== 'active') {
        await authService.signOut()
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
            error: 'unauthorized',
          },
        })
      }
    } catch (error) {
      // Si hay error verificando, redirigir a login
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
