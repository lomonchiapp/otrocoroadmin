// Tipos para anuncios/popups del sistema

export type PopupType = 'info' | 'lead_capture' | 'coupon'
export type PopupPosition = 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type PopupSize = 'small' | 'medium' | 'large' | 'fullscreen'
export type PopupTrigger = 'immediate' | 'delay' | 'scroll' | 'exit-intent' | 'page-visit' | 'inactivity'
export type PopupStatus = 'active' | 'inactive' | 'scheduled' | 'expired'
export type PopupFrequency = 'always' | 'once_session' | 'once_day' | 'once_week' | 'once_forever'
export type DeviceTarget = 'all' | 'desktop' | 'mobile'
export type PopupAnimation = 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'bounce'

export interface PopupStyle {
  backgroundColor?: string
  textColor?: string
  buttonColor?: string
  buttonTextColor?: string
  overlayColor?: string
  borderColor?: string
  animation: PopupAnimation
}

export interface Popup {
  id: string
  // Contenido Básico
  title: string
  content: string // HTML o texto plano
  type: PopupType
  
  // Configuración específica por tipo
  imageUrl?: string
  imagePosition?: 'top' | 'left' | 'right' | 'background'
  
  // Botón / Acción
  buttonText?: string
  buttonLink?: string
  
  // Cupón
  couponCode?: string
  couponSuccessMessage?: string
  
  // Lead Capture
  formSuccessMessage?: string
  
  // Diseño
  style: PopupStyle
  position: PopupPosition
  size: PopupSize
  showCloseButton: boolean
  
  // Comportamiento y Reglas
  trigger: PopupTrigger
  triggerDelay?: number // Segundos o porcentaje
  frequency: PopupFrequency
  closeOnBackdropClick: boolean
  closeAfterSeconds?: number
  
  // Segmentación
  status: PopupStatus
  startDate?: Date
  endDate?: Date
  targetAudience: 'all' | 'new' | 'returning' | 'vip'
  targetDevice: DeviceTarget
  minCartValue?: number
  maxCartValue?: number
  showOnPages: string[]
  hideOnPages: string[]
  
  // Estadísticas
  views: number
  clicks: number
  conversions: number // Leads o usos de cupón
  
  // Metadata
  storeId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para la creación/edición (Omitimos campos autogenerados)
export interface CreatePopupInput extends Omit<Popup, 'id' | 'views' | 'clicks' | 'conversions' | 'createdAt' | 'updatedAt'> {}

export interface UpdatePopupInput extends Partial<CreatePopupInput> {
  id: string
}

// Tipo para un Lead capturado
export interface Lead {
  id: string
  email: string
  name?: string
  sourcePopupId: string
  sourcePopupTitle: string
  storeId?: string
  createdAt: Date
}
