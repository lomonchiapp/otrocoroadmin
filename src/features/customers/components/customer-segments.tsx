import { useState, useMemo } from 'react'
import { Users, TrendingUp, Star, AlertCircle, UserX, Crown, Store, User } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCurrentStore } from '@/stores/store-store'
import { useCustomers } from '@/hooks'
import type { CustomerSegment, UserType } from '@/types/customers'
import { Link } from '@tanstack/react-router'

interface SegmentInfo {
  id: CustomerSegment | UserType | 'all'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  count: number
  percentage: number
  trend?: 'up' | 'down' | 'stable'
  totalSpent?: number
  avgOrderValue?: number
}

export function CustomerSegments() {
  const { store: currentStore } = useCurrentStore()
  const { customers, isLoading } = useCustomers()

  // Calcular estadísticas por segmento
  const segmentStats = useMemo(() => {
    if (!customers || customers.length === 0) {
      return {
        all: 0,
        vip: 0,
        frequent: 0,
        new: 0,
        at_risk: 0,
        churned: 0,
        wholesale: 0,
        retail: 0,
      }
    }

    const stats = {
      all: customers.length,
      vip: 0,
      frequent: 0,
      new: 0,
      at_risk: 0,
      churned: 0,
      wholesale: 0,
      retail: 0,
    }

    customers.forEach((customer) => {
      // Contar por segmento
      if (customer.segment === 'vip') stats.vip++
      else if (customer.segment === 'frequent') stats.frequent++
      else if (customer.segment === 'new') stats.new++
      else if (customer.segment === 'at_risk') stats.at_risk++
      else if (customer.segment === 'churned') stats.churned++

      // Contar por tipo de usuario
      if (customer.userType === 'wholesale') stats.wholesale++
      else if (customer.userType === 'retail') stats.retail++
    })

    return stats
  }, [customers])

  // Calcular valor total gastado por segmento
  const segmentSpending = useMemo(() => {
    if (!customers || customers.length === 0) {
      return {
        vip: { total: 0, avg: 0 },
        frequent: { total: 0, avg: 0 },
        new: { total: 0, avg: 0 },
        at_risk: { total: 0, avg: 0 },
        churned: { total: 0, avg: 0 },
        wholesale: { total: 0, avg: 0 },
        retail: { total: 0, avg: 0 },
      }
    }

    const spending: Record<string, { total: number; count: number; avg: number }> = {
      vip: { total: 0, count: 0, avg: 0 },
      frequent: { total: 0, count: 0, avg: 0 },
      new: { total: 0, count: 0, avg: 0 },
      at_risk: { total: 0, count: 0, avg: 0 },
      churned: { total: 0, count: 0, avg: 0 },
      wholesale: { total: 0, count: 0, avg: 0 },
      retail: { total: 0, count: 0, avg: 0 },
    }

    customers.forEach((customer) => {
      // Por segmento
      if (customer.segment && spending[customer.segment]) {
        spending[customer.segment].total += customer.totalSpent
        spending[customer.segment].count++
      }

      // Por tipo de usuario
      if (customer.userType && spending[customer.userType]) {
        spending[customer.userType].total += customer.totalSpent
        spending[customer.userType].count++
      }
    })

    // Calcular promedios
    Object.keys(spending).forEach((key) => {
      if (spending[key].count > 0) {
        spending[key].avg = spending[key].total / spending[key].count
      }
    })

    return spending
  }, [customers])

  // Definir segmentos con sus métricas
  const segments: SegmentInfo[] = [
    {
      id: 'wholesale',
      title: 'Mayoristas',
      description: 'Resellers o clientes con tiendas',
      icon: Store,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      count: segmentStats.wholesale,
      percentage: (segmentStats.wholesale / segmentStats.all) * 100,
      totalSpent: segmentSpending.wholesale.total,
      avgOrderValue: segmentSpending.wholesale.avg,
      trend: 'up',
    },
    {
      id: 'vip',
      title: 'VIP',
      description: 'Clientes que compran mucho',
      icon: Crown,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      count: segmentStats.vip,
      percentage: (segmentStats.vip / segmentStats.all) * 100,
      totalSpent: segmentSpending.vip.total,
      avgOrderValue: segmentSpending.vip.avg,
      trend: 'up',
    },
    {
      id: 'retail',
      title: 'Clientes Regulares',
      description: 'Clientes finales normales',
      icon: User,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      count: segmentStats.retail,
      percentage: (segmentStats.retail / segmentStats.all) * 100,
      totalSpent: segmentSpending.retail.total,
      avgOrderValue: segmentSpending.retail.avg,
      trend: 'stable',
    },
    {
      id: 'frequent',
      title: 'Clientes Frecuentes',
      description: 'Compran regularmente',
      icon: TrendingUp,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      count: segmentStats.frequent,
      percentage: (segmentStats.frequent / segmentStats.all) * 100,
      totalSpent: segmentSpending.frequent.total,
      avgOrderValue: segmentSpending.frequent.avg,
      trend: 'up',
    },
    {
      id: 'new',
      title: 'Nuevos',
      description: 'Clientes recién registrados',
      icon: Star,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      count: segmentStats.new,
      percentage: (segmentStats.new / segmentStats.all) * 100,
      totalSpent: segmentSpending.new.total,
      avgOrderValue: segmentSpending.new.avg,
      trend: 'up',
    },
    {
      id: 'at_risk',
      title: 'En Riesgo',
      description: 'No han comprado recientemente',
      icon: AlertCircle,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      count: segmentStats.at_risk,
      percentage: (segmentStats.at_risk / segmentStats.all) * 100,
      totalSpent: segmentSpending.at_risk.total,
      avgOrderValue: segmentSpending.at_risk.avg,
      trend: 'down',
    },
    {
      id: 'churned',
      title: 'Perdidos',
      description: 'Clientes inactivos',
      icon: UserX,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      count: segmentStats.churned,
      percentage: (segmentStats.churned / segmentStats.all) * 100,
      totalSpent: segmentSpending.churned.total,
      avgOrderValue: segmentSpending.churned.avg,
      trend: 'down',
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount)
  }

  if (!currentStore) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-muted-foreground">
                Selecciona una tienda
              </h2>
              <p className="text-muted-foreground">
                Para ver los segmentos de clientes, primero debes seleccionar una tienda en el encabezado.
              </p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Segmentos de Clientes
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 text-xs"
                  >
                    {currentStore.name}
                  </Badge>
                </div>
              </div>
              <p className="text-slate-600 mt-2 ml-13">
                Analiza y gestiona diferentes categorías de clientes
              </p>
            </div>
          </div>
        </div>

        {/* Resumen general */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen General</CardTitle>
            <CardDescription>Vista general de todos los segmentos de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{segmentStats.all}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mayoristas</p>
                <p className="text-2xl font-bold text-purple-600">{segmentStats.wholesale}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">VIP</p>
                <p className="text-2xl font-bold text-amber-600">{segmentStats.vip}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Regulares</p>
                <p className="text-2xl font-bold text-blue-600">{segmentStats.retail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de segmentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {segments.map((segment) => {
            const Icon = segment.icon
            return (
              <Card
                key={segment.id}
                className={`border-2 ${segment.borderColor} hover:shadow-lg transition-all duration-200`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 ${segment.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${segment.color}`} />
                    </div>
                    {segment.trend && (
                      <Badge
                        variant={
                          segment.trend === 'up'
                            ? 'default'
                            : segment.trend === 'down'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {segment.trend === 'up' ? '↑' : segment.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{segment.title}</CardTitle>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Clientes</span>
                      <span className="text-2xl font-bold">{segment.count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Porcentaje</span>
                      <span className="text-sm font-medium">
                        {isNaN(segment.percentage) ? '0' : segment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {segment.totalSpent !== undefined && segment.totalSpent > 0 && (
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Gastado</span>
                        <span className="text-sm font-medium">{formatCurrency(segment.totalSpent)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valor Promedio</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(segment.avgOrderValue || 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Link to="/customers">
                    <Button variant="outline" className="w-full mt-4">
                      Ver Clientes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Main>
    </>
  )
}
