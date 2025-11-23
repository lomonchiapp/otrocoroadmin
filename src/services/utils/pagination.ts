/**
 * Utilidades para paginación
 */

import type { Pagination, PaginatedResponse } from '@/types/shared'

export interface PaginationOptions {
  page?: number
  limit?: number
}

export class PaginationHelper {
  /**
   * Crear objeto de paginación
   */
  static create(page: number, limit: number, total: number): Pagination {
    const totalPages = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  /**
   * Paginar array en memoria
   */
  static paginate<T>(
    data: T[],
    options: PaginationOptions = {}
  ): PaginatedResponse<T> {
    const { page = 1, limit = 20 } = options
    
    const total = data.length
    const start = (page - 1) * limit
    const end = start + limit
    
    const paginatedData = data.slice(start, end)
    const pagination = this.create(page, limit, total)

    return {
      data: paginatedData,
      pagination,
    }
  }

  /**
   * Calcular offset desde página
   */
  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit
  }

  /**
   * Validar parámetros de paginación
   */
  static validateParams(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = Math.max(1, page || 1)
    const validatedLimit = Math.min(100, Math.max(1, limit || 20))

    return {
      page: validatedPage,
      limit: validatedLimit,
    }
  }
}





