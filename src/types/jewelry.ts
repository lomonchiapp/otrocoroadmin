// Tipos específicos para joyería
export type GoldColor = 'blanco' | 'amarillo' | 'rosado'
export type JewelryType = 'cadena' | 'guillo' | 'pendientes' | 'anillos' | 'medallas'
export type JewelryWeave = 'cubano' | 'figaro' | 'mariner' | 'lunar' | 'franco' | 'box' | 'monaco'
export type JewelryThickness = '0.5-1mm' | '1.5-2mm' | '2.5-3mm' | '3.5-4mm' | '4.5-5mm' | '5-6mm' | '7-8mm' | '9-12mm+'
export type JewelryKarat = '10k' | '14k' | '18k' | '21k' | '24k'
export type JewelryLength = '18"' | '20"' | '22"' | '24"' | '26"' | '28"' | '30"' | 'hasta-6.5"' | 'hasta-8.5"' | 'guillo-pies'

// Valores hardcodeados para joyería
export const GOLD_COLORS: { value: GoldColor; label: string; color: string }[] = [
  { value: 'blanco', label: 'Oro Blanco', color: '#F5F5DC' },
  { value: 'amarillo', label: 'Oro Amarillo', color: '#FFD700' },
  { value: 'rosado', label: 'Oro Rosado', color: '#E8B4B8' },
]

export const JEWELRY_TYPES: { value: JewelryType; label: string; icon: string }[] = [
  { value: 'cadena', label: 'Cadenas y Collares', icon: '🔗' },
  { value: 'guillo', label: 'Guillos y Pulseras', icon: '📿' },
  { value: 'pendientes', label: 'Aretes', icon: '💎' },
  { value: 'anillos', label: 'Anillos', icon: '💍' },
  { value: 'medallas', label: 'Dijes y Medallas', icon: '🏅' },
]

export const JEWELRY_WEAVES: { value: JewelryWeave; label: string }[] = [
  { value: 'cubano', label: 'Cubano' },
  { value: 'figaro', label: 'Figaro' },
  { value: 'mariner', label: 'Mariner' },
  { value: 'lunar', label: 'Lunar' },
  { value: 'franco', label: 'Franco' },
  { value: 'box', label: 'Box' },
  { value: 'monaco', label: 'Monaco' },
]

export const JEWELRY_THICKNESS: { value: JewelryThickness; label: string }[] = [
  { value: '0.5-1mm', label: '0.5 - 1 mm' },
  { value: '1.5-2mm', label: '1.5 - 2 mm' },
  { value: '2.5-3mm', label: '2.5 - 3 mm' },
  { value: '3.5-4mm', label: '3.5 - 4 mm' },
  { value: '4.5-5mm', label: '4.5 - 5 mm' },
  { value: '5-6mm', label: '5 - 6 mm' },
  { value: '7-8mm', label: '7 - 8 mm' },
  { value: '9-12mm+', label: '9 - 12 + mm' },
]

export const JEWELRY_KARATS: { value: JewelryKarat; label: string; purity: number }[] = [
  { value: '10k', label: '10K', purity: 41.7 },
  { value: '14k', label: '14K', purity: 58.3 },
  { value: '18k', label: '18K', purity: 75.0 },
  { value: '21k', label: '21K', purity: 87.5 },
  { value: '24k', label: '24K', purity: 100.0 },
]

export const JEWELRY_LENGTHS: { value: JewelryLength; label: string; category: 'chain' | 'bracelet' | 'anklet' }[] = [
  // Para cadenas
  { value: '18"', label: '18 pulgadas', category: 'chain' },
  { value: '20"', label: '20 pulgadas', category: 'chain' },
  { value: '22"', label: '22 pulgadas', category: 'chain' },
  { value: '24"', label: '24 pulgadas', category: 'chain' },
  { value: '26"', label: '26 pulgadas', category: 'chain' },
  { value: '28"', label: '28 pulgadas', category: 'chain' },
  { value: '30"', label: '30 pulgadas', category: 'chain' },
  // Para pulseras
  { value: 'hasta-6.5"', label: 'Hasta 6.5" (para bebés)', category: 'bracelet' },
  { value: 'hasta-8.5"', label: 'Hasta 8.5" (adultos)', category: 'bracelet' },
  // Para guillos de pies
  { value: 'guillo-pies', label: 'Guillo de pies', category: 'anklet' },
]

// Interface para atributos de joyería
export interface JewelryAttribute {
  id: string
  name: string
  type: 'gold_color' | 'jewelry_type' | 'weave' | 'thickness' | 'karat' | 'length'
  values: JewelryAttributeValue[]
  isRequired: boolean
  isVariationAttribute: boolean
  displayOrder: number
}

export interface JewelryAttributeValue {
  id: string
  value: string
  label: string
  metadata?: {
    color?: string
    icon?: string
    purity?: number
    category?: string
  }
}

// Interface para variaciones de joyería
export interface JewelryVariation {
  id: string
  sku: string
  goldColor: GoldColor
  jewelryType: JewelryType
  weave?: JewelryWeave
  thickness?: JewelryThickness
  karat: JewelryKarat
  length?: JewelryLength
  price: number
  compareAtPrice?: number
  inventoryQuantity: number
  images: string[]
  isActive: boolean
}

// Interface para wizard de búsqueda de joyería
export interface JewelrySearchWizard {
  goldColor?: GoldColor
  jewelryType?: JewelryType
  weave?: JewelryWeave
  thickness?: JewelryThickness
  karat?: JewelryKarat
  length?: JewelryLength
  priceRange?: {
    min: number
    max: number
  }
}

