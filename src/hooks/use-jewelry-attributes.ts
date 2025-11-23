import { useState, useEffect } from 'react'
import { JewelryService } from '@/services/jewelryService'
import { attributeService } from '@/services/attributeService'
import type { JewelryAttribute, Attribute } from '@/types/jewelry'

export const useJewelryAttributes = (storeId?: string) => {
  const [jewelryAttributes, setJewelryAttributes] = useState<JewelryAttribute[]>([])
  const [regularAttributes, setRegularAttributes] = useState<Attribute[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAttributes = async () => {
      if (!storeId) return

      setIsLoading(true)
      setError(null)

      try {
        // Cargar atributos regulares desde el servicio
        const regularAttrs = await attributeService.getAttributesByStore(storeId)
        setRegularAttributes(regularAttrs)

        // Crear atributos específicos de joyería si no existen
        const defaultJewelryAttrs = JewelryService.createDefaultJewelryAttributes(storeId)
        
        // Verificar si ya existen atributos de joyería
        const existingJewelryAttrs = regularAttrs.filter(attr => 
          ['gold-color', 'jewelry-type', 'weave', 'thickness', 'karat', 'length'].includes(attr.id)
        )

        if (existingJewelryAttrs.length === 0) {
          // Crear atributos de joyería por defecto
          const createdAttrs = await Promise.all(
            defaultJewelryAttrs.map(async (attr) => {
              try {
                const createdAttr = await attributeService.createAttribute({
                  name: attr.name,
                  slug: attr.id,
                  type: 'custom' as any, // Mapear a tipo válido
                  inputType: 'select' as any,
                  productTypes: ['jewelry'],
                  isRequired: attr.isRequired || false,
                  isVariationAttribute: attr.isVariationAttribute || false,
                  isFilterable: true,
                  isVisible: true,
                  sortOrder: attr.displayOrder || 0,
                  description: '',
                  values: attr.values.map(v => ({
                    id: v.id,
                    attributeId: '',
                    value: v.value,
                    displayValue: v.label,
                    hexCode: v.metadata?.color,
                    sortOrder: 0,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  })),
                  storeId: storeId
                })
                return createdAttr
              } catch (error) {
                console.error(`Error creando atributo ${attr.name}:`, error)
                return null
              }
            })
          )

          const validAttrs = createdAttrs.filter(Boolean) as Attribute[]
          setRegularAttributes(prev => [...prev, ...validAttrs])
        }

        // Convertir atributos regulares a formato de joyería
        const jewelryAttrs: JewelryAttribute[] = regularAttrs
          .filter(attr => ['gold-color', 'jewelry-type', 'weave', 'thickness', 'karat', 'length'].includes(attr.id))
          .map(attr => ({
            id: attr.id,
            name: attr.name,
            type: attr.type as any,
            values: attr.values.map(v => ({
              id: v.id,
              value: v.value,
              label: v.label,
              metadata: v.metadata
            })),
            isRequired: attr.isRequired,
            isVariationAttribute: attr.isVariationAttribute,
            displayOrder: attr.displayOrder
          }))

        setJewelryAttributes(jewelryAttrs)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando atributos')
        console.error('Error cargando atributos de joyería:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAttributes()
  }, [storeId])

  const createJewelryVariation = (
    goldColor: string,
    jewelryType: string,
    karat: string,
    weave?: string,
    thickness?: string,
    length?: string
  ) => {
    try {
      return JewelryService.createJewelryVariation(
        goldColor as any,
        jewelryType as any,
        karat as any,
        weave as any,
        thickness as any,
        length as any
      )
    } catch (error) {
      console.error('Error creando variación de joyería:', error)
      throw error
    }
  }

  const generateSKU = (
    goldColor: string,
    jewelryType: string,
    karat: string,
    weave?: string,
    thickness?: string,
    length?: string
  ) => {
    return JewelryService.generateJewelrySKU(
      goldColor as any,
      jewelryType as any,
      karat as any,
      weave as any,
      thickness as any,
      length as any
    )
  }

  const calculatePrice = (
    karat: string,
    jewelryType: string,
    thickness?: string
  ) => {
    return JewelryService.calculateBasePrice(
      karat as any,
      jewelryType as any,
      thickness as any
    )
  }

  const getValidLengths = (jewelryType: string) => {
    return JewelryService.getValidLengthsForType(jewelryType as any)
  }

  const validateAttributes = (
    goldColor: string,
    jewelryType: string,
    karat: string,
    weave?: string,
    thickness?: string,
    length?: string
  ) => {
    return JewelryService.validateJewelryAttributes(
      goldColor as any,
      jewelryType as any,
      karat as any,
      weave as any,
      thickness as any,
      length as any
    )
  }

  return {
    jewelryAttributes,
    regularAttributes,
    isLoading,
    error,
    createJewelryVariation,
    generateSKU,
    calculatePrice,
    getValidLengths,
    validateAttributes
  }
}
