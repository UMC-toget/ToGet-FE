import { apiClient, unwrap } from '../lib/apiClient'

export type WishlistType = 'GIVE' | 'RECEIVE'
export type WishlistSort = 'LATEST' | 'OLDEST'

export interface WishlistItemResponse {
  wishlistItemId: number
  productId: number | null
  name: string
  price: number
  purchaseUrl: string
  imageUrl: string
  type: WishlistType
  createdAt: string
}

export interface WishlistListResponse {
  wishlistItems: WishlistItemResponse[]
  currentPage: number
  pageSize: number
  hasNext: boolean
}

export interface WishlistCreateRequest {
  productId?: number | null
  name: string
  price: number
  purchaseUrl: string
  imageUrl?: string
  type: WishlistType
}

export interface WishlistCreateResponse {
  wishlistItemId: number
  productId: number | null
}

export interface WishlistUpdateRequest {
  name: string
  price: number
  purchaseUrl: string
  imageUrl?: string
  type: WishlistType
}

export interface WishlistUpdateResponse {
  wishlistItemId: number
  name: string
  price: number
  purchaseUrl: string
  imageUrl: string
  type: WishlistType
}

export interface GetWishlistParams {
  type?: WishlistType
  page?: number
  size?: number
  sort?: WishlistSort
}

/** 위시리스트 목록 조회 (GET /api/v1/wishlists) */
export function getWishlist(params?: GetWishlistParams) {
  return unwrap<WishlistListResponse>(apiClient.get('/api/v1/wishlists', { params }))
}

/** 위시리스트 아이템 생성 (POST /api/v1/wishlists) */
export function createWishlistItem(data: WishlistCreateRequest) {
  return unwrap<WishlistCreateResponse>(apiClient.post('/api/v1/wishlists', data))
}

/** 위시리스트 아이템 수정 (PUT /api/v1/wishlists/{wishlistItemId}) */
export function updateWishlistItem(wishlistItemId: number, data: WishlistUpdateRequest) {
  return unwrap<WishlistUpdateResponse>(apiClient.put(`/api/v1/wishlists/${wishlistItemId}`, data))
}

/** 위시리스트 아이템 삭제 (DELETE /api/v1/wishlists/{wishlistItemId}) */
export function deleteWishlistItem(wishlistItemId: number) {
  return unwrap<void>(apiClient.delete(`/api/v1/wishlists/${wishlistItemId}`))
}
