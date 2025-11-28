// ============= NOTIFICACIONES PARA ADMIN/TRABAJADORES =============

export type NotificationType = 
  | 'order_created' // Nuevo pedido recibido
  | 'order_status_changed' // Estado de pedido cambiado
  | 'order_cancelled' // Pedido cancelado
  | 'order_refunded' // Pedido reembolsado
  | 'payment_received' // Pago recibido
  | 'payment_failed' // Pago fallido
  | 'voucher_uploaded' // Voucher subido por cliente
  | 'voucher_approved' // Voucher aprobado
  | 'voucher_rejected' // Voucher rechazado
  | 'low_stock' // Producto bajo en stock
  | 'out_of_stock' // Producto sin stock
  | 'shipment_created' // Envío creado
  | 'shipment_delivered' // Envío entregado
  | 'shipment_failed' // Envío fallido
  | 'customer_registered' // Nuevo cliente registrado
  | 'review_submitted' // Nueva reseña
  | 'return_requested' // Solicitud de devolución
  | 'promotion_created' // Nueva promoción creada
  | 'promotion_expiring' // Promoción por expirar
  | 'system_alert' // Alerta del sistema
  | 'maintenance_scheduled' // Mantenimiento programado
  | 'inventory_adjustment' // Ajuste de inventario
  | 'report_ready' // Reporte listo
  | 'task_assigned' // Tarea asignada
  | 'task_completed' // Tarea completada
  | 'announcement' // Anuncio general

export type NotificationTarget = 
  | 'admin' // Solo administradores
  | 'manager' // Solo gerentes
  | 'cashier' // Solo cajeros
  | 'seller' // Solo vendedores
  | 'editor' // Solo editores
  | 'staff' // Todo el personal (todos los roles excepto admin)
  | 'all' // Todos los usuarios del admin
  | string // ID específico de usuario

export interface Notification {
  id: string
  userId?: string // ID del usuario destino (si es null, es para todos según target)
  target: NotificationTarget
  type: NotificationType
  title: string
  message: string
  link?: string // URL a donde redirigir al hacer click (ej: /orders/123)
  read: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent' // Prioridad de la notificación
  data?: any // Datos extra opcionales (ej: { orderId: '123', orderNumber: 'OC-001' })
  createdAt: Date
  readAt?: Date // Fecha en que se marcó como leída
  readBy?: string // ID del usuario que la marcó como leída
}



