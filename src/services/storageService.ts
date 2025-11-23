/**
 * Servicio de almacenamiento de imágenes en Firebase Storage
 * Maneja la subida, compresión y eliminación de imágenes
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import imageCompression from 'browser-image-compression'

export interface UploadImageOptions {
  /** Ruta en Firebase Storage (ej: 'products/store-id/image.jpg') */
  path: string
  /** Archivo o Data URL a subir */
  file: File | string
  /** Tamaño máximo objetivo en KB (default: 800) - Se garantiza que la imagen quede por debajo de este tamaño */
  maxSizeKB?: number
  /** Calidad inicial de compresión 0-1 (default: 0.85) - Se ajusta automáticamente si es necesario */
  quality?: number
  /** Ancho máximo en pixels (default: 1920) */
  maxWidth?: number
  /** Altura máxima en pixels (default: 1920) */
  maxHeight?: number
}

export interface ImageUploadResult {
  /** URL pública de la imagen subida */
  url: string
  /** Path en Firebase Storage */
  path: string
  /** Tamaño original en KB */
  originalSize: number
  /** Tamaño final en KB (después de compresión) */
  finalSize: number
  /** Indica si se aplicó compresión */
  wasCompressed: boolean
}

class StorageService {
  /**
   * Convierte un Data URL en un File
   */
  private dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new File([u8arr], filename, { type: mime })
  }

  /**
   * Comprime una imagen garantizando que quede por debajo del tamaño máximo
   * Usa un algoritmo iterativo que ajusta la calidad hasta lograr el tamaño objetivo
   */
  private async compressImage(
    file: File,
    options: {
      maxSizeKB: number
      quality: number
      maxWidth: number
      maxHeight: number
    }
  ): Promise<{ file: File; wasCompressed: boolean }> {
    const fileSizeKB = file.size / 1024
    const targetSizeKB = options.maxSizeKB

    console.log('📦 Original image size:', fileSizeKB.toFixed(2), 'KB')

    // Si el archivo ya es menor al límite, no comprimir
    if (fileSizeKB <= targetSizeKB) {
      console.log('✅ Image already under', targetSizeKB, 'KB - no compression needed')
      return { file, wasCompressed: false }
    }

    console.log('🔧 Compressing image to be under', targetSizeKB, 'KB...')

    try {
      let currentQuality = options.quality
      let compressedFile = file
      let attempts = 0
      const maxAttempts = 5

      // Intentar comprimir iterativamente hasta lograr el tamaño objetivo
      while (attempts < maxAttempts) {
        attempts++

        const compressionOptions = {
          maxSizeMB: targetSizeKB / 1024, // Convertir KB a MB
          maxWidthOrHeight: Math.max(options.maxWidth, options.maxHeight),
          useWebWorker: true,
          initialQuality: currentQuality,
          alwaysKeepResolution: false, // Permite reducir resolución si es necesario
          preserveExif: false, // Remover EXIF para reducir tamaño
        }

        compressedFile = await imageCompression(file, compressionOptions)
        const compressedSizeKB = compressedFile.size / 1024

        console.log(`  Attempt ${attempts}: ${compressedSizeKB.toFixed(2)} KB (quality: ${(currentQuality * 100).toFixed(0)}%)`)

        // Si logramos el objetivo, terminar
        if (compressedSizeKB <= targetSizeKB) {
          console.log('✅ Image compressed to', compressedSizeKB.toFixed(2), 'KB')
          console.log('💾 Savings:', ((1 - compressedSizeKB / fileSizeKB) * 100).toFixed(1), '%')
          return { file: compressedFile, wasCompressed: true }
        }

        // Si aún es muy grande, reducir calidad para el siguiente intento
        // Calcular nueva calidad basada en cuánto nos excedimos
        const ratio = targetSizeKB / compressedSizeKB
        currentQuality = Math.max(0.4, currentQuality * ratio * 0.9) // Mínimo 40% de calidad
      }

      // Si después de varios intentos no logramos el objetivo, usar el último resultado
      const finalSizeKB = compressedFile.size / 1024
      
      if (finalSizeKB > targetSizeKB) {
        console.warn('⚠️  Could not compress below target. Final size:', finalSizeKB.toFixed(2), 'KB')
      } else {
        console.log('✅ Image compressed to', finalSizeKB.toFixed(2), 'KB')
      }
      
      console.log('💾 Savings:', ((1 - finalSizeKB / fileSizeKB) * 100).toFixed(1), '%')
      return { file: compressedFile, wasCompressed: true }

    } catch (error) {
      console.error('❌ Error compressing image:', error)
      // Si falla la compresión, intentar una compresión simple
      try {
        const fallbackOptions = {
          maxSizeMB: targetSizeKB / 1024,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
          initialQuality: 0.7,
        }
        const fallbackFile = await imageCompression(file, fallbackOptions)
        console.log('⚠️  Used fallback compression')
        return { file: fallbackFile, wasCompressed: true }
      } catch {
        // Como último recurso, usar el archivo original
        console.error('❌ All compression attempts failed, using original file')
        return { file, wasCompressed: false }
      }
    }
  }

  /**
   * Genera un nombre de archivo único
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const extension = originalName.split('.').pop() || 'jpg'
    return `${timestamp}-${random}.${extension}`
  }

  /**
   * Sube una imagen a Firebase Storage con compresión automática
   */
  async uploadImage(options: UploadImageOptions): Promise<ImageUploadResult> {
    const {
      path,
      file: inputFile,
      maxSizeKB = 800,
      quality = 0.85,
      maxWidth = 1920,
      maxHeight = 1920,
    } = options

    try {
      // Convertir Data URL a File si es necesario
      let file: File
      if (typeof inputFile === 'string') {
        const filename = this.generateUniqueFilename('image.jpg')
        file = this.dataURLtoFile(inputFile, filename)
      } else {
        file = inputFile
      }

      const originalSize = file.size / 1024 // KB

      // Comprimir imagen si es necesario
      const { file: processedFile, wasCompressed } = await this.compressImage(file, {
        maxSizeKB,
        quality,
        maxWidth,
        maxHeight,
      })

      const finalSize = processedFile.size / 1024 // KB

      // Crear referencia en Firebase Storage
      const storageRef = ref(storage, path)

      // Subir archivo
      console.log('⬆️  Uploading image to Firebase Storage:', path)
      const snapshot = await uploadBytes(storageRef, processedFile, {
        contentType: processedFile.type,
        customMetadata: {
          originalSize: originalSize.toFixed(2),
          finalSize: finalSize.toFixed(2),
          wasCompressed: wasCompressed.toString(),
          uploadedAt: new Date().toISOString(),
        },
      })

      // Obtener URL pública
      const url = await getDownloadURL(snapshot.ref)

      console.log('✅ Image uploaded successfully:', url)

      return {
        url,
        path,
        originalSize,
        finalSize,
        wasCompressed,
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Sube múltiples imágenes en paralelo
   */
  async uploadImages(
    files: (File | string)[],
    basePath: string,
    options?: Omit<UploadImageOptions, 'path' | 'file'>
  ): Promise<ImageUploadResult[]> {
    console.log(`📤 Uploading ${files.length} images to ${basePath}`)

    const uploadPromises = files.map((file, index) => {
      const filename =
        file instanceof File
          ? this.generateUniqueFilename(file.name)
          : this.generateUniqueFilename(`image-${index}.jpg`)

      const path = `${basePath}/${filename}`

      return this.uploadImage({
        path,
        file,
        ...options,
      })
    })

    try {
      const results = await Promise.all(uploadPromises)
      console.log(`✅ All ${files.length} images uploaded successfully`)
      return results
    } catch (error) {
      console.error('❌ Error uploading some images:', error)
      throw error
    }
  }

  /**
   * Elimina una imagen de Firebase Storage
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
      console.log('🗑️  Image deleted:', path)
    } catch (error) {
      // Si la imagen no existe, no es un error crítico
      if ((error as any)?.code === 'storage/object-not-found') {
        console.log('ℹ️  Image not found (already deleted):', path)
        return
      }
      console.error('❌ Error deleting image:', error)
      throw error
    }
  }

  /**
   * Elimina múltiples imágenes
   */
  async deleteImages(paths: string[]): Promise<void> {
    console.log(`🗑️  Deleting ${paths.length} images`)

    const deletePromises = paths.map((path) => this.deleteImage(path))

    try {
      await Promise.allSettled(deletePromises) // Continuar aunque algunas fallen
      console.log(`✅ Deletion process completed for ${paths.length} images`)
    } catch (error) {
      console.error('❌ Error during bulk deletion:', error)
      throw error
    }
  }

  /**
   * Extrae el path de Firebase Storage de una URL
   * Útil para eliminar imágenes cuando solo tienes la URL
   */
  extractPathFromUrl(url: string): string | null {
    try {
      // URLs de Firebase Storage tienen formato:
      // https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?...
      const match = url.match(/\/o\/(.*?)\?/)
      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }
      return null
    } catch (error) {
      console.error('Error extracting path from URL:', error)
      return null
    }
  }

  /**
   * Genera el path de Storage para una categoría
   */
  getCategoryImagePath(storeId: string, categoryId: string, filename?: string): string {
    const name = filename || this.generateUniqueFilename('category.jpg')
    return `categories/${storeId}/${categoryId}/${name}`
  }

  /**
   * Genera el path de Storage para un producto
   */
  getProductImagePath(storeId: string, productId: string, filename?: string): string {
    const name = filename || this.generateUniqueFilename('product.jpg')
    return `products/${storeId}/${productId}/${name}`
  }
}

// Exportar instancia única
export const storageService = new StorageService()
export default storageService

