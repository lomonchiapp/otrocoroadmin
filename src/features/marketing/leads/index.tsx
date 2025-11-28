import { useState, useEffect } from 'react'
import { Mail, Calendar, Download, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { adService } from '@/services/adService'
import type { Lead } from '@/types/ads'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setIsLoading(true)
      const allLeads = await adService.getLeads()
      setLeads(allLeads)
    } catch (error) {
      console.error('Error loading leads:', error)
      toast.error('Error al cargar los leads')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.sourcePopupTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleExport = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Origen (Popup)', 'Fecha'],
      ...filteredLeads.map(lead => [
        lead.email,
        lead.name || '',
        lead.sourcePopupTitle || '',
        format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ])
    ].map(e => e.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_otrocoro_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Capturados</h1>
          <p className="text-muted-foreground">
            Gestiona los correos electrónicos capturados a través de tus popups
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Suscriptores</CardTitle>
              <CardDescription>
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrados
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron leads.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Origen (Popup)</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {lead.email}
                      </div>
                    </TableCell>
                    <TableCell>{lead.name || '-'}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {lead.sourcePopupTitle}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(lead.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



