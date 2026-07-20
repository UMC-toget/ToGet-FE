import { useState } from 'react'
import GiftIcon from '../../components/icons/GiftIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import type { Product } from './products'

interface ProductCardProps {
  product: Product
  /** 좌상단에 표시되는 순위 번호 */
  rank: number
}

/** 선물 둘러보기 상품 카드. 좌상단에 순위 번호, 우상단 버튼으로 위시 등록을 토글합니다. */
export default function ProductCard({ product, rank }: ProductCardProps) {
  const [wished, setWished] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-background p-3">
        <img src={product.image} alt={product.name} className="max-h-[75%] max-w-[80%] object-contain" />
        <span className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-700 text-caption1-m text-white">
          {/* 폰트 렌더링 특성상 숫자가 살짝 치우쳐 보여 보정합니다 (모바일 기준) */}
          <span className="translate-y-[-0.5px]">{rank}</span>
        </span>
        <button
          type="button"
          aria-label={wished ? '위시 해제' : '위시 등록'}
          aria-pressed={wished}
          onClick={() => setWished((prev) => !prev)}
          className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full ${
            wished ? 'bg-gray-900 text-white' : 'bg-white text-gray-200'
          }`}
        >
          <GiftIcon className="size-4" />
        </button>
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
    </div>
  )
}
