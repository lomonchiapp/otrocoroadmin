import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'
import { ShippingAgenciesConfig } from '../components/shipping-agencies-config'
import { BanksConfig } from '../components/banks-config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCog, Truck, Building2 } from 'lucide-react'

export function SettingsProfile() {
  return (
    <div className="space-y-6">
      <ContentSection
        title='Perfil'
        desc='Actualiza tu información personal y configuración de la cuenta.'
      >
        <ProfileForm />
      </ContentSection>

      <ContentSection
        title='Agencias de Envío'
        desc='Configura las agencias de envío disponibles y sus métodos de entrega.'
      >
        <ShippingAgenciesConfig />
      </ContentSection>

      <ContentSection
        title='Bancos y Cuentas'
        desc='Gestiona los bancos y cuentas bancarias para transferencias y depósitos.'
      >
        <BanksConfig />
      </ContentSection>
    </div>
  )
}
