import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ErrorComponent } from '@tanstack/react-router'
import { PageError } from '@/features/errors/page-error'
import { Button } from '@/components/ui/button'
import { LayoutProvider } from '@/context/layout-provider'
import { CommandMenu } from '@/components/command-menu'
import { SearchInitializer } from '@/components/search-initializer'

export const Route = createFileRoute('/_authenticated/errors/$error')({
  component: RouteError,
})

function RouteError() {
  const error = Route.useParams().error
  const router = useRouter()

  return (
    <LayoutProvider>
      <div className='flex h-svh flex-col items-center justify-center gap-4'>
        <PageError />
        <div className='text-center'>
          <p className='text-muted-foreground'>Error code: {error}</p>
          <Button variant='outline' className='mt-4' onClick={() => router.history.back()}>
            Go back
          </Button>
        </div>
      </div>
      <SearchInitializer />
      <CommandMenu />
    </LayoutProvider>
  )
}
