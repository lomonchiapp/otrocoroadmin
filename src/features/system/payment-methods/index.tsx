import { useState, useEffect } from 'react'
import { CreditCard, Wallet, Building2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BanksConfig } from './components/banks-config'
import { toast } from 'sonner'

interface PayPalConfig {
  clientId: string
  clientSecret: string
  mode: 'sandbox' | 'live'
  isActive: boolean
}

export function PaymentMethodsConfig() {
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig>({
    clientId: '',
    clientSecret: '',
    mode: 'sandbox',
    isActive: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Cargar configuración desde Firestore (simulado por ahora)
  useEffect(() => {
    // TODO: Cargar desde Firestore
    const savedConfig = localStorage.getItem('paypal-config')
    if (savedConfig) {
      try {
        setPaypalConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Error loading PayPal config:', error)
      }
    }
  }, [])

  const handleSavePayPal = async () => {
    if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
      toast.error('Client ID y Client Secret son requeridos')
      return
    }

    setIsSaving(true)
    try {
      // TODO: Guardar en Firestore
      localStorage.setItem('paypal-config', JSON.stringify(paypalConfig))
      toast.success('Configuración de PayPal guardada')
    } catch (error) {
      console.error('Error saving PayPal config:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePayPal = async (isActive: boolean) => {
    setPaypalConfig(prev => ({ ...prev, isActive }))
    // Guardar automáticamente
    localStorage.setItem('paypal-config', JSON.stringify({ ...paypalConfig, isActive }))
    toast.success(`PayPal ${isActive ? 'activado' : 'desactivado'}`)
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
        {/* Header */}
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Métodos de Pago</h2>
          <p className='text-muted-foreground'>
            Configura los métodos de pago disponibles para tus clientes
          </p>
        </div>

        <Tabs defaultValue='paypal' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='paypal' className='gap-2'>
              <Wallet className='h-4 w-4' />
              PayPal
            </TabsTrigger>
            <TabsTrigger value='banks' className='gap-2'>
              <Building2 className='h-4 w-4' />
              Bancos
            </TabsTrigger>
            <TabsTrigger value='azul' className='gap-2'>
              <CreditCard className='h-4 w-4' />
              Azul
            </TabsTrigger>
          </TabsList>

          {/* PayPal Configuration */}
          <TabsContent value='paypal' className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <Wallet className='h-5 w-5' />
                      Configuración de PayPal
                    </CardTitle>
                    <CardDescription>
                      Configura las credenciales de PayPal para procesar pagos
                    </CardDescription>
                  </div>
                  <Switch
                    checked={paypalConfig.isActive}
                    onCheckedChange={handleTogglePayPal}
                  />
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                  <div>
                    <p className='font-medium'>Estado</p>
                    <p className='text-sm text-muted-foreground'>
                      {paypalConfig.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium'>Modo</p>
                    <p className='text-sm text-muted-foreground'>
                      {paypalConfig.mode === 'sandbox' ? 'Sandbox (Pruebas)' : 'Producción'}
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Client ID</Label>
                    <Input
                      type='password'
                      value={paypalConfig.clientId}
                      onChange={(e) =>
                        setPaypalConfig(prev => ({ ...prev, clientId: e.target.value }))
                      }
                      placeholder='Ingresa tu Client ID'
                    />
                  </div>
                  <div>
                    <Label>Client Secret</Label>
                    <Input
                      type='password'
                      value={paypalConfig.clientSecret}
                      onChange={(e) =>
                        setPaypalConfig(prev => ({ ...prev, clientSecret: e.target.value }))
                      }
                      placeholder='Ingresa tu Client Secret'
                    />
                  </div>
                </div>

                <div>
                  <Label>Modo</Label>
                  <div className='flex gap-4 mt-2'>
                    <Button
                      variant={paypalConfig.mode === 'sandbox' ? 'default' : 'outline'}
                      onClick={() =>
                        setPaypalConfig(prev => ({ ...prev, mode: 'sandbox' }))
                      }
                    >
                      Sandbox
                    </Button>
                    <Button
                      variant={paypalConfig.mode === 'live' ? 'default' : 'outline'}
                      onClick={() =>
                        setPaypalConfig(prev => ({ ...prev, mode: 'live' }))
                      }
                    >
                      Producción
                    </Button>
                  </div>
                </div>

                <div className='flex justify-end gap-2 pt-4'>
                  <Button onClick={handleSavePayPal} disabled={isSaving}>
                    <Save className='h-4 w-4 mr-2' />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banks Configuration */}
          <TabsContent value='banks' className='space-y-4'>
            <BanksConfig />
          </TabsContent>

          {/* Azul Configuration */}
          <TabsContent value='azul' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CreditCard className='h-5 w-5' />
                  Configuración de Azul
                </CardTitle>
                <CardDescription>
                  Configura las credenciales de Azul para procesar pagos con tarjeta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8 text-muted-foreground'>
                  <p>Configuración de Azul próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



