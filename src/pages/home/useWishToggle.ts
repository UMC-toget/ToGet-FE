import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createWishlistItem, deleteWishlistItem, getWishlist } from '../../api/wishlists'
import type { WishlistType } from '../../api/wishlists'
import type { Product } from './products'
import type { WishType } from '../../store/wishStore'
import { trackEvent } from '../../lib/analytics'

const WISHLIST_QUERY_KEY = ['wishlists', 'all']

function toApiType(type: WishType): WishlistType {
  return type === 'receive' ? 'RECEIVE' : 'GIVE'
}

/**
 * 홈 "선물 둘러보기" 상품 카드의 위시 등록 상태를 실제 백엔드(GET·POST·DELETE /api/v1/wishlists)와
 * 동기화합니다. 상품 하나에 받고 싶은/주고 싶은을 각각 별도 아이템으로 등록할 수 있습니다.
 */
export function useWishToggle(enabled: boolean) {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => getWishlist({ size: 100 }),
    enabled,
  })

  // productId -> 유형별로 등록된 wishlistItemId
  const wishIndex = useMemo(() => {
    const index: Record<number, Partial<Record<WishType, number>>> = {}
    for (const item of data?.wishlistItems ?? []) {
      if (item.productId == null) continue
      const type: WishType = item.type === 'RECEIVE' ? 'receive' : 'give'
      index[item.productId] = { ...index[item.productId], [type]: item.wishlistItemId }
    }
    return index
  }, [data])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY })

  const addMutation = useMutation({
    mutationFn: ({ product, type }: { product: Product; type: WishType }) =>
      createWishlistItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        purchaseUrl: product.link || '',
        imageUrl: product.image || undefined,
        type: toApiType(type),
      }),
    onSuccess: (_data, variables) => {
      trackEvent('wish_create', { wish_type: variables.type })
      invalidate()
    },
  })

  const removeMutation = useMutation({
    mutationFn: (wishlistItemId: number) => deleteWishlistItem(wishlistItemId),
    onSuccess: invalidate,
  })

  const getSelectedTypes = (productId: number): WishType[] =>
    Object.keys(wishIndex[productId] ?? {}) as WishType[]

  const toggle = (product: Product, type: WishType) => {
    const existingId = wishIndex[product.id]?.[type]
    if (existingId != null) {
      removeMutation.mutate(existingId)
    } else {
      addMutation.mutate({ product, type })
    }
  }

  return { getSelectedTypes, toggle }
}
