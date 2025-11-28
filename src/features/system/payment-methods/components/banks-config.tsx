import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Building2, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Bank, BankAccount } from '@/types/payments'
import { bankService } from '@/services/bankService'
import { toast } from 'sonner'

export function BanksConfig() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [bankFormData, setBankFormData] = useState({
    name: '',
    code: '',
    isActive: true
  })

  const [accountFormData, setAccountFormData] = useState({
    accountNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
    accountHolder: '',
    currency: 'DOP' as 'DOP' | 'USD',
    isActive: true,
    notes: ''
  })

  useEffect(() => {
    loadBanks()
  }, [])

  const loadBanks = async () => {
    try {
      setIsLoading(true)
      const banksData = await bankService.getAllBanks()
      setBanks(banksData)
    } catch (error) {
      console.error('Error loading banks:', error)
      toast.error('Error al cargar los bancos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBank = async () => {
    if (!bankFormData.name || !bankFormData.code) {
      toast.error('Nombre y código son requeridos')
      return
    }

    try {
      setIsSaving(true)

      if (editingBank) {
        // Actualizar banco existente
        await bankService.updateBank(editingBank.id, {
          name: bankFormData.name,
          code: bankFormData.code,
          isActive: bankFormData.isActive,
        })
        toast.success('Banco actualizado exitosamente')
      } else {
        // Crear nuevo banco
        await bankService.createBank({
          name: bankFormData.name,
          code: bankFormData.code,
          isActive: bankFormData.isActive,
        })
        toast.success('Banco creado exitosamente')
      }

      setIsBankDialogOpen(false)
      setEditingBank(null)
      setBankFormData({ name: '', code: '', isActive: true })
      await loadBanks() // Recargar bancos
    } catch (error) {
      console.error('Error saving bank:', error)
      toast.error('Error al guardar el banco')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAccount = async () => {
    if (!selectedBank) {
      toast.error('Selecciona un banco primero')
      return
    }

    if (!accountFormData.accountNumber || !accountFormData.accountHolder) {
      toast.error('Número de cuenta y titular son requeridos')
      return
    }

    try {
      setIsSaving(true)

      await bankService.createAccount({
        bankId: selectedBank.id,
        accountNumber: accountFormData.accountNumber,
        accountType: accountFormData.accountType,
        accountHolder: accountFormData.accountHolder,
        currency: accountFormData.currency,
        isActive: accountFormData.isActive,
        notes: accountFormData.notes,
      })

      toast.success('Cuenta creada exitosamente')
      setIsAccountDialogOpen(false)
      setAccountFormData({
        accountNumber: '',
        accountType: 'checking',
        accountHolder: '',
        currency: 'DOP',
        isActive: true,
        notes: '',
      })
      await loadBanks() // Recargar bancos con las nuevas cuentas
    } catch (error) {
      console.error('Error saving account:', error)
      toast.error('Error al crear la cuenta')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank)
    setBankFormData({
      name: bank.name,
      code: bank.code,
      isActive: bank.isActive
    })
    setIsBankDialogOpen(true)
  }

  const handleDeleteBank = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banco? Esto eliminará todas sus cuentas.')) {
      return
    }

    try {
      setIsSaving(true)
      await bankService.deleteBank(id)
      toast.success('Banco eliminado exitosamente')
      await loadBanks() // Recargar bancos
    } catch (error) {
      console.error('Error deleting bank:', error)
      toast.error('Error al eliminar el banco')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async (bankId: string, accountId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta?')) {
      return
    }

    try {
      setIsSaving(true)
      await bankService.deleteAccount(accountId)
      toast.success('Cuenta eliminada exitosamente')
      await loadBanks() // Recargar bancos
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Error al eliminar la cuenta')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bancos y Cuentas Bancarias</h2>
          <p className="text-muted-foreground">
            Configura los bancos y cuentas para recibir pagos por transferencia
          </p>
        </div>
        <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBank(null)
              setBankFormData({ name: '', code: '', isActive: true })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Banco
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBank ? 'Editar Banco' : 'Nuevo Banco'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre del Banco</Label>
                <Input
                  value={bankFormData.name}
                  onChange={(e) => setBankFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Banco Popular"
                />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  value={bankFormData.code}
                  onChange={(e) => setBankFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="Ej: BPD"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={bankFormData.isActive}
                  onCheckedChange={(checked) => setBankFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Activo</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBankDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveBank} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : editingBank ? (
                    'Actualizar'
                  ) : (
                    'Crear'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="banks" className="w-full">
        <TabsList>
          <TabsTrigger value="banks">Bancos</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
        </TabsList>

        <TabsContent value="banks" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">Cargando bancos...</p>
              </CardContent>
            </Card>
          ) : banks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay bancos configurados</p>
              </CardContent>
            </Card>
          ) : (
            banks.map((bank) => (
              <Card key={bank.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {bank.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBank(bank)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBank(bank.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Código:</span>
                      <span className="font-medium">{bank.code}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Cuentas:</span>
                      <span className="font-medium">{bank.accounts.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        bank.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bank.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  if (banks.length === 0) {
                    toast.error('Primero debes crear un banco')
                    return
                  }
                  setSelectedBank(banks[0])
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Cuenta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Cuenta Bancaria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Banco</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={selectedBank?.id || ''}
                      onChange={(e) => {
                        const bank = banks.find(b => b.id === e.target.value)
                        setSelectedBank(bank || null)
                      }}
                    >
                      <option value="">Selecciona un banco</option>
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Número de Cuenta</Label>
                    <Input
                      value={accountFormData.accountNumber}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Ej: 1234567890"
                    />
                  </div>
                  <div>
                    <Label>Titular</Label>
                    <Input
                      value={accountFormData.accountHolder}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                      placeholder="Ej: Otro Coro Fashion SRL"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Cuenta</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={accountFormData.accountType}
                        onChange={(e) => setAccountFormData(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                      >
                        <option value="checking">Corriente</option>
                        <option value="savings">Ahorros</option>
                      </select>
                    </div>
                    <div>
                      <Label>Moneda</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={accountFormData.currency}
                        onChange={(e) => setAccountFormData(prev => ({ ...prev, currency: e.target.value as 'DOP' | 'USD' }))}
                      >
                        <option value="DOP">DOP</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Notas (opcional)</Label>
                    <Input
                      value={accountFormData.notes}
                      onChange={(e) => setAccountFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Información adicional"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={accountFormData.isActive}
                      onCheckedChange={(checked) => setAccountFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Activa</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveAccount} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Crear'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {banks.flatMap(bank => bank.accounts).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay cuentas configuradas</p>
              </CardContent>
            </Card>
          ) : (
            banks.map(bank => 
              bank.accounts.map(account => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {bank.name} - {account.accountNumber}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(bank.id, account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Titular:</span>
                        <span className="font-medium">{account.accountHolder}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{account.accountType === 'checking' ? 'Corriente' : 'Ahorros'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Moneda:</span>
                        <span className="font-medium">{account.currency}</span>
                      </div>
                      {account.notes && (
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">Notas:</span>
                          <span className="text-sm">{account.notes}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

