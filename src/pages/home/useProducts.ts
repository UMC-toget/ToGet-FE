import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../api/products'
import type { ApiProduct, GetProductsParams } from '../../api/products'
import type { Product } from './products'

// 목록 화면에 페이지네이션 UI가 아직 없어, 한 번에 넉넉히 받아와 클라이언트에서 그대로 보여줍니다.
const DEFAULT_PAGE_SIZE = 100

function toProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.productId,
    brand: apiProduct.brand ?? '',
    name: apiProduct.name,
    price: apiProduct.price,
    image: apiProduct.imageUrl ?? '',
    occasion: apiProduct.category ?? '',
    link: apiProduct.purchaseUrl,
  }
}

/** 상품 목록 조회 (GET /api/v1/products 연동) */
export function useProducts(params?: GetProductsParams) {
  const query = useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts({ size: DEFAULT_PAGE_SIZE, ...params }),
  })
  return {
    products: (query.data?.products ?? []).map(toProduct),
    isLoading: query.isLoading,
  }
}
