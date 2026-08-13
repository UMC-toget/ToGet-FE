export const GIFT_CATEGORIES = ['요즘 인기', '생일', '졸업', '집들이'] as const

/** 실제 상품에 지정 가능한 카테고리('요즘 인기'는 홈 탭 전용 가상 필터라 제외) */
export const PRODUCT_CATEGORY_TYPES = ['생일', '졸업', '집들이'] as const
export type ProductCategoryType = (typeof PRODUCT_CATEGORY_TYPES)[number]

/** 한글 카테고리 라벨 -> 서버 categoryTypes enum 코드 (GET /products의 category 필터, POST/PUT 요청 바디 모두 이 코드를 씀) */
export const CATEGORY_CODE_BY_LABEL: Record<ProductCategoryType, string> = {
  생일: 'BIRTHDAY',
  졸업: 'GRADUATION',
  집들이: 'HOUSEWARMING',
}

/** 서버 categoryTypes enum 코드 -> 한글 라벨 (상품 상세/수정 폼에 표시할 때 역변환용) */
export const CATEGORY_LABEL_BY_CODE: Record<string, ProductCategoryType> = {
  BIRTHDAY: '생일',
  GRADUATION: '졸업',
  HOUSEWARMING: '집들이',
}

export interface Product {
  id: number
  brand: string
  name: string
  price: number
  image: string
  /** 서버가 내려주는 카테고리 문자열 (없으면 빈 문자열) */
  occasion: string
  /** 상품 구매처 외부 링크 */
  link?: string
}

export interface PriceFilter {
  id: string
  label: string
  /** 이상 (원) */
  min: number
  /** 미만 (원). 상한 없음은 Infinity */
  max: number
}

export const PRICE_FILTERS: PriceFilter[] = [
  { id: 'all', label: '전체', min: 0, max: Infinity },
  { id: '10k', label: '1만 원대', min: 10_000, max: 20_000 },
  { id: '20k', label: '2만 원대', min: 20_000, max: 30_000 },
  { id: '30k', label: '3만 원대', min: 30_000, max: 40_000 },
  { id: '40k', label: '4만 원대', min: 40_000, max: 50_000 },
  { id: '50k', label: '5만 원대', min: 50_000, max: 60_000 },
  { id: 'over-100k', label: '10만 원 이상', min: 100_000, max: Infinity },
]
