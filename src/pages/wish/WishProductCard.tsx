import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlusIcon from '../../components/icons/PlusIcon'
import MoreVerticalIcon from '../../components/icons/MoreVerticalIcon'
import WishEditModeSheet from './WishEditModeSheet'
import type { Product } from '../home/products'

interface WishProductCardProps {
  product: Product
  onRemoveWish: () => void
}

/** 위시 페이지 상품 카드. 카드를 누르면 구매처 외부 링크로 이동, "⋮"를 누르면 수정하기/삭제하기 시트가 뜹니다 (피그마 기준) */
export default function WishProductCard({ product, onRemoveWish }: WishProductCardProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleCardClick = () => {
    if (product.link) window.open(product.link, '_blank', 'noopener,noreferrer')
    // TODO: 목업 상품에는 구매처 링크가 없어 현재는 이동하지 않습니다. 상품 API 연동 후 product.link로 교체
  }

  const handleMoreClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={handleCardClick} className="flex flex-col gap-2 text-left">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-background p-3">
          <img src={product.image} alt={product.name} className="max-h-[75%] max-w-[80%] object-contain" />
          <span
            role="button"
            tabIndex={0}
            aria-label="펀딩에 추가"
            // TODO: 선물 페이지 만들기 플로우와 연결 후 실제 동작 구현
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-900 text-white"
          >
            <PlusIcon className="size-4" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-caption1-r text-gray-700">{product.brand}</span>
            <span
              role="button"
              tabIndex={0}
              aria-label="더보기"
              onClick={handleMoreClick}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                handleMoreClick(e)
              }}
              className="flex size-5 items-center justify-center text-gray-700"
            >
              <MoreVerticalIcon className="size-5" />
            </span>
          </div>
          <p className="text-b2-m leading-normal text-black">{product.name}</p>
        </div>
        <p className="text-b2-m text-black">
          <span className="font-semibold">{product.price.toLocaleString()}</span>원
        </p>
      </button>

      <WishEditModeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectEdit={() => {
          setSheetOpen(false)
          navigate(`/wish/${product.id}/edit`)
        }}
        onSelectDelete={() => {
          setSheetOpen(false)
          onRemoveWish()
        }}
      />
    </div>
  )
}
