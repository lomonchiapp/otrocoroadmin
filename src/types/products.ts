// Archivo principal de productos - re-exporta todos los tipos relacionados
export type {
  ProductType,
  ProductStatus,
  InventoryPolicy,
  BaseProduct,
  Product,
  ProductImage,
  Metafield
} from './product-base'

export type {
  ProductFilters,
  ProductSearchParams,
  PaginatedProductResponse,
  BulkOperation,
  BulkError
} from './product-filters'

export type {
  ClothingProduct,
  JewelryProduct,
  ClothingDetails,
  JewelryDetails,
  Material,
  Gemstone,
  Dimensions
} from './product-legacy'