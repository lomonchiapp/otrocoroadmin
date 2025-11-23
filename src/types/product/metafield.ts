/**
 * Tipos para metafields (campos personalizados)
 */

export type MetafieldType = 'text' | 'number' | 'boolean' | 'date' | 'json' | 'url' | 'color' | 'file'

export type MetafieldNamespace = 
  | 'custom'
  | 'technical'
  | 'shipping'
  | 'seo'
  | 'marketing'
  | 'integration'
  | string // Permite namespaces personalizados

/**
 * Metafield - Campo personalizado para almacenar datos adicionales
 */
export interface Metafield {
  key: string
  value: string | number | boolean | object
  type: MetafieldType
  namespace: MetafieldNamespace
  description?: string
  
  // Validación
  required?: boolean
  validation?: MetafieldValidation
  
  // UI
  label?: string
  placeholder?: string
  helpText?: string
  
  // Visibilidad
  isPublic?: boolean // Si es visible en el storefront
  showInAdmin?: boolean
}

/**
 * Validación de metafield
 */
export interface MetafieldValidation {
  min?: number
  max?: number
  pattern?: string // regex
  options?: string[] // Para select/dropdown
}

/**
 * Definición de metafield (schema)
 */
export interface MetafieldDefinition {
  key: string
  type: MetafieldType
  namespace: MetafieldNamespace
  label: string
  description?: string
  required: boolean
  validation?: MetafieldValidation
  defaultValue?: unknown
}

/**
 * Colección de metafields organizados por namespace
 */
export type MetafieldCollection = Record<MetafieldNamespace, Metafield[]>





