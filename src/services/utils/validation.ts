/**
 * Utilidades de validación reutilizables
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class Validator {
  private errors: string[] = []
  private warnings: string[] = []

  /**
   * Validar que un campo no esté vacío
   */
  required(value: any, fieldName: string): this {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      this.errors.push(`${fieldName} es requerido`)
    }
    return this
  }

  /**
   * Validar longitud mínima de string
   */
  minLength(value: string, min: number, fieldName: string): this {
    if (value && value.length < min) {
      this.errors.push(`${fieldName} debe tener al menos ${min} caracteres`)
    }
    return this
  }

  /**
   * Validar longitud máxima de string
   */
  maxLength(value: string, max: number, fieldName: string): this {
    if (value && value.length > max) {
      this.errors.push(`${fieldName} debe tener máximo ${max} caracteres`)
    }
    return this
  }

  /**
   * Validar rango numérico
   */
  range(value: number, min: number, max: number, fieldName: string): this {
    if (value < min || value > max) {
      this.errors.push(`${fieldName} debe estar entre ${min} y ${max}`)
    }
    return this
  }

  /**
   * Validar email
   */
  email(value: string, fieldName: string = 'Email'): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      this.errors.push(`${fieldName} no es válido`)
    }
    return this
  }

  /**
   * Validar URL
   */
  url(value: string, fieldName: string = 'URL'): this {
    try {
      new URL(value)
    } catch {
      this.errors.push(`${fieldName} no es una URL válida`)
    }
    return this
  }

  /**
   * Validar que sea un número positivo
   */
  positive(value: number, fieldName: string): this {
    if (value < 0) {
      this.errors.push(`${fieldName} debe ser positivo`)
    }
    return this
  }

  /**
   * Validar que un array no esté vacío
   */
  notEmpty<T>(array: T[], fieldName: string): this {
    if (!array || array.length === 0) {
      this.errors.push(`${fieldName} no puede estar vacío`)
    }
    return this
  }

  /**
   * Validar longitud mínima de array
   */
  minArrayLength<T>(array: T[], min: number, fieldName: string): this {
    if (array && array.length < min) {
      this.errors.push(`${fieldName} debe tener al menos ${min} elementos`)
    }
    return this
  }

  /**
   * Agregar warning personalizado
   */
  addWarning(message: string): this {
    this.warnings.push(message)
    return this
  }

  /**
   * Agregar error personalizado
   */
  addError(message: string): this {
    this.errors.push(message)
    return this
  }

  /**
   * Validación personalizada
   */
  custom(condition: boolean, errorMessage: string): this {
    if (!condition) {
      this.errors.push(errorMessage)
    }
    return this
  }

  /**
   * Obtener resultado de validación
   */
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
    }
  }

  /**
   * Reset validator
   */
  reset(): this {
    this.errors = []
    this.warnings = []
    return this
  }
}

/**
 * Crear validador helper
 */
export function createValidator(): Validator {
  return new Validator()
}





