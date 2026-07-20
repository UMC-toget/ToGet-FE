import productLipbalm from '../../assets/mock/product-lipbalm.png'
import productVitamin from '../../assets/mock/product-vitamin.png'
import productCamera from '../../assets/mock/product-camera.png'
import productRoomspray from '../../assets/mock/product-roomspray.png'
import productCushion from '../../assets/mock/product-cushion.png'
import productPerfume from '../../assets/mock/product-perfume.png'
import productHandcream from '../../assets/mock/product-handcream.png'
import productLamp from '../../assets/mock/product-lamp.png'

export interface Product {
  id: number
  brand: string
  name: string
  price: number
  image: string
}

/** TODO: 상품 API 연동 후 제거 (피그마 디자인 기준 목업 데이터) */
export const MOCK_PRODUCTS: Product[] = [
  { id: 1, brand: '입생로랑', name: '[향수1.2ML증정] 캔디글로우 립밤', price: 49000, image: productLipbalm },
  { id: 2, brand: '오쏘몰', name: '이뮨 멀티비타민 &미네랄 7입', price: 43000, image: productVitamin },
  { id: 3, brand: '부이', name: '부이 Y2K 디지털 카메라', price: 42900, image: productCamera },
  { id: 4, brand: '이솝', name: '콤팩트 룸 스프레이', price: 47000, image: productRoomspray },
  { id: 5, brand: '헤라', name: "[각인] 블랙 쿠션 파운데이션 '싱글' 본품1 + 증정", price: 46800, image: productCushion },
  { id: 6, brand: '포맨트', name: '포맨트 퍼퓸 헬로키티 에디션 +증정 (2종 택1)', price: 49000, image: productPerfume },
  { id: 7, brand: '탬버린즈', name: '[선물포장] BEST 미니 퍼퓸 핸드크림 (신규향 단독 런칭)', price: 18500, image: productHandcream },
  { id: 8, brand: '오브리', name: '오브리 도트 머쉬룸 램프 화이트', price: 65000, image: productLamp },
]

export const GIFT_CATEGORIES = ['요즘 인기', '생일', '졸업', '집들이'] as const

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
