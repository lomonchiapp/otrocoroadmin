import { useState, useRef, useEffect } from 'react'
import { Upload, X, Clipboard, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { storageService } from '@/services/storageService'

interface ImageUploaderProps {
  /** URL de la imagen actual (si existe) */
  value?: string
  /** Callback cuando se selecciona/pega una nueva imagen */
  onChange: (imageUrl: string, storagePath: string) => void
  /** Callback cuando se remueve la imagen */
  onRemove: () => void
  /** Path base para storage (ej: 'categories/store-id/category-id') */
  storagePath: string
  /** Texto del placeholder */
  placeholder?: string
  /** Aspecto de la imagen (aspect ratio) */
  aspectRatio?: 'square' | 'video' | 'auto'
  /** Tamaño máximo en KB antes de comprimir (default: 800) */
  maxSizeKB?: number
  /** Mostrar mensaje de ayuda sobre portapapeles */
  showClipboardHint?: boolean
  /** Clase adicional para el contenedor */
  className?: string
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  storagePath,
  placeholder = 'Subir imagen',
  aspectRatio = 'auto',
  maxSizeKB = 800,
  showClipboardHint = true,
  className
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Función para procesar archivos de imagen y subirlos a Firebase Storage
  const processImageFile = async (file: File) => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress('Preparando imagen...')

    try {
      // Generar path único para la imagen
      const filename = `${Date.now()}-${file.name}`
      const fullPath = `${storagePath}/${filename}`

      setUploadProgress('Comprimiendo imagen...')

      // Subir a Firebase Storage con compresión automática
      const result = await storageService.uploadImage({
        path: fullPath,
        file,
        maxSizeKB,
      })

      setUploadProgress('¡Imagen subida!')
      
      // Mostrar información de compresión
      if (result.wasCompressed) {
        const savings = ((1 - result.finalSize / result.originalSize) * 100).toFixed(0)
        setPasteMessage(`✓ Imagen optimizada (${savings}% más ligera)`)
      } else {
        setPasteMessage(`✓ Imagen cargada exitosamente`)
      }
      
      setTimeout(() => {
        setPasteMessage(null)
        setUploadProgress(null)
      }, 3000)

      // Notificar cambio con URL y path
      onChange(result.url, result.path)

    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsUploading(false)
    }
  }

  // Manejar paste desde portapapeles
  const handlePaste = async (e: ClipboardEvent) => {
    if (!e.clipboardData) return

    const items = Array.from(e.clipboardData.items)
    let processedImages = 0

    // Intentar procesar items del portapapeles
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        
        if (file) {
          processImageFile(file)
          processedImages++
        }
      }
    }

    // También intentar obtener archivos directamente
    if (processedImages === 0 && e.clipboardData.files.length > 0) {
      const files = Array.from(e.clipboardData.files)
      
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          e.preventDefault()
          processImageFile(file)
          processedImages++
        }
      }
    }

    // Si no se procesaron imágenes, mostrar mensaje
    if (processedImages === 0) {
      setPasteMessage('No se encontraron imágenes en el portapapeles')
      setTimeout(() => setPasteMessage(null), 4000)
    }
  }

  // Configurar event listeners para paste
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handlePasteGlobal = (e: Event) => {
      // Solo procesar si el contenedor está visible/montado
      if (container.offsetParent !== null) {
        handlePaste(e as ClipboardEvent)
      }
    }

    document.addEventListener('paste', handlePasteGlobal)
    container.addEventListener('paste', handlePasteGlobal)

    return () => {
      document.removeEventListener('paste', handlePasteGlobal)
      container.removeEventListener('paste', handlePasteGlobal)
    }
  }, [])

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  // Handlers para drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processImageFile(file)
    }
  }

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-[4/3]'
  }[aspectRatio]

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      {/* Preview o Upload Area */}
      {value ? (
        <div className="relative group">
          <div className={cn('rounded-lg overflow-hidden border-2 border-muted', aspectRatioClass)}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Cambiar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemove}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg transition-all',
            aspectRatioClass,
            isUploading 
              ? 'border-muted bg-muted/20 cursor-wait'
              : isDragging
              ? 'border-primary bg-primary/10 scale-105 cursor-pointer'
              : 'border-muted hover:border-primary hover:bg-primary/5 cursor-pointer',
            'flex flex-col items-center justify-center gap-3 p-6'
          )}
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
            isUploading
              ? 'bg-primary/10'
              : isDragging 
              ? 'bg-primary/20' 
              : 'bg-muted'
          )}>
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : isDragging ? (
              <ImageIcon className="w-6 h-6 text-primary" />
            ) : (
              <Upload className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">
              {isUploading 
                ? 'Subiendo imagen...'
                : isDragging 
                ? 'Suelta la imagen aquí' 
                : placeholder
              }
            </p>
            {uploadProgress ? (
              <p className="text-xs text-primary font-medium">{uploadProgress}</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {isDragging 
                    ? 'Suelta para cargar'
                    : 'Arrastra, pega o haz clic para subir'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG o WebP • Se optimizan automáticamente
                </p>
              </>
            )}
          </div>

          {showClipboardHint && !isUploading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Clipboard className="w-3 h-3" />
              <span>Puedes pegar con Ctrl+V / ⌘+V</span>
            </div>
          )}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Mensajes de feedback */}
      {pasteMessage && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          <span>{pasteMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

