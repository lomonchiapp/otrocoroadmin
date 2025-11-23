/**
 * Tipos relacionados con imágenes de productos
 */

export type ImageFormat = 'jpg' | 'png' | 'webp' | 'gif' | 'svg'

export interface ImageDimensions {
  width?: number
  height?: number
}

export interface ImageMetadata {
  format: ImageFormat
  size: number // en bytes
  alt: string
}

/**
 * Imagen de producto
 */
export interface ProductImage extends ImageDimensions, ImageMetadata {
  id: string
  url: string
  position: number
  isPrimary: boolean
  variantIds: string[] // IDs de variaciones que usan esta imagen
  
  // Thumbnails generados automáticamente
  thumbnails?: {
    small?: string // 150x150
    medium?: string // 300x300
    large?: string // 800x800
  }
  
  // Metadata adicional
  uploadedAt?: Date
  uploadedBy?: string
  source?: 'upload' | 'url' | 'import'
}

/**
 * Configuración para procesar imágenes
 */
export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-100
  format?: ImageFormat
  generateThumbnails?: boolean
}

/**
 * Resultado de procesamiento de imagen
 */
export interface ProcessedImage {
  original: ProductImage
  thumbnails?: Record<string, string>
  optimized?: string
}





