import { useState } from 'react'
import { Plus, Edit, Trash2, Building2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Bank, BankAccount } from '@/types/payments'
import { toast } from 'sonner'

export function BanksConfig() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)

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

  const handleSaveBank = () => {
    if (!bankFormData.name || !bankFormData.code) {
      toast.error('Nombre y código son requeridos')
      return
    }

    const bank: Bank = {
      id: editingBank?.id || `bank-${Date.now()}`,
      ...bankFormData,
      accounts: editingBank?.accounts || [],
      createdAt: editingBank?.createdAt || new Date(),
      updatedAt: new Date()
    }

    if (editingBank) {
      setBanks(prev => prev.map(b => b.id === editingBank.id ? bank : b))
      toast.success('Banco actualizado')
    } else {
      setBanks(prev => [...prev, bank])
      toast.success('Banco creado')
    }

    // TODO: Guardar en Firebase
    setIsBankDialogOpen(false)
    setEditingBank(null)
    setBankFormData({ name: '', code: '', isActive: true })
  }

  const handleSaveAccount = () => {
    if (!selectedBank) {
      toast.error('Selecciona un banco primero')
      return
    }

    if (!accountFormData.accountNumber || !accountFormData.accountHolder) {
      toast.error('Número de cuenta y titular son requeridos')
      return
    }

    const account: BankAccount = {
      id: `account-${Date.now()}`,
      bankId: selectedBank.id,
      ...accountFormData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setBanks(prev => prev.map(bank => 
      bank.id === selectedBank.id 
        ? { ...bank, accounts: [...bank.accounts, account] }
        : bank
    ))

    toast.success('Cuenta creada')
    setIsAccountDialogOpen(false)
    setAccountFormData({
      accountNumber: '',
      accountType: 'checking',
      accountHolder: '',
      currency: 'DOP',
      isActive: true,
      notes: ''
    })
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

  const handleDeleteBank = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este banco? Esto eliminará todas sus cuentas.')) {
      setBanks(prev => prev.filter(b => b.id !== id))
      toast.success('Banco eliminado')
      // TODO: Eliminar de Firebase
    }
  }

  const handleDeleteAccount = (bankId: string, accountId: string) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta?')) {
      setBanks(prev => prev.map(bank =>
        bank.id === bankId
          ? { ...bank, accounts: bank.accounts.filter(acc => acc.id !== accountId) }
          : bank
      ))
      toast.success('Cuenta eliminada')
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
                <Button onClick={handleSaveBank}>
                  {editingBank ? 'Actualizar' : 'Crear'}
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
          {banks.length === 0 ? (
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
                    <Button onClick={handleSaveAccount}>
                      Crear
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



