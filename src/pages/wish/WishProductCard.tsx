import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlusIcon from '../../components/icons/PlusIcon'
import WishEditModeSheet from './WishEditModeSheet'
import type { Product } from '../home/products'

interface WishProductCardProps {
  product: Product
  onRemoveWish: () => void
}

/** 위시 페이지 상품 카드. 좌상단 "+"로 펀딩에 추가, 카드를 누르면 수정하기/삭제하기 시트가 뜹니다 (피그마 기준) */
export default function WishProductCard({ product, onRemoveWish }: WishProductCardProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-background p-3"
        >
          <img src={product.image} alt={product.name} className="max-h-[75%] max-w-[80%] object-contain" />
        </button>
        <button
          type="button"
          aria-label="펀딩에 추가"
          // TODO: 선물 페이지 만들기 플로우와 연결 후 실제 동작 구현
          className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-900 text-white"
        >
          <PlusIcon className="size-2" />
        </button>
      </div>
      <button type="button" onClick={() => setSheetOpen(true)} className="flex flex-col gap-1 text-left">
        <span className="text-caption1-r text-gray-700">{product.brand}</span>
        <p className="text-b2-m leading-normal text-black">{product.name}</p>
      </button>
      <p className="text-b2-m text-black">
        <span className="font-semibold">{product.price.toLocaleString()}</span>원
      </p>

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
