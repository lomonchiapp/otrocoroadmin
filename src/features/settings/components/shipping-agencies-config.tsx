import { useState } from 'react'
import { Plus, Edit, Trash2, Building2, Home, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useStoreStore } from '@/stores/store-store'
import type { ShippingAgencyConfig, ShippingAgencyBranch } from '@/types'
import { SHIPPING_AGENCIES, DOMINICAN_CITIES } from '@/types/customers'
import { toast } from 'sonner'

export function ShippingAgenciesConfig() {
  const { store } = useStoreStore()
  const [agencies, setAgencies] = useState<ShippingAgencyConfig[]>(
    store?.settings.shippingAgencies || []
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAgency, setEditingAgency] = useState<ShippingAgencyConfig | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    supportsHomeDelivery: true,
    supportsPickup: true,
    isActive: true,
    defaultPrice: 500
  })

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast.error('Nombre y código son requeridos')
      return
    }

    const agency: ShippingAgencyConfig = {
      id: editingAgency?.id || `agency-${Date.now()}`,
      ...formData,
      branches: editingAgency?.branches || [],
      createdAt: editingAgency?.createdAt || new Date(),
      updatedAt: new Date()
    }

    if (editingAgency) {
      setAgencies(prev => prev.map(a => a.id === editingAgency.id ? agency : a))
      toast.success('Agencia actualizada')
    } else {
      setAgencies(prev => [...prev, agency])
      toast.success('Agencia creada')
    }

    // TODO: Guardar en Firebase
    setIsDialogOpen(false)
    setEditingAgency(null)
    setFormData({
      name: '',
      code: '',
      supportsHomeDelivery: true,
      supportsPickup: true,
      isActive: true,
      defaultPrice: 500
    })
  }

  const handleEdit = (agency: ShippingAgencyConfig) => {
    setEditingAgency(agency)
    setFormData({
      name: agency.name,
      code: agency.code,
      supportsHomeDelivery: agency.supportsHomeDelivery,
      supportsPickup: agency.supportsPickup,
      isActive: agency.isActive,
      defaultPrice: agency.defaultPrice
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta agencia?')) {
      setAgencies(prev => prev.filter(a => a.id !== id))
      toast.success('Agencia eliminada')
      // TODO: Eliminar de Firebase
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agencias de Envío</h2>
          <p className="text-muted-foreground">
            Configura las agencias de envío disponibles y sus métodos de entrega
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAgency(null)
              setFormData({
                name: '',
                code: '',
                supportsHomeDelivery: true,
                supportsPickup: true,
                isActive: true,
                defaultPrice: 500
              })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Agencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAgency ? 'Editar Agencia' : 'Nueva Agencia'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Caribe Tours"
                />
              </div>
              <div>
                <Label>Código</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                >
                  <option value="">Selecciona un código</option>
                  {Object.entries(SHIPPING_AGENCIES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Precio por Defecto (DOP)</Label>
                <Input
                  type="number"
                  value={formData.defaultPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultPrice: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.supportsHomeDelivery}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, supportsHomeDelivery: checked }))}
                />
                <Label>Soporta Puerta a Puerta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.supportsPickup}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, supportsPickup: checked }))}
                />
                <Label>Soporta Recoger en Agencia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Activa</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingAgency ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {agencies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay agencias configuradas</p>
            </CardContent>
          </Card>
        ) : (
          agencies.map((agency) => (
            <Card key={agency.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {agency.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(agency)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(agency.id)}
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
                    <span className="font-medium">{agency.code}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Precio:</span>
                    <span className="font-medium">RD$ {agency.defaultPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {agency.supportsHomeDelivery && (
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Puerta a Puerta</span>
                      </div>
                    )}
                    {agency.supportsPickup && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Recoger en Agencia</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      agency.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agency.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}



