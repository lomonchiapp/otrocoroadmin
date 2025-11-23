import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { 
  JewelrySearchWizard,
  GoldColor,
  JewelryType,
  JewelryWeave,
  JewelryThickness,
  JewelryKarat,
  JewelryLength,
  GOLD_COLORS,
  JEWELRY_TYPES,
  JEWELRY_WEAVES,
  JEWELRY_THICKNESS,
  JEWELRY_KARATS,
  JEWELRY_LENGTHS
} from '@/types/jewelry'

interface JewelrySearchWizardProps {
  onSearch: (criteria: JewelrySearchWizard) => void
  onReset: () => void
  isLoading?: boolean
}

export const JewelrySearchWizardComponent: React.FC<JewelrySearchWizardProps> = ({
  onSearch,
  onReset,
  isLoading = false
}) => {
  const [searchCriteria, setSearchCriteria] = useState<JewelrySearchWizard>({})
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [selectedKarats, setSelectedKarats] = useState<string[]>([])
  const [selectedThicknesses, setSelectedThicknesses] = useState<string[]>([])
  const [selectedWeaves, setSelectedWeaves] = useState<string[]>([])

  const handleGoldColorChange = (value: GoldColor) => {
    setSearchCriteria(prev => ({ ...prev, goldColor: value }))
  }

  const handleJewelryTypeChange = (value: JewelryType) => {
    setSearchCriteria(prev => ({ ...prev, jewelryType: value }))
  }

  const handleKaratToggle = (karat: JewelryKarat) => {
    setSelectedKarats(prev => 
      prev.includes(karat) 
        ? prev.filter(k => k !== karat)
        : [...prev, karat]
    )
  }

  const handleThicknessToggle = (thickness: JewelryThickness) => {
    setSelectedThicknesses(prev => 
      prev.includes(thickness) 
        ? prev.filter(t => t !== thickness)
        : [...prev, thickness]
    )
  }

  const handleWeaveToggle = (weave: JewelryWeave) => {
    setSelectedWeaves(prev => 
      prev.includes(weave) 
        ? prev.filter(w => w !== weave)
        : [...prev, weave]
    )
  }

  const handleLengthChange = (value: JewelryLength) => {
    setSearchCriteria(prev => ({ ...prev, length: value }))
  }

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value)
    setSearchCriteria(prev => ({ 
      ...prev, 
      priceRange: { min: value[0], max: value[1] }
    }))
  }

  const handleSearch = () => {
    const finalCriteria: JewelrySearchWizard = {
      ...searchCriteria,
      priceRange: { min: priceRange[0], max: priceRange[1] }
    }

    // Agregar filtros múltiples si están seleccionados
    if (selectedKarats.length > 0) {
      // En una implementación real, esto se manejaría diferente
      // Por ahora, tomamos el primero seleccionado
      finalCriteria.karat = selectedKarats[0] as JewelryKarat
    }

    if (selectedThicknesses.length > 0) {
      finalCriteria.thickness = selectedThicknesses[0] as JewelryThickness
    }

    if (selectedWeaves.length > 0) {
      finalCriteria.weave = selectedWeaves[0] as JewelryWeave
    }

    onSearch(finalCriteria)
  }

  const handleReset = () => {
    setSearchCriteria({})
    setPriceRange([0, 1000000])
    setSelectedKarats([])
    setSelectedThicknesses([])
    setSelectedWeaves([])
    onReset()
  }

  const getValidLengths = (jewelryType?: JewelryType) => {
    if (!jewelryType) return JEWELRY_LENGTHS
    return JEWELRY_LENGTHS.filter(length => {
      if (jewelryType === 'cadena') {
        return length.category === 'chain'
      } else if (jewelryType === 'guillo') {
        return length.category === 'bracelet' || length.category === 'anklet'
      }
      return false
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          Buscador de Joyería
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color del Oro */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Color del Oro</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GOLD_COLORS.map((color) => (
              <Button
                key={color.value}
                variant={searchCriteria.goldColor === color.value ? "default" : "outline"}
                className="flex items-center gap-2 h-auto p-3"
                onClick={() => handleGoldColorChange(color.value)}
              >
                <div 
                  className="w-6 h-6 rounded-full border border-gray-300" 
                  style={{ backgroundColor: color.color }}
                />
                {color.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tipo de Joya */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Tipo de Joya</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {JEWELRY_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={searchCriteria.jewelryType === type.value ? "default" : "outline"}
                className="flex items-center gap-2 h-auto p-3"
                onClick={() => handleJewelryTypeChange(type.value)}
              >
                <span className="text-xl">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Kilataje */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Kilataje</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {JEWELRY_KARATS.map((karat) => (
              <div key={karat.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`karat-${karat.value}`}
                  checked={selectedKarats.includes(karat.value)}
                  onCheckedChange={() => handleKaratToggle(karat.value)}
                />
                <Label 
                  htmlFor={`karat-${karat.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <div className="flex items-center gap-1">
                    <span>{karat.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {karat.purity}%
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tejido (solo para cadenas y guillos) */}
        {(searchCriteria.jewelryType === 'cadena' || searchCriteria.jewelryType === 'guillo') && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tejido</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {JEWELRY_WEAVES.map((weave) => (
                  <div key={weave.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`weave-${weave.value}`}
                      checked={selectedWeaves.includes(weave.value)}
                      onCheckedChange={() => handleWeaveToggle(weave.value)}
                    />
                    <Label 
                      htmlFor={`weave-${weave.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {weave.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Grosor */}
        <Separator />
        <div className="space-y-3">
          <Label className="text-base font-semibold">Grosor</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {JEWELRY_THICKNESS.map((thickness) => (
              <div key={thickness.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`thickness-${thickness.value}`}
                  checked={selectedThicknesses.includes(thickness.value)}
                  onCheckedChange={() => handleThicknessToggle(thickness.value)}
                />
                <Label 
                  htmlFor={`thickness-${thickness.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {thickness.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Longitud (solo para cadenas y guillos) */}
        {(searchCriteria.jewelryType === 'cadena' || searchCriteria.jewelryType === 'guillo') && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-base font-semibold">Longitud</Label>
              <Select onValueChange={handleLengthChange} value={searchCriteria.length}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la longitud" />
                </SelectTrigger>
                <SelectContent>
                  {getValidLengths(searchCriteria.jewelryType).map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Rango de Precio */}
        <Separator />
        <div className="space-y-3">
          <Label className="text-base font-semibold">Rango de Precio</Label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={1000000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange[0].toLocaleString('es-CO')} COP</span>
              <span>${priceRange[1].toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSearch} 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Buscando...' : 'Buscar Joyas'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Resumen de Filtros Aplicados */}
        {(Object.keys(searchCriteria).length > 0 || selectedKarats.length > 0 || selectedThicknesses.length > 0 || selectedWeaves.length > 0) && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium text-gray-600">Filtros Aplicados:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {searchCriteria.goldColor && (
                <Badge variant="secondary">
                  {GOLD_COLORS.find(c => c.value === searchCriteria.goldColor)?.label}
                </Badge>
              )}
              {searchCriteria.jewelryType && (
                <Badge variant="secondary">
                  {JEWELRY_TYPES.find(t => t.value === searchCriteria.jewelryType)?.label}
                </Badge>
              )}
              {selectedKarats.map(karat => (
                <Badge key={karat} variant="secondary">
                  {JEWELRY_KARATS.find(k => k.value === karat)?.label}
                </Badge>
              ))}
              {selectedThicknesses.map(thickness => (
                <Badge key={thickness} variant="secondary">
                  {JEWELRY_THICKNESS.find(t => t.value === thickness)?.label}
                </Badge>
              ))}
              {selectedWeaves.map(weave => (
                <Badge key={weave} variant="secondary">
                  {JEWELRY_WEAVES.find(w => w.value === weave)?.label}
                </Badge>
              ))}
              {searchCriteria.length && (
                <Badge variant="secondary">
                  {JEWELRY_LENGTHS.find(l => l.value === searchCriteria.length)?.label}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

