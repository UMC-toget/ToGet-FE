import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import ProductCard from './ProductCard'
import PriceFilterSheet from './PriceFilterSheet'
import WishTypeSheet from './WishTypeSheet'
import { GIFT_CATEGORIES, PRICE_FILTERS } from './products'
import type { PriceFilter } from './products'
import { useProducts } from './useProducts'
import { useWishToggle } from './useWishToggle'
import { formatDateDots } from '../../utils/formatDate'
import { useAuth } from '../../hooks/useAuth'

type Category = (typeof GIFT_CATEGORIES)[number]

const POPULAR_CATEGORY: Category = '요즘 인기'
/** 상단에 상시 노출하는 카드 개수. '요즘 인기'는 이 개수로 고정, 그 외 카테고리는 더보기로 확장 가능 */
const VISIBLE_COUNT = 10

/** 홈 선물 둘러보기 섹션: 카테고리 칩 + 기준일/가격 필터 + 상품 그리드 */
export default function GiftBrowseSection() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { getSelectedTypes, toggle } = useWishToggle(isLoggedIn)
  const [category, setCategory] = useState<Category>(POPULAR_CATEGORY)
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(PRICE_FILTERS[0])
  const [filterOpen, setFilterOpen] = useState(false)
  const [wishSheetProductId, setWishSheetProductId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleCategoryChange = (next: Category) => {
    setCategory(next)
    setExpanded(false)
  }

  // 비로그인 상태에서 위시 등록 버튼을 선택하면 로그인 화면으로 보냅니다. 상품 카드 클릭(정보 확인)은
  // 비로그인 상태에서도 가능합니다.
  const handleLoginRequired = () => navigate('/login')

  // 카테고리와 가격대 필터는 교집합으로 함께 서버에 전달합니다.
  // '요즘 인기'는 특정 상황(occasion) 태그가 아니라 사용자별 위시 등록 통계 내림차순(WISHLIST_DESC)으로
  // 전체 상품을 보여주는 탭이라 카테고리 조건을 걸지 않습니다.
  const isPopular = category === POPULAR_CATEGORY
  const { products: filteredProducts } = useProducts({
    category: isPopular ? undefined : category,
    minPrice: priceFilter.min > 0 ? priceFilter.min : undefined,
    maxPrice: Number.isFinite(priceFilter.max) ? priceFilter.max : undefined,
    sort: isPopular ? 'WISHLIST_DESC' : 'LATEST',
  })

  // '요즘 인기'는 상시 10개만 노출. 그 외 카테고리는 10개까지만 보여주고 더보기로 전체 노출.
  const visibleProducts =
    isPopular || !expanded ? filteredProducts.slice(0, VISIBLE_COUNT) : filteredProducts
  const hasMore = !isPopular && !expanded && filteredProducts.length > VISIBLE_COUNT

  return (
    <section className="flex flex-col gap-3">
      {/* 상품 카드를 스크롤해도 카테고리를 언제든 바꿀 수 있도록 상단 로고 헤더(h-[50px]) 바로 아래에 고정 (피그마 기준) */}
      <div className="sticky top-[50px] z-10 flex flex-col gap-3 bg-white pb-1 pt-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-h3-sb text-black">선물 둘러보기</h2>
          <div className="flex items-center gap-2">
            {GIFT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCategoryChange(c)}
                className={`rounded-full px-4 py-3 text-b2-m ${
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
      </div>
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              rank={isPopular ? index + 1 : undefined}
              isLoggedIn={isLoggedIn}
              wished={getSelectedTypes(product.id).length > 0}
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
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-7 flex h-[42px] items-center justify-center gap-2 rounded-xl border border-gray-600 bg-white"
        >
          <span className="text-b2-m font-semibold text-black">더보기</span>
          <ChevronRightIcon className="size-5 rotate-90 text-black" />
        </button>
      )}

      <PriceFilterSheet
        open={filterOpen}
        selected={priceFilter}
        onClose={() => setFilterOpen(false)}
        onSelect={setPriceFilter}
      />
      <WishTypeSheet
        open={wishSheetProductId != null}
        selected={wishSheetProductId != null ? getSelectedTypes(wishSheetProductId) : []}
        onClose={() => setWishSheetProductId(null)}
        onToggle={(type) => {
          const product = visibleProducts.find((p) => p.id === wishSheetProductId)
          if (product) toggle(product, type)
        }}
      />
    </section>
  )
}
