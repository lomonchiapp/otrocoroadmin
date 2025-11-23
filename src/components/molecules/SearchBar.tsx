/**
 * Barra de búsqueda reutilizable con filtros opcionales
 */

import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
  filters?: React.ReactNode
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  onClear,
  filters,
  className,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Input de búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Botón de filtros */}
      {filters && (
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            {filters}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}





