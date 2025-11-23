import type { 
  JewelryAttribute, 
  JewelryAttributeValue, 
  JewelryVariation,
  GoldColor,
  JewelryType,
  JewelryWeave,
  JewelryThickness,
  JewelryKarat,
  JewelryLength
} from '@/types/jewelry'
import { 
  GOLD_COLORS,
  JEWELRY_TYPES,
  JEWELRY_WEAVES,
  JEWELRY_THICKNESS,
  JEWELRY_KARATS,
  JEWELRY_LENGTHS
} from '@/types/jewelry'

// Servicio para manejar atributos específicos de joyería
export class JewelryService {
  // Crear atributos por defecto para joyería
  static createDefaultJewelryAttributes(storeId: string): JewelryAttribute[] {
    return [
      {
        id: 'gold-color',
        name: 'Color del Oro',
        type: 'gold_color',
        isRequired: true,
        isVariationAttribute: true,
        displayOrder: 1,
        values: GOLD_COLORS.map((color, index) => ({
          id: `gold-${color.value}`,
          value: color.value,
          label: color.label,
          metadata: { color: color.color }
        }))
      },
      {
        id: 'jewelry-type',
        name: 'Tipo de Joya',
        type: 'jewelry_type',
        isRequired: true,
        isVariationAttribute: true,
        displayOrder: 2,
        values: JEWELRY_TYPES.map((type, index) => ({
          id: `type-${type.value}`,
          value: type.value,
          label: type.label,
          metadata: { icon: type.icon }
        }))
      },
      {
        id: 'weave',
        name: 'Tejido',
        type: 'weave',
        isRequired: false,
        isVariationAttribute: true,
        displayOrder: 3,
        values: JEWELRY_WEAVES.map((weave, index) => ({
          id: `weave-${weave.value}`,
          value: weave.value,
          label: weave.label
        }))
      },
      {
        id: 'thickness',
        name: 'Grosor',
        type: 'thickness',
        isRequired: false,
        isVariationAttribute: true,
        displayOrder: 4,
        values: JEWELRY_THICKNESS.map((thickness, index) => ({
          id: `thickness-${thickness.value}`,
          value: thickness.value,
          label: thickness.label
        }))
      },
      {
        id: 'karat',
        name: 'Kilataje',
        type: 'karat',
        isRequired: true,
        isVariationAttribute: true,
        displayOrder: 5,
        values: JEWELRY_KARATS.map((karat, index) => ({
          id: `karat-${karat.value}`,
          value: karat.value,
          label: karat.label,
          metadata: { purity: karat.purity }
        }))
      },
      {
        id: 'length',
        name: 'Longitud',
        type: 'length',
        isRequired: false,
        isVariationAttribute: true,
        displayOrder: 6,
        values: JEWELRY_LENGTHS.map((length, index) => ({
          id: `length-${length.value}`,
          value: length.value,
          label: length.label,
          metadata: { category: length.category }
        }))
      }
    ]
  }

  // Obtener atributos por tipo de joyería
  static getAttributesByJewelryType(jewelryType: JewelryType): string[] {
    const attributeMap: Record<JewelryType, string[]> = {
      'cadena': ['gold-color', 'jewelry-type', 'weave', 'thickness', 'karat', 'length'],
      'guillo': ['gold-color', 'jewelry-type', 'weave', 'thickness', 'karat', 'length'],
      'pendientes': ['gold-color', 'jewelry-type', 'thickness', 'karat'],
      'anillos': ['gold-color', 'jewelry-type', 'thickness', 'karat'],
      'medallas': ['gold-color', 'jewelry-type', 'thickness', 'karat']
    }
    
    return attributeMap[jewelryType] || []
  }

  // Obtener longitudes válidas por tipo de joyería
  static getValidLengthsForType(jewelryType: JewelryType): JewelryLength[] {
    const lengthMap: Record<JewelryType, JewelryLength[]> = {
      'cadena': ['18"', '20"', '22"', '24"', '26"', '28"', '30"'],
      'guillo': ['hasta-6.5"', 'hasta-8.5"', 'guillo-pies'],
      'pendientes': [],
      'anillos': [],
      'medallas': []
    }
    
    return lengthMap[jewelryType] || []
  }

