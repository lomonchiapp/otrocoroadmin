// Sistema de atributos flexible para múltiples tipos de productos
// Inspirado en WooCommerce pero adaptado para nuestras necesidades

export type AttributeType = 'color' | 'size' | 'material' | 'gender' | 'season' | 'fit' | 'metal' | 'gemstone' | 'custom'
export type AttributeInputType = 'select' | 'multiselect' | 'color_picker' | 'text' | 'number' | 'measurement'
export type ProductTypeContext = 'clothing' | 'jewelry' | 'accessory' | 'all'

export interface AttributeValue {
  id: string
  attributeId: string
  value: string
  displayValue: string
  hexCode?: string // Para colores
  measurements?: SizeMeasurement[] // Para tallas
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SizeMeasurement {
  name: string // "Pecho", "Cintura", "Largo", etc.
  value: number
  unit: 'cm' | 'inches'
}

export interface Attribute {
  id: string
  storeId: string
  name: string
  slug: string
  type: AttributeType
  inputType: AttributeInputType
  productTypes: ProductTypeContext[] // Para qué tipos de productos aplica
  isRequired: boolean
  isVariationAttribute: boolean // Si se usa para crear variaciones
  isFilterable: boolean // Si aparece en filtros del frontend
  isVisible: boolean // Si es visible en el frontend
  sortOrder: number
  description?: string
  values: AttributeValue[]
  // Configuración específica según el tipo
  config?: {
    // Para medidas/tallas
    measurements?: {
      categories: ('tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories')[]
      defaultUnit: 'cm' | 'inches'
      requiredMeasurements: string[]
    }
    // Para colores
    color?: {
      showHex: boolean
      allowCustomColors: boolean
      colorFamilies: string[]
    }
    // Para materiales
    material?: {
      allowPercentages: boolean
      maxMaterials: number
    }
    // Para metales (joyería)
    metal?: {
      allowKarat: boolean
      karatOptions: string[]
    }
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

// Atributos predefinidos por tipo de tienda
export interface StoreAttributeTemplate {
  storeType: 'fashion' | 'jewelry'
  defaultAttributes: Omit<Attribute, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[]
}

// Para productos, referencia a valores de atributos
export interface ProductAttribute {
  attributeId: string
  attribute: Attribute
  valueIds: string[]
  values: AttributeValue[]
  customValue?: string // Para atributos que permiten valores custom
}

// Variaciones de producto basadas en atributos
export interface ProductVariation {
  id: string
  productId: string
  sku: string
  barcode?: string
  attributes: ProductAttribute[] // Combinación de atributos que define esta variación
  price: number // Precio para cliente final (retail)
  compareAtPrice?: number
  wholesalePrice?: number // ✅ Precio para mayoristas (wholesale)
  costPerItem?: number
  inventoryQuantity: number
  inventoryPolicy: 'deny' | 'continue' | 'notify'
  hasInfiniteStock?: boolean // ✅ Stock infinito: si es true, ignora inventoryQuantity
  weight?: number
  weightUnit?: 'g' | 'kg' | 'lb' | 'oz'
  images: string[]
  isActive: boolean
  position: number
  createdAt: Date
  updatedAt: Date
}

// Filtros para búsqueda de productos por atributos
export interface AttributeFilter {
  attributeId: string
  valueIds: string[]
  operator: 'in' | 'not_in' | 'exists' | 'not_exists'
}

// Templates de atributos predefinidos
export const FASHION_ATTRIBUTES_TEMPLATE: StoreAttributeTemplate = {
  storeType: 'fashion',
  defaultAttributes: [
    {
      name: 'Color',
      slug: 'color',
      type: 'color',
      inputType: 'color_picker',
      productTypes: ['clothing'],
      isRequired: true,
      isVariationAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 1,
      description: 'Color del producto',
      values: [],
      config: {
        color: {
          showHex: true,
          allowCustomColors: false,
          colorFamilies: ['Rojos', 'Azules', 'Verdes', 'Neutros', 'Pasteles']
        }
      },
      isActive: true
    },
    {
      name: 'Talla',
      slug: 'size',
      type: 'size',
      inputType: 'select',
      productTypes: ['clothing'],
      isRequired: true,
      isVariationAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 2,
      description: 'Talla del producto',
      values: [],
      config: {
        measurements: {
          categories: ['tops', 'bottoms', 'dresses', 'shoes'],
          defaultUnit: 'cm',
          requiredMeasurements: ['Pecho', 'Cintura', 'Largo']
        }
      },
      isActive: true
    },
    {
      name: 'Material',
      slug: 'material',
      type: 'material',
      inputType: 'multiselect',
      productTypes: ['clothing'],
      isRequired: false,
      isVariationAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 3,
      description: 'Material de fabricación',
      values: [],
      config: {
        material: {
          allowPercentages: true,
          maxMaterials: 5
        }
      },
      isActive: true
    },
    {
      name: 'Género',
      slug: 'gender',
      type: 'gender',
      inputType: 'select',
      productTypes: ['clothing'],
      isRequired: true,
      isVariationAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 4,
      description: 'Género al que está dirigido',
      values: [],
      isActive: true
    },
    {
      name: 'Temporada',
      slug: 'season',
      type: 'season',
      inputType: 'select',
      productTypes: ['clothing'],
      isRequired: false,
      isVariationAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 5,
      description: 'Temporada del año',
      values: [],
      isActive: true
    },
    {
      name: 'Tipo de Ajuste',
      slug: 'fit',
      type: 'fit',
      inputType: 'select',
      productTypes: ['clothing'],
      isRequired: false,
      isVariationAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 6,
      description: 'Tipo de ajuste de la prenda',
      values: [],
      isActive: true
    }
  ]
}

export const JEWELRY_ATTRIBUTES_TEMPLATE: StoreAttributeTemplate = {
  storeType: 'jewelry',
  defaultAttributes: [
    {
      name: 'Metal',
      slug: 'metal',
      type: 'metal',
      inputType: 'select',
      productTypes: ['jewelry'],
      isRequired: true,
      isVariationAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 1,
      description: 'Tipo de metal',
      values: [],
      config: {
        metal: {
          allowKarat: true,
          karatOptions: ['14k', '18k', '24k']
        }
      },
      isActive: true
    },
    {
      name: 'Piedra Preciosa',
      slug: 'gemstone',
      type: 'gemstone',
      inputType: 'multiselect',
      productTypes: ['jewelry'],
      isRequired: false,
      isVariationAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 2,
      description: 'Piedras preciosas incluidas',
      values: [],
      isActive: true
    },
    {
      name: 'Talla',
      slug: 'size',
      type: 'size',
      inputType: 'select',
      productTypes: ['jewelry'],
      isRequired: false,
      isVariationAttribute: true,
      isFilterable: true,
      isVisible: true,
      sortOrder: 3,
      description: 'Talla de la joya',
      values: [],
      config: {
        measurements: {
          categories: ['accessories'],
          defaultUnit: 'cm',
          requiredMeasurements: ['Diámetro', 'Largo']
        }
      },
      isActive: true
    },
    {
      name: 'Género',
      slug: 'gender',
      type: 'gender',
      inputType: 'select',
      productTypes: ['jewelry'],
      isRequired: false,
      isVariationAttribute: false,
      isFilterable: true,
      isVisible: true,
      sortOrder: 4,
      description: 'Género al que está dirigido',
      values: [],
      isActive: true
    }
  ]
}

// Valores predefinidos para atributos comunes
export const DEFAULT_ATTRIBUTE_VALUES = {
  colors: [
    { value: 'negro', displayValue: 'Negro', hexCode: '#000000' },
    { value: 'blanco', displayValue: 'Blanco', hexCode: '#FFFFFF' },
    { value: 'rojo', displayValue: 'Rojo', hexCode: '#DC2626' },
    { value: 'azul', displayValue: 'Azul', hexCode: '#2563EB' },
    { value: 'verde', displayValue: 'Verde', hexCode: '#16A34A' },
    { value: 'amarillo', displayValue: 'Amarillo', hexCode: '#EAB308' },
    { value: 'rosa', displayValue: 'Rosa', hexCode: '#EC4899' },
    { value: 'morado', displayValue: 'Morado', hexCode: '#9333EA' },
    { value: 'gris', displayValue: 'Gris', hexCode: '#6B7280' },
    { value: 'beige', displayValue: 'Beige', hexCode: '#F5F5DC' }
  ],
  clothingSizes: [
    { 
      value: 'xs', 
      displayValue: 'XS', 
      measurements: [
        { name: 'Pecho', value: 84, unit: 'cm' },
        { name: 'Cintura', value: 66, unit: 'cm' },
        { name: 'Cadera', value: 92, unit: 'cm' }
      ]
    },
    { 
      value: 's', 
      displayValue: 'S',
      measurements: [
        { name: 'Pecho', value: 88, unit: 'cm' },
        { name: 'Cintura', value: 70, unit: 'cm' },
        { name: 'Cadera', value: 96, unit: 'cm' }
      ]
    },
    { 
      value: 'm', 
      displayValue: 'M',
      measurements: [
        { name: 'Pecho', value: 92, unit: 'cm' },
        { name: 'Cintura', value: 74, unit: 'cm' },
        { name: 'Cadera', value: 100, unit: 'cm' }
      ]
    },
    { 
      value: 'l', 
      displayValue: 'L',
      measurements: [
        { name: 'Pecho', value: 96, unit: 'cm' },
        { name: 'Cintura', value: 78, unit: 'cm' },
        { name: 'Cadera', value: 104, unit: 'cm' }
      ]
    },
    { 
      value: 'xl', 
      displayValue: 'XL',
      measurements: [
        { name: 'Pecho', value: 100, unit: 'cm' },
        { name: 'Cintura', value: 82, unit: 'cm' },
        { name: 'Cadera', value: 108, unit: 'cm' }
      ]
    },
    { 
      value: 'xxl', 
      displayValue: 'XXL',
      measurements: [
        { name: 'Pecho', value: 104, unit: 'cm' },
        { name: 'Cintura', value: 86, unit: 'cm' },
        { name: 'Cadera', value: 112, unit: 'cm' }
      ]
    }
  ],
  materials: [
    { value: 'algodon', displayValue: 'Algodón' },
    { value: 'poliester', displayValue: 'Poliéster' },
    { value: 'lana', displayValue: 'Lana' },
    { value: 'seda', displayValue: 'Seda' },
    { value: 'lino', displayValue: 'Lino' },
    { value: 'denim', displayValue: 'Denim' },
    { value: 'cuero', displayValue: 'Cuero' },
    { value: 'sintetico', displayValue: 'Sintético' }
  ],
  genders: [
    { value: 'men', displayValue: 'Hombre' },
    { value: 'women', displayValue: 'Mujer' },
    { value: 'unisex', displayValue: 'Unisex' },
    { value: 'kids', displayValue: 'Niños' }
  ],
  seasons: [
    { value: 'spring', displayValue: 'Primavera' },
    { value: 'summer', displayValue: 'Verano' },
    { value: 'fall', displayValue: 'Otoño' },
    { value: 'winter', displayValue: 'Invierno' },
    { value: 'all_season', displayValue: 'Toda Temporada' }
  ],
  fits: [
    { value: 'slim', displayValue: 'Ajustado' },
    { value: 'regular', displayValue: 'Regular' },
    { value: 'loose', displayValue: 'Holgado' },
    { value: 'oversized', displayValue: 'Oversized' }
  ],
  metals: [
    { value: 'gold', displayValue: 'Oro' },
    { value: 'silver', displayValue: 'Plata' },
    { value: 'platinum', displayValue: 'Platino' },
    { value: 'stainless_steel', displayValue: 'Acero Inoxidable' },
    { value: 'copper', displayValue: 'Cobre' },
    { value: 'brass', displayValue: 'Latón' }
  ],
  gemstones: [
    { value: 'diamond', displayValue: 'Diamante' },
    { value: 'ruby', displayValue: 'Rubí' },
    { value: 'sapphire', displayValue: 'Zafiro' },
    { value: 'emerald', displayValue: 'Esmeralda' },
    { value: 'pearl', displayValue: 'Perla' },
    { value: 'amethyst', displayValue: 'Amatista' },
    { value: 'topaz', displayValue: 'Topacio' },
    { value: 'garnet', displayValue: 'Granate' }
  ]
}

