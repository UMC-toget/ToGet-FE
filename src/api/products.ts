import { apiClient, unwrap } from '../lib/apiClient'

export interface ApiProduct {
  productId: number
  name: string
  price: number
  description?: string
  imageUrl?: string
  purchaseUrl: string
  /** 서버 enum 코드 배열 (BIRTHDAY/GRADUATION/HOUSEWARMING) */
  categoryTypes: string[]
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

export type ProductSort = 'LATEST' | 'OLDEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'WISHLIST_DESC'

export interface GetProductsParams {
  /** 서버 enum 코드 (BIRTHDAY/GRADUATION/HOUSEWARMING) - 한글 라벨을 그대로 보내면 400 */
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

/** 상품 등록/수정 요청 본문. name/price/purchaseUrl/categoryTypes(1개 이상)는 필수입니다. [관리자 전용] */
export interface ProductInput {
  name: string
  price: number
  description?: string
  imageUrl?: string
  purchaseUrl: string
  /** 서버 enum 코드 배열 (BIRTHDAY/GRADUATION/HOUSEWARMING), 최소 1개 */
  categoryTypes: string[]
  brand?: string
}

/** [관리자 전용] 상품 등록 */
export function createProduct(payload: ProductInput) {
  return unwrap<{ productId: number }>(apiClient.post('/api/v1/products', payload))
}

/** [관리자 전용] 상품 수정 */
export function updateProduct(productId: number, payload: ProductInput) {
  return unwrap<ApiProduct>(apiClient.put(`/api/v1/products/${productId}`, payload))
}

/** [관리자 전용] 상품 삭제 */
export function deleteProduct(productId: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/products/${productId}`))
}