  // Generar SKU para joyería
  static generateJewelrySKU(
    goldColor: GoldColor,
    jewelryType: JewelryType,
    karat: JewelryKarat,
    weave?: JewelryWeave,
    thickness?: JewelryThickness,
    length?: JewelryLength
  ): string {
    const prefix = 'JWL'
    const colorCode = goldColor.substring(0, 3).toUpperCase()
    const typeCode = jewelryType.substring(0, 3).toUpperCase()
    const karatCode = karat.replace('k', '')
    const weaveCode = weave ? weave.substring(0, 2).toUpperCase() : 'XX'
    const thicknessCode = thickness ? thickness.replace(/[^0-9]/g, '').substring(0, 2) : 'XX'
    const lengthCode = length ? length.replace(/[^0-9]/g, '').substring(0, 2) : 'XX'
    
    return `${prefix}-${colorCode}-${typeCode}-${karatCode}-${weaveCode}-${thicknessCode}-${lengthCode}`
  }

  // Calcular precio base por kilataje y tipo
  static calculateBasePrice(
    karat: JewelryKarat,
    jewelryType: JewelryType,
    thickness?: JewelryThickness
  ): number {
    // Precios base por gramo según kilataje (en COP)
    const karatPrices: Record<JewelryKarat, number> = {
      '10k': 180000,
      '14k': 250000,
      '18k': 320000,
      '21k': 380000,
      '24k': 450000
    }

    // Multiplicadores por tipo de joyería
    const typeMultipliers: Record<JewelryType, number> = {
      'cadena': 1.0,
      'guillo': 0.8,
      'pendientes': 1.2,
      'anillos': 1.5,
      'medallas': 1.3
    }

    // Multiplicadores por grosor
    const thicknessMultipliers: Record<JewelryThickness, number> = {
      '0.5-1mm': 0.5,
      '1.5-2mm': 0.7,
      '2.5-3mm': 1.0,
      '3.5-4mm': 1.3,
      '4.5-5mm': 1.6,
      '5-6mm': 2.0,
      '7-8mm': 2.5,
      '9-12mm+': 3.0
    }

    const basePrice = karatPrices[karat]
    const typeMultiplier = typeMultipliers[jewelryType]
    const thicknessMultiplier = thickness ? thicknessMultipliers[thickness] : 1.0

    return Math.round(basePrice * typeMultiplier * thicknessMultiplier)
  }

  // Validar combinación de atributos
  static validateJewelryAttributes(
    goldColor: GoldColor,
    jewelryType: JewelryType,
    karat: JewelryKarat,
    weave?: JewelryWeave,
    thickness?: JewelryThickness,
    length?: JewelryLength
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar que el tejido sea aplicable al tipo de joyería
    if (weave && !['cadena', 'guillo'].includes(jewelryType)) {
      errors.push('El tejido solo es aplicable a cadenas y guillos')
    }

    // Validar que la longitud sea aplicable al tipo de joyería
    if (length && !['cadena', 'guillo'].includes(jewelryType)) {
      errors.push('La longitud solo es aplicable a cadenas y guillos')
    }

    // Validar combinaciones específicas
    if (jewelryType === 'guillo' && length && !['hasta-6.5"', 'hasta-8.5"', 'guillo-pies'].includes(length)) {
      errors.push('Longitud inválida para guillos')
    }

    if (jewelryType === 'cadena' && length && !['18"', '20"', '22"', '24"', '26"', '28"', '30"'].includes(length)) {
      errors.push('Longitud inválida para cadenas')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Crear variación de joyería
  static createJewelryVariation(
    goldColor: GoldColor,
    jewelryType: JewelryType,
    karat: JewelryKarat,
    weave?: JewelryWeave,
    thickness?: JewelryThickness,
    length?: JewelryLength
  ): JewelryVariation {
    const validation = this.validateJewelryAttributes(goldColor, jewelryType, karat, weave, thickness, length)
    
    if (!validation.isValid) {
      throw new Error(`Atributos inválidos: ${validation.errors.join(', ')}`)
    }

    const sku = this.generateJewelrySKU(goldColor, jewelryType, karat, weave, thickness, length)
    const price = this.calculateBasePrice(karat, jewelryType, thickness)

    return {
      id: `jwl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku,
      goldColor,
      jewelryType,
      weave,
      thickness,
      karat,
      length,
      price,
      compareAtPrice: Math.round(price * 1.2), // 20% más para precio de comparación
      inventoryQuantity: 0,
      images: [],
      isActive: true
    }
  }
}

export const jewelryService = new JewelryService()
