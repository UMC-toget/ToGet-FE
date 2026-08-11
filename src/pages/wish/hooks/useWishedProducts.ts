import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWishlist } from '../../../api/wishlists'
import type { WishlistItemResponse } from '../../../api/wishlists'
import { getProducts } from '../../../api/products'
import type { WishType } from '../../../store/wishStore'
import type { ApiProduct } from '../../../api/products'
import type { Product } from '../../home/products'

export type SortOrder = 'latest' | 'oldest'

/** 상품 카탈로그에서 가져온 productId가 없는(직접 입력한) 위시 아이템에 붙이는 기본 브랜드 표기 */
const CUSTOM_WISH_BRAND = '위시 선물'

function itemToProduct(item: WishlistItemResponse, productById: Map<number, ApiProduct>): Product {
  const catalogProduct = item.productId != null ? productById.get(item.productId) : undefined
  return {
    id: item.wishlistItemId,
    brand: catalogProduct?.brand || CUSTOM_WISH_BRAND,
    name: item.name,
    price: item.price,
    // 카탈로그 상품은 최신 원본 이미지를 우선 사용합니다. 위시 생성 당시 저장된 URL은 만료될 수 있습니다.
    image: catalogProduct?.imageUrl || item.imageUrl || '',
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

  const productById = useMemo(() => {
    const map = new Map<number, ApiProduct>()
    for (const product of productsData?.products ?? []) {
      map.set(product.productId, product)
    }
    return map
  }, [productsData])

  const wishedProducts = useMemo<Product[]>(() => {
    if (!data?.wishlistItems) return []
    return data.wishlistItems.map((item) => itemToProduct(item, productById))
  }, [data, productById])

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
