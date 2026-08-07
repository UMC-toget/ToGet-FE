import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWishlist } from '../../../api/wishlists'
import type { WishlistItemResponse } from '../../../api/wishlists'
import type { WishType } from '../../../store/wishStore'
import type { Product } from '../../home/products'

export type SortOrder = 'latest' | 'oldest'

function itemToProduct(item: WishlistItemResponse): Product {
  return {
    id: item.wishlistItemId,
    brand: '위시 선물',
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

  const wishedProducts = useMemo<Product[]>(() => {
    if (!data?.wishlistItems) return []
    return data.wishlistItems.map(itemToProduct)
  }, [data])

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
