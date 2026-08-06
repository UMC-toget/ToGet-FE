import { useMemo } from 'react'
import { useProducts } from '../../home/useProducts'
import { useWishStore } from '../../../store/wishStore'
import type { WishType } from '../../../store/wishStore'
import type { Product } from '../../home/products'

export type SortOrder = 'latest' | 'oldest'

export function useWishedProducts(
  tab: WishType | 'all' = 'all',
  sortOrder: SortOrder = 'latest',
) {
  const { products, isLoading } = useProducts()
  const wishes = useWishStore((state) => state.wishes)
  const customWishes = useWishStore((state) => state.customWishes)

  // 결합된 전체 상품 목록 (기본 API 상품 + 사용자 생성 커스텀 위시 상품)
  const allProducts = useMemo<Product[]>(() => {
    const customList: Product[] = Object.values(customWishes).map((c) => ({
      id: c.id,
      brand: c.brand,
      name: c.name,
      price: c.price,
      image: c.image,
      occasion: '',
      link: c.purchaseUrl,
    }))
    return [...products, ...customList]
  }, [products, customWishes])

  // 위시에 등록된 상품만 필터링
  const allWishedProducts = useMemo<Product[]>(() => {
    return allProducts.filter((product) => product.id in wishes)
  }, [allProducts, wishes])

  // 탭 카테고리 및 정렬 순서 적용 상품 목록
  const wishedProducts = useMemo<Product[]>(() => {
    return allWishedProducts
      .filter((product) => {
        if (tab !== 'all') {
          const types = wishes[product.id]
          if (!types || (Array.isArray(types) ? !types.includes(tab) : types !== tab)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'latest') {
          return b.id - a.id
        }
        return a.id - b.id
      })
  }, [allWishedProducts, tab, wishes, sortOrder])

  // 검색 키워드 기반 필터링 함수 (WishSearchPage에서 사용)
  const searchWishedProducts = useMemo(() => {
    return (keyword: string) => {
      const trimmed = keyword.trim().toLowerCase()
      if (!trimmed) return []
      return allWishedProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(trimmed) ||
          product.brand.toLowerCase().includes(trimmed),
      )
    }
  }, [allWishedProducts])

  return {
    allProducts,
    allWishedProducts,
    wishedProducts,
    searchWishedProducts,
    isLoading,
  }
}
