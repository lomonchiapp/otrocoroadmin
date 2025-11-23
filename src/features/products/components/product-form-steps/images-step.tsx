import React, { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Upload, X, CheckCircle2, Clipboard, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagesStepProps {
  images: string[]
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
}

export const ImagesStep: React.FC<ImagesStepProps> = ({
  images,
  onImageUpload,
  onRemoveImage,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Función para procesar archivos de imagen
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPasteMessage('❌ Solo se aceptan archivos de imagen')
      setTimeout(() => setPasteMessage(null), 3000)
      return
    }

    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      
      // Simular evento de change para reutilizar la lógica existente
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fakeEvent = {
        target: {
          files: dataTransfer.files
        }
      } as React.ChangeEvent<HTMLInputElement>
      
      onImageUpload(fakeEvent)
      
      const fileName = file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name
      setPasteMessage(`✓ "${fileName}" agregada`)
      setTimeout(() => setPasteMessage(null), 3000)
      setIsProcessing(false)
    }
    reader.onerror = () => {
      setPasteMessage('❌ Error al procesar la imagen')
      setTimeout(() => setPasteMessage(null), 3000)
      setIsProcessing(false)
    }
    reader.readAsDataURL(file)
  }

  // Función para manejar paste desde portapapeles
  const handlePaste = async (e: ClipboardEvent) => {
    if (!e.clipboardData) return

    const items = Array.from(e.clipboardData.items)
    let processedImages = 0

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

    if (processedImages === 0 && e.clipboardData.files.length > 0) {
      const files = Array.from(e.clipboardData.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          processImageFile(file)
        }
      })
    }
  }

  // Agregar listener de paste
  useEffect(() => {
    const handlePasteWrapper = (e: ClipboardEvent) => {
      // Solo procesar si estamos en la zona de drop o si el foco está en el documento
      if (dropZoneRef.current?.contains(document.activeElement) || document.activeElement === document.body) {
        handlePaste(e)
      }
    }

    document.addEventListener('paste', handlePasteWrapper)
    return () => {
      document.removeEventListener('paste', handlePasteWrapper)
    }
  }, [])

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        processImageFile(file)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Imágenes del Producto</h3>
          <p className="text-sm text-slate-600">Agrega fotos de alta calidad del producto</p>
        </div>
      </div>

      {/* Zona de pegar desde portapapeles */}
      <div
        ref={dropZoneRef}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-all",
          isDragging
            ? "border-pink-500 bg-pink-50"
            : "border-slate-300 bg-slate-50/50"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Clipboard className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div>
            <p className="text-base font-semibold text-slate-900 mb-1">
              Pega imágenes aquí (Ctrl/Cmd + V)
            </p>
            <p className="text-sm text-slate-600">
              O arrastra y suelta archivos, o haz click para seleccionar
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Seleccionar archivos
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
          />

          {pasteMessage && (
            <Badge
              variant={pasteMessage.includes('✓') ? 'default' : 'destructive'}
              className="animate-in fade-in slide-in-from-top-2"
            >
              {pasteMessage}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Galería de imágenes */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100">
                <img src={image} alt={`Producto ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-pink-500">Principal</Badge>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveImage(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Imágenes recomendadas</p>
                <p className="text-xs text-amber-700 mt-1">
                  Se recomienda agregar al menos una imagen de alta calidad. Los productos con imágenes tienen mejor rendimiento.
                </p>
              </div>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {images.length} {images.length === 1 ? 'imagen agregada' : 'imágenes agregadas'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  La primera imagen será la principal. Arrastra para reordenar después de crear el producto.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

