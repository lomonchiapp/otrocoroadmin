/**
 * Tipos relacionados con precios de productos
 */

import type { Discount } from '../shared/common'

/**
 * Estructura de precios de un producto
 */
export interface ProductPricing {
  // Precio base para cliente final
  basePrice: number
  
  // Precio antes de descuento (para mostrar "Antes: $X")
  compareAtPrice?: number
  
  // Precio para mayoristas
  wholesalePrice?: number
  
  // Precio de costo (para cálculos internos)
  costPrice?: number
  
  // Margen de ganancia (calculado)
  profitMargin?: number
  profitMarginPercentage?: number
}

/**
 * Precio con descuento aplicado
 */
export interface PriceWithDiscount extends ProductPricing {
  discount?: Discount
  finalPrice: number
  savings: number
  savingsPercentage: number
}

/**
 * Precio por nivel de usuario
 */
export type PricingByUserType = {
  retail: number
  wholesale: number
  vip?: number
}

/**
 * Precio escalonado por cantidad
 */
export interface TierPricing {
  minQuantity: number
  maxQuantity?: number
  price: number
  discount?: Discount
}

/**
 * Configuración de precios escalonados
 */
export interface TierPricingConfig {
  enabled: boolean
  tiers: TierPricing[]
}

/**
 * Historial de precios
 */
export interface PriceHistory {
  price: number
  changedAt: Date
  changedBy: string
  reason?: string
}

/**
 * Calculadora de precios
 */
export interface PriceCalculation {
  basePrice: number
  discounts: Discount[]
  taxes: number
  shipping?: number
  total: number
  breakdown: {
    subtotal: number
    discountTotal: number
    taxTotal: number
    shippingTotal: number
  }
}





