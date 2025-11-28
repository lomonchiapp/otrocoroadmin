import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FileText, Settings, DollarSign, Hash, Save } from 'lucide-react'
import { toast } from 'sonner'

export function InvoicingConfig() {
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    rnc: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    terms: '',
  })

  const [taxConfig, setTaxConfig] = useState({
    itbis: 18,
    enableTax: true,
    taxLabel: 'ITBIS',
  })

  const [numberingConfig, setNumberingConfig] = useState({
    prefix: 'INV-',
    startNumber: 1,
    currentNumber: 1,
  })

  const handleSaveCompanyInfo = () => {
    // TODO: Guardar en Firestore
    localStorage.setItem('company-info', JSON.stringify(companyInfo))
    toast.success('Información de empresa guardada')
  }

  const handleSaveTaxConfig = () => {
    // TODO: Guardar en Firestore
    localStorage.setItem('tax-config', JSON.stringify(taxConfig))
    toast.success('Configuración de impuestos guardada')
  }

  const handleSaveNumbering = () => {
    // TODO: Guardar en Firestore
    localStorage.setItem('numbering-config', JSON.stringify(numberingConfig))
    toast.success('Configuración de numeración guardada')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Facturación</h2>
          <p className="text-muted-foreground">
            Configura los datos de facturación, impuestos y templates
          </p>
        </div>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company" className="gap-2">
              <Settings className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="taxes" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Impuestos
            </TabsTrigger>
            <TabsTrigger value="numbering" className="gap-2">
              <Hash className="h-4 w-4" />
              Numeración
            </TabsTrigger>
          </TabsList>

          {/* Company Info Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>
                  Datos que aparecerán en las facturas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre de la Empresa</Label>
                    <Input
                      value={companyInfo.name}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Otro Coro Fashion SRL"
                    />
                  </div>
                  <div>
                    <Label>RNC</Label>
                    <Input
                      value={companyInfo.rnc}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, rnc: e.target.value }))
                      }
                      placeholder="123-45678-9"
                    />
                  </div>
                </div>

                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={companyInfo.address}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Calle Principal #123, Santo Domingo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={companyInfo.phone}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+1 (809) 123-4567"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="facturacion@otrocoro.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Logo (URL)</Label>
                  <Input
                    value={companyInfo.logo}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, logo: e.target.value }))
                    }
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>

                <div>
                  <Label>Términos y Condiciones</Label>
                  <Textarea
                    value={companyInfo.terms}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({ ...prev, terms: e.target.value }))
                    }
                    placeholder="Términos y condiciones de la factura..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompanyInfo}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Información
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Factura</CardTitle>
                <CardDescription>
                  Personaliza el diseño de tus facturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Editor de templates próximamente</p>
                  <p className="text-sm mt-2">
                    Podrás personalizar el diseño HTML/CSS de tus facturas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Impuestos</CardTitle>
                <CardDescription>
                  Configura los impuestos aplicables a las facturas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Habilitar Impuestos</Label>
                    <p className="text-sm text-muted-foreground">
                      Aplicar impuestos a las facturas
                    </p>
                  </div>
                  <Switch
                    checked={taxConfig.enableTax}
                    onCheckedChange={(checked) =>
                      setTaxConfig((prev) => ({ ...prev, enableTax: checked }))
                    }
                  />
                </div>

                {taxConfig.enableTax && (
                  <>
                    <div>
                      <Label>Etiqueta del Impuesto</Label>
                      <Input
                        value={taxConfig.taxLabel}
                        onChange={(e) =>
                          setTaxConfig((prev) => ({ ...prev, taxLabel: e.target.value }))
                        }
                        placeholder="ITBIS"
                      />
                    </div>

                    <div>
                      <Label>Tasa de Impuesto (%)</Label>
                      <Input
                        type="number"
                        value={taxConfig.itbis}
                        onChange={(e) =>
                          setTaxConfig((prev) => ({
                            ...prev,
                            itbis: parseFloat(e.target.value),
                          }))
                        }
                        placeholder="18"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        ITBIS en República Dominicana es 18%
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveTaxConfig}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Numbering Tab */}
          <TabsContent value="numbering" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Numeración de Facturas</CardTitle>
                <CardDescription>
                  Configura el formato de numeración de facturas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Prefijo</Label>
                  <Input
                    value={numberingConfig.prefix}
                    onChange={(e) =>
                      setNumberingConfig((prev) => ({ ...prev, prefix: e.target.value }))
                    }
                    placeholder="INV-"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ejemplo: {numberingConfig.prefix}00001
                  </p>
                </div>

                <div>
                  <Label>Número Inicial</Label>
                  <Input
                    type="number"
                    value={numberingConfig.startNumber}
                    onChange={(e) =>
                      setNumberingConfig((prev) => ({
                        ...prev,
                        startNumber: parseInt(e.target.value),
                      }))
                    }
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label>Número Actual</Label>
                  <Input
                    type="number"
                    value={numberingConfig.currentNumber}
                    onChange={(e) =>
                      setNumberingConfig((prev) => ({
                        ...prev,
                        currentNumber: parseInt(e.target.value),
                      }))
                    }
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Próxima factura: {numberingConfig.prefix}
                    {String(numberingConfig.currentNumber).padStart(5, '0')}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNumbering}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



