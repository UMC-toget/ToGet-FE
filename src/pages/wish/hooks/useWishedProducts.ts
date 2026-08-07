import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWishlist } from '../../../api/wishlists'
import type { WishlistItemResponse } from '../../../api/wishlists'
import { getProducts } from '../../../api/products'
import type { WishType } from '../../../store/wishStore'
import type { Product } from '../../home/products'

export type SortOrder = 'latest' | 'oldest'

/** 상품 카탈로그에서 가져온 productId가 없는(직접 입력한) 위시 아이템에 붙이는 기본 브랜드 표기 */
const CUSTOM_WISH_BRAND = '위시 선물'

function itemToProduct(item: WishlistItemResponse, brandById: Map<number, string>): Product {
  return {
    id: item.wishlistItemId,
    brand: (item.productId != null && brandById.get(item.productId)) || CUSTOM_WISH_BRAND,
    name: item.name,
    price: item.price,
    image: item.imageUrl,
    occasion: '',
    link: item.purchaseUrl,
  }
}

export function useWishedProducts(
  tab: WishType | 'all' = 'all',
  sortOrder: SortOrder = 'latest',
) {
  const apiType = tab === 'receive' ? 'RECEIVE' : tab === 'give' ? 'GIVE' : undefined
  const apiSort = sortOrder === 'latest' ? 'LATEST' : 'OLDEST'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wishlist', tab, sortOrder],
    queryFn: () =>
      getWishlist({
        type: apiType,
        sort: apiSort,
        size: 100,
      }),
  })

  // 카탈로그에서 등록된(productId가 있는) 위시 아이템의 실제 브랜드를 보여주기 위한 조회
  const { data: productsData } = useQuery({
    queryKey: ['products', 'brandLookup'],
    queryFn: () => getProducts({ size: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const brandById = useMemo(() => {
    const map = new Map<number, string>()
    for (const product of productsData?.products ?? []) {
      if (product.brand) map.set(product.productId, product.brand)
    }
    return map
  }, [productsData])

  const wishedProducts = useMemo<Product[]>(() => {
    if (!data?.wishlistItems) return []
    return data.wishlistItems.map((item) => itemToProduct(item, brandById))
  }, [data, brandById])

  const searchWishedProducts = useMemo(() => {
    return (keyword: string) => {
      const trimmed = keyword.trim().toLowerCase()
      if (!trimmed) return []
      return wishedProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(trimmed) ||
          product.brand.toLowerCase().includes(trimmed),
      )
    }
  }, [wishedProducts])

  return {
    allProducts: wishedProducts,
    allWishedProducts: wishedProducts,
    wishedProducts,
    rawItems: data?.wishlistItems ?? [],
    searchWishedProducts,
    isLoading,
    refetch,
  }
}
