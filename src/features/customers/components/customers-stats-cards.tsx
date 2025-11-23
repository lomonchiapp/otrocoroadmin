import { Users, UserPlus, TrendingUp, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function CustomersStatsCards() {
  const stats = [
    {
      title: 'Total Clientes',
      value: '0',
      description: 'Clientes registrados',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Nuevos (30 días)',
      value: '0',
      description: 'Últimos 30 días',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Clientes VIP',
      value: '0',
      description: 'Clientes destacados',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Promedio Compras',
      value: '$0',
      description: 'Por cliente',
      icon: ShoppingBag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-xl md:text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-2 md:p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
