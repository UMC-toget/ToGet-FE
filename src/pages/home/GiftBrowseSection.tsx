import { useState } from 'react'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import ProductCard from './ProductCard'
import PriceFilterSheet from './PriceFilterSheet'
import { GIFT_CATEGORIES, MOCK_PRODUCTS, PRICE_FILTERS } from './products'
import type { PriceFilter } from './products'

type Category = (typeof GIFT_CATEGORIES)[number]

/** 홈 선물 둘러보기 섹션: 카테고리 칩 + 기준일/가격 필터 + 상품 그리드 */
export default function GiftBrowseSection() {
  const [category, setCategory] = useState<Category>('요즘 인기')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(PRICE_FILTERS[0])
  const [filterOpen, setFilterOpen] = useState(false)

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) => p.price >= priceFilter.min && p.price < priceFilter.max,
  )

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
        {/* TODO: 상품 API 연동 시 기준일 실제 데이터로 교체 */}
        <p className="text-caption1-r text-gray-500">2026.06.29 기준</p>
        <button type="button" onClick={() => setFilterOpen(true)} className="flex items-center gap-1">
          <span className="text-caption1-m text-black">{priceFilter.label}</span>
          <CaretDownIcon className="size-6 text-black" />
        </button>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
    </section>
  )
}
