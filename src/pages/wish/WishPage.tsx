import { useState } from 'react'
import BottomNav from '../../components/common/BottomNav'
import Toast from '../../components/common/Toast'
import CaretDownIcon from '../../components/icons/CaretDownIcon'
import SearchIcon from '../../components/icons/SearchIcon'
import WishProductCard from './WishProductCard'
import { useProducts } from '../home/useProducts'
import { useWishStore } from '../../store/wishStore'
import type { WishType } from '../../store/wishStore'

const TOAST_DURATION_MS = 2000

const TABS: { id: WishType | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'receive', label: '받고 싶은' },
  { id: 'give', label: '주고 싶은' },
]

/** 위시 페이지: 위시 등록한 상품을 유형별로 모아 봅니다 (피그마 기준) */
export default function WishPage() {
  const { wishes, removeWish } = useWishStore()
  const { products } = useProducts()
  const [tab, setTab] = useState<WishType | 'all'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // TODO: 다중 선택 인터랙션은 PM/디자이너 확인 후 구현. 개별 상품의 수정/삭제는 카드를 눌러서 진행합니다.
  const handleClickEdit = () => {
    setToastMessage('선택 편집 기능은 준비 중이에요')
    setTimeout(() => setToastMessage(null), TOAST_DURATION_MS)
  }

  const wishedProducts = products.filter(
    (product) => product.id in wishes && (tab === 'all' || wishes[product.id].includes(tab)),
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-32">
      <header className="flex h-[50px] shrink-0 items-center justify-between px-[18px]">
        <h1 className="text-h1-sb text-black">위시</h1>
        {/* TODO: 검색 화면 구현 후 연결 */}
        <button type="button" aria-label="검색" className="text-gray-900">
          <SearchIcon />
        </button>
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
            <button type="button" onClick={handleClickEdit} className="text-caption1-m text-black">
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

      <Toast open={toastMessage !== null} message={toastMessage ?? ''} />
    </div>
  )
}
