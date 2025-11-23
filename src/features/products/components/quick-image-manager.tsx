import { useState, useRef, useEffect } from 'react'
import { Upload, X, Save, Image as ImageIcon, Trash2, Clipboard, CheckCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { productService } from '@/services/productService'
import { storageService } from '@/services/storageService'
import type { Product } from '@/types'

interface QuickImageManagerProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function QuickImageManager({
  product,
  open,
  onOpenChange,
  onUpdate,
}: QuickImageManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [images, setImages] = useState<string[]>(product.images || [])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Función para procesar archivos de imagen y crear preview
  const processImageFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      // Agregar archivo a la cola de subida
      setUploadingFiles(prev => [...prev, file])

      // Crear preview local
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setPreviewUrls(prev => [...prev, url])

        // Mostrar mensaje de éxito
        const fileName = file.name || 'Imagen sin nombre'
        setPasteMessage(`Imagen "${fileName}" agregada`)
        setTimeout(() => setPasteMessage(null), 3000)
      }
      reader.onerror = () => {
        console.error('Error al leer archivo de imagen:', file.name)
        setPasteMessage('Error al procesar la imagen. Inténtalo de nuevo.')
        setTimeout(() => setPasteMessage(null), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para manejar paste desde portapapeles
  const handlePaste = async (e: ClipboardEvent) => {
    if (!e.clipboardData) {
      console.log('No clipboard data available')
      return
    }

    console.log('Paste event triggered')
    const items = Array.from(e.clipboardData.items)
    console.log('Clipboard items:', items.map(i => ({ type: i.type, kind: i.kind })))

    let processedImages = 0

    // Intentar procesar items del portapapeles
    for (const item of items) {
      console.log('Processing item:', item.type, item.kind)
      
      if (item.type.startsWith('image/')) {
        e.preventDefault() // Prevenir comportamiento por defecto
        const file = item.getAsFile()
        console.log('Image file found:', file?.name, file?.type)
        
        if (file) {
          processImageFile(file)
          processedImages++
        }
      }
    }

    // También intentar obtener archivos directamente
    if (processedImages === 0 && e.clipboardData.files.length > 0) {
      console.log('Trying direct files access:', e.clipboardData.files.length)
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
      console.log('No images found in clipboard')
      setPasteMessage('No se encontraron imágenes en el portapapeles. Asegúrate de copiar una imagen primero.')
      setTimeout(() => setPasteMessage(null), 4000)
    } else {
      console.log(`Successfully processed ${processedImages} image(s)`)
    }
  }

  // Configurar event listeners para paste desde portapapeles
  useEffect(() => {
    if (open) {
      // Agregar listener al documento completo para capturar paste en cualquier lugar
      const handlePasteGlobal = (e: Event) => {
        handlePaste(e as ClipboardEvent)
      }

      document.addEventListener('paste', handlePasteGlobal)

      // También agregar al dialog si existe
      if (dialogRef.current) {
        dialogRef.current.addEventListener('paste', handlePasteGlobal)
      }

      return () => {
        document.removeEventListener('paste', handlePasteGlobal)
        if (dialogRef.current) {
          dialogRef.current.removeEventListener('paste', handlePasteGlobal)
        }
      }
    }
  }, [open])

  // Actualizar imágenes cuando cambia el producto
  useEffect(() => {
    setImages(product.images || [])
  }, [product.images])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      processImageFile(file)
    })
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

    const files = Array.from(e.dataTransfer.files)
    console.log('Files dropped:', files.length)
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        processImageFile(file)
      }
    })
  }

  const handleRemoveExisting = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemovePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      let uploadedUrls: string[] = []

      // Si hay archivos nuevos, subirlos a Firebase Storage
      if (uploadingFiles.length > 0) {
        setUploadProgress(`Subiendo ${uploadingFiles.length} imagen(es)...`)
        
        const basePath = `products/${product.storeId}/${product.id}`
        
        const results = await storageService.uploadImages(
          uploadingFiles,
          basePath,
          { maxSizeKB: 800 }
        )
        
        uploadedUrls = results.map(r => r.url)
        
        // Mostrar información de optimización
        const totalCompressed = results.filter(r => r.wasCompressed).length
        if (totalCompressed > 0) {
          const avgSavings = results
            .filter(r => r.wasCompressed)
            .reduce((acc, r) => acc + ((1 - r.finalSize / r.originalSize) * 100), 0) / totalCompressed
          
          setPasteMessage(`✓ ${totalCompressed} imagen(es) optimizada(s) (~${avgSavings.toFixed(0)}% más ligeras)`)
        }
      }

      // Combinar imágenes existentes con las nuevas subidas
      const allImages = [...images, ...uploadedUrls]

      setUploadProgress('Guardando cambios...')

      await productService.updateProduct(product.id, {
        images: allImages,
        updatedAt: new Date()
      })

      // ✅ Actualizar el producto localmente para reflejar los cambios inmediatamente
      product.images = allImages
      product.updatedAt = new Date()

      // ✅ Forzar actualización del componente padre (importante para mostrar cambios)
      onUpdate()

      // ✅ Mostrar estado de éxito
      setIsSuccess(true)

      // ✅ Cerrar modal después de un pequeño delay para que el usuario vea que se guardó
      setTimeout(() => {
        onOpenChange(false)
        setPreviewUrls([])
        setUploadingFiles([])
        setPasteMessage(null)
        setUploadProgress(null)
        setIsSuccess(false)
      }, 1500)

    } catch (error) {
      console.error('Error updating images:', error)
      alert('Error al actualizar las imágenes. Por favor intenta de nuevo.')
      setUploadProgress(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalImages = images.length + previewUrls.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        tabIndex={-1}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Gestión de Imágenes
          </DialogTitle>
          <DialogDescription>
            Administra las imágenes de: <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensaje de éxito/feedback para operaciones */}
          {pasteMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              pasteMessage.includes('Error') || pasteMessage.includes('No se encontraron')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              <CheckCircle className="w-4 h-4" />
              <span>{pasteMessage}</span>
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total de Imágenes</p>
              <p className="text-2xl font-bold">{totalImages}</p>
            </div>
            <Badge variant={totalImages === 0 ? 'destructive' : 'default'}>
              {totalImages === 0 ? 'Sin imágenes' : `${totalImages} imagen${totalImages > 1 ? 'es' : ''}`}
            </Badge>
          </div>

          {/* Upload Zone - Mejorada para paste y drag & drop */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
              "hover:border-primary hover:bg-primary/5",
              "focus-within:border-primary focus-within:bg-primary/5",
              isDragging && "border-primary bg-primary/10 scale-[1.02]"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            tabIndex={0}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <Upload className={cn(
                "w-12 h-12 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
              <Clipboard className={cn(
                "w-10 h-10 transition-colors",
                isDragging ? "text-primary" : "text-primary/60"
              )} />
            </div>
            <h3 className="font-semibold mb-2">
              {isDragging ? '¡Suelta aquí!' : 'Subir o Pegar Imágenes'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {isDragging ? 'Suelta las imágenes para agregarlas' : 'Click aquí o arrastra imágenes para subir'}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 my-3 inline-block">
              <p className="text-xs text-blue-800 font-medium flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                Presiona <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">Ctrl+V</kbd> o <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">⌘+V</kbd> para pegar
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Formatos soportados: JPG, PNG, GIF, WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Existing Images */}
          {images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm">Imágenes Actuales</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary transition-colors">
                      <img
                        src={url}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        Principal
                      </Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveExisting(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview New Images */}
          {previewUrls.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                Nuevas Imágenes
                <Badge variant="secondary">{previewUrls.length}</Badge>
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={`preview-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-primary">
                      <img
                        src={url}
                        alt={`Nueva imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      Nueva
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePreview(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalImages === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-semibold text-lg mb-2">Sin imágenes</p>
              <p className="text-sm text-muted-foreground">
                Este producto no tiene imágenes. Sube algunas para mejorar su presentación.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-primary font-medium mr-auto">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setPreviewUrls([])
              setUploadingFiles([])
              setImages(product.images || [])
              setPasteMessage(null)
              setUploadProgress(null)
            }}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess || (images.length === product.images?.length && previewUrls.length === 0)}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ¡Guardado!
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
