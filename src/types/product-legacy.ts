// Tipos legacy para compatibilidad (deprecated - usar attributes system)
import type { BaseProduct } from './product-base'

// Tipos legacy para compatibilidad (deprecated)
export interface ClothingProduct extends BaseProduct {
  type: 'clothing'
}

export interface JewelryProduct extends BaseProduct {
  type: 'jewelry'
}

// Tipos legacy mantenidos para compatibilidad (deprecated - usar attributes system)
export interface ClothingDetails {
  gender: 'men' | 'women' | 'unisex' | 'kids'
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all_season'
  careInstructions: string[]
  materials: Material[]
  fitType: 'slim' | 'regular' | 'loose' | 'oversized'
  origin: string
}

export interface JewelryDetails {
  metalType: 'gold' | 'silver' | 'platinum' | 'stainless_steel' | 'other'
  goldKarat?: '14k' | '18k' | '24k'
  gemstones: Gemstone[]
  weight?: number
  dimensions: Dimensions
  warranty: string
  certification?: string
  origin: string
}

export interface Material {
  name: string
  percentage: number
}

export interface Gemstone {
  type: string
  carat?: number
  color?: string
  clarity?: string
  cut?: string
}

export interface Dimensions {
  length?: number
  width?: number
  height?: number
  diameter?: number
  unit: 'mm' | 'cm' | 'inches'
}
