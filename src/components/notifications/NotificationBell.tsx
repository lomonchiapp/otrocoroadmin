import React, { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, ShoppingBag, AlertCircle, Tag, Info, X, Package, Truck, CreditCard, Users, TrendingUp, FileText, Wrench } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/notifications'

// Icono según el tipo de notificación
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'order_created':
    case 'order_status_changed':
    case 'order_cancelled':
    case 'order_refunded':
      return <ShoppingBag className="h-4 w-4 text-blue-500" />
    case 'payment_received':
    case 'payment_failed':
    case 'voucher_uploaded':
    case 'voucher_approved':
    case 'voucher_rejected':
      return <CreditCard className="h-4 w-4 text-green-500" />
    case 'low_stock':
    case 'out_of_stock':
    case 'inventory_adjustment':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'shipment_created':
    case 'shipment_delivered':
    case 'shipment_failed':
      return <Truck className="h-4 w-4 text-purple-500" />
    case 'customer_registered':
    case 'review_submitted':
      return <Users className="h-4 w-4 text-indigo-500" />
    case 'return_requested':
      return <Package className="h-4 w-4 text-orange-500" />
    case 'promotion_created':
    case 'promotion_expiring':
      return <Tag className="h-4 w-4 text-pink-500" />
    case 'system_alert':
    case 'maintenance_scheduled':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case 'report_ready':
      return <FileText className="h-4 w-4 text-cyan-500" />
    case 'task_assigned':
    case 'task_completed':
      return <Wrench className="h-4 w-4 text-teal-500" />
    case 'announcement':
      return <TrendingUp className="h-4 w-4 text-blue-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

// Color según prioridad
const getPriorityColor = (priority?: 'low' | 'normal' | 'high' | 'urgent') => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
    case 'high':
      return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10'
    case 'normal':
      return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
    case 'low':
      return 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10'
    default:
      return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
  }
}

// Formato de fecha relativo (Hace 5 min, etc)
const formatTimeAgo = (date: Date | any) => {
  const dateObj = date instanceof Date ? date : (date?.toDate?.() || new Date(date))
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Hace un momento'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 172800) return 'Ayer'
  
  return dateObj.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const { auth } = useAuthStore()
  const userId = auth.user?.accountNo || ''
  const userRoles = auth.user?.role ? (Array.isArray(auth.user.role) ? auth.user.role : [auth.user.role]) : []

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && userId) {
      await markAsRead(notification.id, userId)
    }
    
    if (notification.link) {
      navigate({ to: notification.link })
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className={cn("h-5 w-5 transition-all", unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
        )}
        <span className="sr-only">Notificaciones</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-popover border border-border rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-semibold">Notificaciones</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-auto py-1 px-2"
                  onClick={async () => {
                    if (userId && userRoles.length > 0) {
                      await markAllAsRead(userId, userRoles)
                    }
                  }}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 border-l-4",
                      !notification.read && getPriorityColor(notification.priority)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn(
                      "mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      !notification.read ? "bg-background shadow-sm" : "bg-muted"
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-none", !notification.read && "text-blue-700 dark:text-blue-400")}>
                          {notification.title}
                        </p>
                        {notification.priority === 'urgent' && (
                          <span className="text-xs text-red-500 font-semibold">URGENTE</span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="text-xs text-orange-500 font-semibold">ALTA</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 pt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 mt-2">
                        <span className="block h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

