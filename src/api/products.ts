import { apiClient, unwrap } from '../lib/apiClient'

export interface ApiProduct {
  productId: number
  name: string
  price: number
  description?: string
  imageUrl?: string
  purchaseUrl: string
  category?: string
  brand?: string
  createdAt: string
  updatedAt: string
}

export interface ProductListResult {
  products: ApiProduct[]
  currentPage: number
  pageSize: number
  hasNext: boolean
}

export type ProductSort = 'LATEST' | 'OLDEST' | 'PRICE_ASC' | 'PRICE_DESC'

export interface GetProductsParams {
  category?: string
  keyword?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
  sort?: ProductSort
}

export function getProducts(params?: GetProductsParams) {
  return unwrap<ProductListResult>(apiClient.get('/api/v1/products', { params }))
}

export function getProduct(productId: number) {
  return unwrap<ApiProduct>(apiClient.get(`/api/v1/products/${productId}`))
}
