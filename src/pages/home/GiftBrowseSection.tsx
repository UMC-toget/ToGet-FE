import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import ProductCard from './ProductCard'
import PriceFilterSheet from './PriceFilterSheet'
import WishTypeSheet from './WishTypeSheet'
import { GIFT_CATEGORIES, PRICE_FILTERS } from './products'
import type { PriceFilter } from './products'
import { useProducts } from './useProducts'
import { formatDateDots } from '../../utils/formatDate'
import { useAuth } from '../../hooks/useAuth'
import { useWishStore } from '../../store/wishStore'
import type { WishType } from '../../store/wishStore'

type Category = (typeof GIFT_CATEGORIES)[number]

/** 홈 선물 둘러보기 섹션: 카테고리 칩 + 기준일/가격 필터 + 상품 그리드 */
export default function GiftBrowseSection() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { wishes, addWish, removeWish } = useWishStore()
  const [category, setCategory] = useState<Category>('요즘 인기')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(PRICE_FILTERS[0])
  const [filterOpen, setFilterOpen] = useState(false)
  const [wishSheetProductId, setWishSheetProductId] = useState<number | null>(null)

  // 비로그인 상태에서 상품 카드/위시 등록 버튼을 선택하면 로그인 화면으로 보냅니다 (피그마 B01 기준).
  const handleLoginRequired = () => navigate('/login')

  // TODO: 위시 등록/해제 API 연동 후 addWish/removeWish 호출을 실제 서버 요청으로 교체 (useWishStore 참고)
  const handleSelectWishType = (type: WishType | null) => {
    if (wishSheetProductId != null) {
      if (type === null) {
        removeWish(wishSheetProductId)
      } else {
        addWish(wishSheetProductId, type)
      }
    }
    setWishSheetProductId(null)
  }

  // 카테고리와 가격대 필터는 교집합으로 함께 서버에 전달합니다.
  // '요즘 인기'는 특정 상황(occasion) 태그가 아니라 전체를 인기순으로 보여주는 탭이라 카테고리 조건을 걸지 않습니다.
  // TODO: '요즘 인기'의 정렬은 사용자별 위시 등록 통계를 내림차순 집계한 순위여야 하는데, 아직 그런 정렬
  // 옵션이 API에 없어 우선 최신순(LATEST)으로 대체합니다.
  const { products: filteredProducts } = useProducts({
    category: category === '요즘 인기' ? undefined : category,
    minPrice: priceFilter.min > 0 ? priceFilter.min : undefined,
    maxPrice: Number.isFinite(priceFilter.max) ? priceFilter.max : undefined,
    sort: 'LATEST',
  })

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-4">
        <h2 className="text-h3-sb text-black">선물 둘러보기</h2>
        <div className="flex items-center gap-2">
          {GIFT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-b2-m ${
                c === category ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-caption1-r text-gray-500">{formatDateDots(new Date())} 기준</p>
        <button type="button" onClick={() => setFilterOpen(true)} className="flex items-center gap-1">
          <span className="text-caption1-m text-black">{priceFilter.label}</span>
          <CaretDownIcon className="size-6 text-black" />
        </button>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {/* TODO: 순위 API 연동 시 index+1이 아니라 서버가 내려주는 순위를 사용해야 함.
              '요즘 인기' 카테고리는 사용자별 위시 등록 통계를 내림차순 집계한 순위입니다. */}
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              rank={index + 1}
              isLoggedIn={isLoggedIn}
              wished={product.id in wishes}
              onLoginRequired={handleLoginRequired}
              onWishClick={() => setWishSheetProductId(product.id)}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-b2-r leading-normal text-gray-500">
          해당 가격대의 선물이 아직 없어요
        </p>
      )}

      <PriceFilterSheet
        open={filterOpen}
        selected={priceFilter}
        onClose={() => setFilterOpen(false)}
        onSelect={setPriceFilter}
      />
      <WishTypeSheet
        open={wishSheetProductId != null}
        selected={wishSheetProductId != null ? (wishes[wishSheetProductId] ?? null) : null}
        onClose={() => setWishSheetProductId(null)}
        onSelect={handleSelectWishType}
      />
    </section>
  )
}
