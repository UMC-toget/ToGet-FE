import { useState } from 'react'
import MoreVerticalIcon from '../../components/icons/MoreVerticalIcon'
import PlusIcon from '../../components/icons/PlusIcon'
import type { Product } from '../home/products'

interface WishProductCardProps {
  product: Product
  onRemoveWish: () => void
}

/** 위시 페이지 상품 카드. 좌상단 "+"로 펀딩에 추가, 우측 "⋮"로 위시 해제 (피그마 기준) */
export default function WishProductCard({ product, onRemoveWish }: WishProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex size-[175px] items-center justify-center rounded-xl bg-background p-3">
        <img src={product.image} alt={product.name} className="max-h-[75%] max-w-[80%] object-contain" />
        <button
          type="button"
          aria-label="펀딩에 추가"
          // TODO: 선물 페이지 만들기 플로우와 연결 후 실제 동작 구현
          className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-900 text-white"
        >
          <PlusIcon className="size-3" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-caption1-r text-gray-700">{product.brand}</span>
          <div className="relative">
            <button
              type="button"
              aria-label="더보기"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex size-5 items-center justify-center text-gray-700"
            >
              <MoreVerticalIcon className="size-5" />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-24 rounded-lg border border-gray-100 bg-white py-1 shadow-md">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onRemoveWish()
                    }}
                    className="w-full px-3 py-2 text-left text-caption1-m text-black"
                  >
                    위시 해제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="text-b2-m leading-normal text-black">{product.name}</p>
      </div>
      <p className="text-b2-m text-black">
        <span className="font-semibold">{product.price.toLocaleString()}</span>원
      </p>
    </div>
  )
}
