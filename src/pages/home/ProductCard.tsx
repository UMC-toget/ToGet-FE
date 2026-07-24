import { useState } from 'react'
import GiftIcon from '../../components/icons/GiftIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import type { Product } from './products'

interface ProductCardProps {
  product: Product
  /** 좌상단에 표시되는 순위 번호 */
  rank: number
  isLoggedIn: boolean
  /** 비로그인 상태에서 카드/위시 버튼 클릭 시 호출 (로그인 화면으로 라우팅) */
  onLoginRequired: () => void
}

/** 선물 둘러보기 상품 카드. 좌상단에 순위 번호, 우상단 버튼으로 위시 등록을 토글합니다. */
export default function ProductCard({ product, rank, isLoggedIn, onLoginRequired }: ProductCardProps) {
  const [wished, setWished] = useState(false)

  const handleCardClick = () => {
    if (!isLoggedIn) onLoginRequired()
    // TODO: 상품 상세 화면 구현 후 로그인 상태일 때 해당 화면으로 라우팅
  }

  const toggleWish = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      onLoginRequired()
      return
    }
    setWished((prev) => !prev)
  }

  return (
    <button type="button" onClick={handleCardClick} className="flex flex-col gap-2 text-left">
      <div className="relative flex size-[175px] items-center justify-center rounded-xl bg-background p-3">
        <img src={product.image} alt={product.name} className="max-h-[75%] max-w-[80%] object-contain" />
        <span className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-700 text-caption1-m text-white">
          {/* 폰트 렌더링 특성상 숫자가 살짝 치우쳐 보여 보정합니다 (모바일 기준) */}
          <span className="translate-y-[-0.5px]">{rank}</span>
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={wished ? '위시 해제' : '위시 등록'}
          aria-pressed={wished}
          onClick={toggleWish}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return
            e.preventDefault()
            toggleWish(e)
          }}
          className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full ${
            wished ? 'bg-gray-900 text-white' : 'bg-white text-gray-200'
          }`}
        >
          <GiftIcon className="size-4" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-caption1-r text-gray-700">{product.brand}</span>
          <ChevronRightIcon className="size-5 text-gray-700" />
        </div>
        <p className="text-b2-m leading-normal text-black">{product.name}</p>
      </div>
      <p className="text-b2-m text-black">
        <span className="font-semibold">{product.price.toLocaleString()}</span>원
      </p>
    </button>
  )
}
