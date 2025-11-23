import { useState, useEffect } from 'react'
import { X, Save, Loader2, Users, Building2, Mail, MailCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCustomers } from '@/hooks'
import type { Customer, CustomerStatus, CustomerSegment, MarketingConsent, UserType } from '@/types/customers'

interface CustomerFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

interface CustomerFormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: string
  gender: string
  userType: UserType
  taxId: string
  businessName: string
  status: CustomerStatus
  segment: CustomerSegment
  emailVerified: boolean
  phoneVerified: boolean
  marketingEmail: MarketingConsent
  marketingSMS: MarketingConsent
  tags: string
  sendWelcomeEmail: boolean // ✅ Nuevo campo para enviar email
}

export function CustomerFormSheet({ open, onOpenChange, customer }: CustomerFormSheetProps) {
  const { createCustomer, updateCustomer, isCreating, isUpdating } = useCustomers()
  const [formData, setFormData] = useState<CustomerFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    userType: 'retail',
    taxId: '',
    businessName: '',
    status: 'active',
    segment: 'new',
    emailVerified: false,
    phoneVerified: false,
    marketingEmail: 'not_set',
    marketingSMS: 'not_set',
    tags: '',
    sendWelcomeEmail: true, // Por defecto, enviar email de bienvenida
  })

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (open) {
      if (customer) {
        setFormData({
          email: customer.email || '',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          phone: customer.phone || '',
          dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
          gender: customer.gender || '',
          userType: customer.userType || 'retail',
          taxId: customer.taxId || '',
          businessName: customer.businessName || '',
          status: customer.status || 'active',
          segment: customer.segment || 'new',
          emailVerified: customer.emailVerified || false,
          phoneVerified: customer.phoneVerified || false,
          marketingEmail: customer.marketingConsent?.email || 'not_set',
          marketingSMS: customer.marketingConsent?.sms || 'not_set',
          tags: customer.tags?.join(', ') || '',
          sendWelcomeEmail: false, // No enviar email si está editando
        })
      } else {
        resetForm()
      }
    }
  }, [open])

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      userType: 'retail',
      taxId: '',
      businessName: '',
      status: 'active',
      segment: 'new',
      emailVerified: false,
      phoneVerified: false,
      marketingEmail: 'not_set',
      marketingSMS: 'not_set',
      tags: '',
      sendWelcomeEmail: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const customerData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      gender: formData.gender as Customer['gender'] || undefined,
      userType: formData.userType,
      taxId: formData.taxId || undefined,
      businessName: formData.businessName || undefined,
      status: formData.status,
      segment: formData.segment,
      emailVerified: formData.emailVerified,
      phoneVerified: formData.phoneVerified,
      passwordSet: false, // Se establecerá cuando el usuario configure su contraseña
      marketingConsent: {
        email: formData.marketingEmail,
        sms: formData.marketingSMS,
        push: 'not_set' as MarketingConsent,
        phone: 'not_set' as MarketingConsent,
      },
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      addresses: customer?.addresses || [],
      notes: customer?.notes || [],
      customFields: customer?.customFields || {},
      storeHistory: customer?.storeHistory || [],
      language: customer?.language || 'es',
      currency: customer?.currency || 'COP',
      totalOrders: customer?.totalOrders || 0,
      totalSpent: customer?.totalSpent || 0,
      averageOrderValue: customer?.averageOrderValue || 0,
      lifetimeValue: customer?.lifetimeValue || 0,
      registrationSource: customer?.registrationSource || ('admin' as const),
    }

    try {
      if (customer) {
        updateCustomer(
          {
            customerId: customer.id,
            updates: {
              ...customerData,
              lastModifiedBy: 'admin',
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false)
              resetForm()
            },
          }
        )
      } else {
        // Crear nuevo cliente con opción de enviar email
        createCustomer(
          { 
            customer: customerData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
            sendWelcomeEmail: formData.sendWelcomeEmail 
          },
          {
            onSuccess: () => {
              onOpenChange(false)
              resetForm()
            },
          }
        )
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error al guardar el usuario. Por favor intenta de nuevo.')
    }
  }

  const isSubmitting = isCreating || isUpdating

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{customer ? 'Editar Usuario' : 'Nuevo Usuario'}</SheetTitle>
          <SheetDescription>
            {customer
              ? 'Modifica la información del usuario'
              : 'Completa los datos para registrar un nuevo usuario'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {/* Tipo de Usuario */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Tipo de Usuario</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'retail' })}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  formData.userType === 'retail'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <Users className={`w-8 h-8 ${formData.userType === 'retail' ? 'text-purple-600' : 'text-gray-400'}`} />
                <div className="text-center">
                  <div className="font-semibold">Cliente Final</div>
                  <div className="text-xs text-muted-foreground">Precio regular</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'wholesale' })}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  formData.userType === 'wholesale'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Building2 className={`w-8 h-8 ${formData.userType === 'wholesale' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-center">
                  <div className="font-semibold">Mayorista</div>
                  <div className="text-xs text-muted-foreground">Precio especial</div>
                </div>
              </button>
            </div>

            {/* Campos adicionales para mayoristas */}
            {formData.userType === 'wholesale' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="taxId">NIT / RUT</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="123456789-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Razón Social</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Información Personal</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder="Juan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="juan.perez@example.com"
                disabled={!!customer} // No permitir cambiar email si está editando
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estado y Segmento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Estado y Clasificación</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as CustomerStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                    <SelectItem value="pending_verification">Pendiente Verificación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento *</Label>
                <Select
                  value={formData.segment}
                  onValueChange={(value) => setFormData({ ...formData, segment: value as CustomerSegment })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="frequent">Frecuente</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="at_risk">En Riesgo</SelectItem>
                    <SelectItem value="churned">Abandonó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="vip, mayorista, descuento (separadas por comas)"
              />
              <p className="text-xs text-muted-foreground">Separa las etiquetas con comas</p>
            </div>
          </div>

          {/* Verificación */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Verificación</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailVerified">Email Verificado</Label>
                <p className="text-xs text-muted-foreground">¿El cliente ha verificado su email?</p>
              </div>
              <Switch
                id="emailVerified"
                checked={formData.emailVerified}
                onCheckedChange={(checked) => setFormData({ ...formData, emailVerified: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="phoneVerified">Teléfono Verificado</Label>
                <p className="text-xs text-muted-foreground">¿El cliente ha verificado su teléfono?</p>
              </div>
              <Switch
                id="phoneVerified"
                checked={formData.phoneVerified}
                onCheckedChange={(checked) => setFormData({ ...formData, phoneVerified: checked })}
              />
            </div>
          </div>

          {/* Email de Bienvenida (solo al crear) */}
          {!customer && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Configuración de Acceso</h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {formData.sendWelcomeEmail ? (
                        <MailCheck className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Mail className="w-5 h-5 text-gray-400" />
                      )}
                      <Label htmlFor="sendWelcomeEmail" className="font-semibold text-base">
                        Enviar Email de Bienvenida
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formData.sendWelcomeEmail 
                        ? 'El usuario recibirá un correo con un enlace para establecer su contraseña. El enlace expira en 72 horas.'
                        : 'El usuario deberá ser configurado manualmente o registrarse desde el sitio web.'
                      }
                    </p>
                  </div>
                  <Switch
                    id="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onCheckedChange={(checked) => setFormData({ ...formData, sendWelcomeEmail: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Consentimiento de Marketing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Preferencias de Comunicación</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketingEmail">Email Marketing</Label>
                <Select
                  value={formData.marketingEmail}
                  onValueChange={(value) => setFormData({ ...formData, marketingEmail: value as MarketingConsent })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opted_in">Aceptado</SelectItem>
                    <SelectItem value="opted_out">Rechazado</SelectItem>
                    <SelectItem value="not_set">Sin configurar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketingSMS">SMS Marketing</Label>
                <Select
                  value={formData.marketingSMS}
                  onValueChange={(value) => setFormData({ ...formData, marketingSMS: value as MarketingConsent })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opted_in">Aceptado</SelectItem>
                    <SelectItem value="opted_out">Rechazado</SelectItem>
                    <SelectItem value="not_set">Sin configurar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {customer ? 'Actualizar' : 'Crear Cliente'}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
