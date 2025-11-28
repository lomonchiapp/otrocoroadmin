import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { OtrocoroLogo } from '@/components/otrocoro-logo'
import { Home, ArrowLeft, Search } from 'lucide-react'

export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  
  return (
    <div className='h-svh relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500' />
      </div>

      <div className='relative h-full flex flex-col items-center justify-center gap-8 p-8'>
        {/* Logo */}
        <div className='animate-bounce-slow'>
          <OtrocoroLogo className='h-16 w-auto' showText />
        </div>

        {/* 404 Animation */}
        <div className='relative'>
          <h1 className='text-[12rem] md:text-[16rem] font-bold leading-none bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-pulse'>
            404
          </h1>
          <div className='absolute inset-0 text-[12rem] md:text-[16rem] font-bold leading-none text-primary/20 blur-xl'>
            404
          </div>
        </div>

        {/* Content */}
        <div className='text-center space-y-4 max-w-md'>
          <h2 className='text-3xl md:text-4xl font-bold'>
            Página no encontrada
          </h2>
          <p className='text-muted-foreground text-lg'>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <p className='text-sm text-muted-foreground/80'>
            Puede que el enlace esté roto o que hayas escrito mal la URL.
          </p>
        </div>

        {/* Actions */}
        <div className='flex flex-col sm:flex-row gap-4 mt-4'>
          <Button 
            variant='outline' 
            size='lg'
            onClick={() => history.go(-1)}
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver
          </Button>
          <Button 
            size='lg'
            onClick={() => navigate({ to: '/' })}
            className='gap-2'
          >
            <Home className='h-4 w-4' />
            Ir al Dashboard
          </Button>
        </div>

        {/* Search suggestion */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-muted-foreground mb-2'>
            ¿Buscas algo específico?
          </p>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              // Trigger search
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                metaKey: true,
              })
              window.dispatchEvent(event)
            }}
            className='gap-2'
          >
            <Search className='h-4 w-4' />
            Presiona Ctrl+K para buscar
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}
