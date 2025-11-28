/**
 * Barrel export principal de tipos
 * Permite importar cualquier tipo desde @/types
 */

// Tipos compartidos
export * from './shared'

// Tipos de productos (modular)
export * from './product'

// Otros tipos existentes
export * from './attributes'
export * from './brand'
export * from './category'
export * from './customers'
export * from './inventory'
export * from './invoices'
export * from './orders'
export * from './products' // Legacy - mantener por compatibilidad
export * from './sellers'
export * from './stores'
export * from './bundle'
export * from './payments'

// Re-exportaciones específicas para retrocompatibilidad
export type { Product, ProductImage } from './product'
export type { Customer, CustomerAddress } from './customers'
export type { Order } from './orders'
export type { Bundle } from './bundle'