import { useState, useEffect } from 'react'
import { usePosStore } from '@/stores/pos-store'
import { useCurrentStore } from '@/hooks/use-current-store'
import { auth as firebaseAuth } from '@/lib/firebase'
import { posService } from '@/services/posService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  DollarSign, 
  LogOut, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Monitor,
  Users,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

interface Register {
  id: string
  name: string
  isActive: boolean
}

const DEFAULT_REGISTERS: Register[] = [
  { id: 'CAJA-1', name: 'Caja Principal', isActive: false },
  { id: 'CAJA-2', name: 'Caja Secundaria', isActive: false },
  { id: 'CAJA-3', name: 'Caja Express', isActive: false },
  { id: 'CAJA-4', name: 'Caja 4', isActive: false },
]

export function ShiftManager() {
  const { store, isLoading: isLoadingStore, hasStore } = useCurrentStore()
  const { setSession } = usePosStore()
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null)
  const [openingBalance, setOpeningBalance] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSessions, setActiveSessions] = useState<Array<{ registerId: string; registerName: string }>>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  
  // Obtener usuario actual de Firebase Auth
  const currentUser = firebaseAuth.currentUser

  // Cargar cajas activas cuando cambie la tienda
  useEffect(() => {
    if (!store?.id || isLoadingStore) return
    
    const loadActiveSessions = async () => {
      setIsLoadingSessions(true)
      try {
        const sessions = await posService.getActiveSessionsByStore(store.id)
        setActiveSessions(sessions.map(s => ({ 
          registerId: s.registerId, 
          registerName: s.registerName || s.registerId 
        })))
      } catch (error) {
        console.error('Error loading active sessions:', error)
      } finally {
        setIsLoadingSessions(false)
      }
    }

    loadActiveSessions()
  }, [store?.id, isLoadingStore])

  const handleOpenSession = async () => {
    if (!store || !currentUser || !selectedRegisterId) {
      if (!currentUser) {
        toast.error('Debes estar autenticado para abrir una caja')
        return
      }
      if (!selectedRegisterId) {
        toast.error('Seleccione una caja para continuar')
        return
      }
      return
    }
    
    // Buscar el registro seleccionado desde el array actualizado
    const selectedRegister = registersWithStatus.find(r => r.id === selectedRegisterId)
    if (!selectedRegister) {
      toast.error('Caja seleccionada no encontrada')
      return
    }
    
    const balance = parseFloat(openingBalance)
    if (isNaN(balance) || balance < 0) {
      toast.error('Ingrese un monto válido')
      return
    }

    setIsLoading(true)
    try {
      // Usar el UID de Firebase Auth como userId
      await posService.openSession(
        currentUser.uid,
        store.id,
        selectedRegister.id,
        selectedRegister.name,
        balance,
        notes
      )
      
      // Obtener la sesión creada y actualizar el store
      const session = await posService.getActiveSessionByRegister(store.id, selectedRegister.id)
      if (session) {
        setSession(session)
        toast.success(`Caja ${selectedRegister.name} abierta exitosamente`)
      }
    } catch (error: any) {
      console.error('Error opening session:', error)
      toast.error(error.message || 'Error al abrir la caja')
    } finally {
      setIsLoading(false)
    }
  }

  // Marcar cajas activas
  const registersWithStatus = DEFAULT_REGISTERS.map(reg => ({
    ...reg,
    isActive: activeSessions.some(s => s.registerId === reg.id)
  }))

  // Obtener el registro seleccionado actualizado
  const selectedRegister = selectedRegisterId 
    ? registersWithStatus.find(r => r.id === selectedRegisterId) || null
    : null

  if (isLoadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
            <h3 className="text-lg font-semibold mb-2">Cargando tienda...</h3>
            <p className="text-sm text-muted-foreground">
              Por favor espera mientras se carga la información de la tienda.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasStore || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No hay tienda seleccionada</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Para abrir una caja, primero debes seleccionar una tienda desde el selector en la barra lateral.
            </p>
            <Button asChild className="w-full">
              <Link to="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Ir al Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Gestión de Cajas</h1>
          <p className="text-muted-foreground">
            Selecciona una caja para iniciar un nuevo turno en <strong>{store.name}</strong>
          </p>
        </div>

        {/* Cajas Disponibles */}
        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Cajas Disponibles
            </CardTitle>
            <CardDescription>
              Selecciona una caja para abrir un nuevo turno
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando cajas...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {registersWithStatus.map((register) => (
                  <button
                    key={register.id}
                    onClick={() => setSelectedRegisterId(register.id)}
                    disabled={register.isActive}
                    className={cn(
                      "relative p-6 rounded-xl border-2 transition-all text-left",
                      "hover:shadow-lg hover:scale-105 active:scale-95",
                      selectedRegisterId === register.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/50",
                      register.isActive && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {register.isActive && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Abierta
                      </Badge>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Monitor className={cn(
                          "h-5 w-5",
                          selectedRegisterId === register.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-semibold text-sm">{register.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{register.id}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de Apertura */}
        {selectedRegister && !selectedRegister.isActive && (
          <Card className="shadow-xl border-2 animate-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Abrir Caja: {selectedRegister.name}
              </CardTitle>
              <CardDescription>
                Ingresa el fondo inicial de efectivo para comenzar el turno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-base font-medium">
                  Fondo de Caja (Efectivo Inicial)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-12 h-14 text-2xl font-bold"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingrese el monto total de efectivo en caja antes de iniciar operaciones.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Observaciones sobre el turno..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedRegisterId(null)
                    setOpeningBalance('')
                    setNotes('')
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 font-bold text-lg h-12" 
                  onClick={handleOpenSession}
                  disabled={isLoading || !openingBalance || !selectedRegister}
                >
                  {isLoading ? 'Abriendo...' : `Abrir ${selectedRegister?.name || 'Caja'}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cajas Activas */}
        {activeSessions.length > 0 && (
          <Card className="shadow-lg border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Cajas Activas ({activeSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {activeSessions.map((session) => (
                  <Badge key={session.registerId} variant="secondary" className="px-3 py-1.5">
                    <CheckCircle2 className="h-3 w-3 mr-1.5 text-green-500" />
                    {session.registerName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
