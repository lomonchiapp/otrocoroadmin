/**
 * Utilidades para búsqueda y filtrado
 */

export class SearchHelper {
  /**
   * Normalizar string para búsqueda (lowercase, sin acentos)
   */
  static normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  /**
   * Buscar en múltiples campos
   */
  static searchInFields<T>(
    items: T[],
    query: string,
    fields: (keyof T)[]
  ): T[] {
    if (!query || query.trim().length === 0) {
      return items
    }

    const normalizedQuery = this.normalize(query)

    return items.filter((item) => {
      return fields.some((field) => {
        const value = item[field]
        if (typeof value === 'string') {
          return this.normalize(value).includes(normalizedQuery)
        }
        if (typeof value === 'number') {
          return value.toString().includes(query)
        }
        return false
      })
    })
  }

  /**
   * Filtrar por tags
   */
  static filterByTags<T extends { tags?: string[] }>(
    items: T[],
    tags: string[]
  ): T[] {
    if (!tags || tags.length === 0) {
      return items
    }

    return items.filter((item) => {
      if (!item.tags || item.tags.length === 0) return false
      return tags.some((tag) => item.tags?.includes(tag))
    })
  }

  /**
   * Filtrar por rango numérico
   */
  static filterByRange<T>(
    items: T[],
    field: keyof T,
    min?: number,
    max?: number
  ): T[] {
    return items.filter((item) => {
      const value = item[field]
      if (typeof value !== 'number') return true

      if (min !== undefined && value < min) return false
      if (max !== undefined && value > max) return false
      return true
    })
  }

  /**
   * Filtrar por fecha
   */
  static filterByDateRange<T>(
    items: T[],
    field: keyof T,
    startDate?: Date,
    endDate?: Date
  ): T[] {
    return items.filter((item) => {
      const value = item[field]
      if (!(value instanceof Date)) return true

      if (startDate && value < startDate) return false
      if (endDate && value > endDate) return false
      return true
    })
  }

  /**
   * Ordenar items
   */
  static sort<T>(
    items: T[],
    field: keyof T,
    order: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...items].sort((a, b) => {
      const valueA = a[field]
      const valueB = b[field]

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB)
        return order === 'asc' ? comparison : -comparison
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order === 'asc' ? valueA - valueB : valueB - valueA
      }

      if (valueA instanceof Date && valueB instanceof Date) {
        return order === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime()
      }

      return 0
    })
  }

  /**
   * Buscar con fuzzy matching
   */
  static fuzzySearch(text: string, query: string): boolean {
    const normalizedText = this.normalize(text)
    const normalizedQuery = this.normalize(query)
    
    let queryIndex = 0
    
    for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
      if (normalizedText[i] === normalizedQuery[queryIndex]) {
        queryIndex++
      }
    }
    
    return queryIndex === normalizedQuery.length
  }
}





