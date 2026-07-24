import { useState } from 'react'
import BottomNav from '../../components/common/BottomNav'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import WishProductCard from './WishProductCard'
import { MOCK_PRODUCTS } from '../home/products'
import { useWishStore } from '../../store/wishStore'
import type { WishType } from '../../store/wishStore'

const TABS: { id: WishType | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'receive', label: '받고 싶은' },
  { id: 'give', label: '주고 싶은' },
]

/** 위시 페이지: 위시 등록한 상품을 유형별로 모아 봅니다 (피그마 기준) */
export default function WishPage() {
  const { wishes, removeWish } = useWishStore()
  const [tab, setTab] = useState<WishType | 'all'>('all')

  const wishedProducts = MOCK_PRODUCTS.filter(
    (product) => product.id in wishes && (tab === 'all' || wishes[product.id] === tab),
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <header className="flex h-[50px] shrink-0 items-center px-[18px]">
        <h1 className="text-h1-sb text-black">위시</h1>
      </header>

      <div className="mt-6 flex flex-col gap-3 px-[18px]">
        <div className="flex flex-col gap-4">
          <h2 className="text-h3-sb text-black">선물</h2>
          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-2 text-b2-m ${
                  t.id === tab ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-caption1-r text-gray-500">선물 {wishedProducts.length}개</p>
          <div className="flex items-center gap-3">
            {/* TODO: 정렬 옵션(최신순 등) 구현 */}
            <button type="button" className="flex items-center gap-1">
              <span className="text-caption1-m text-black">최신순</span>
              <CaretDownIcon className="size-6 text-black" />
            </button>
            {/* TODO: 다중 선택 삭제 등 편집 모드 구현 */}
            <button type="button" className="text-caption1-m text-black">
              편집
            </button>
          </div>
        </div>

        {wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {wishedProducts.map((product) => (
              <WishProductCard key={product.id} product={product} onRemoveWish={() => removeWish(product.id)} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-b2-r leading-normal text-gray-500">
            아직 위시한 선물이 없어요
          </p>
        )}
      </div>

      <BottomNav active="gift" />
    </div>
  )
}
