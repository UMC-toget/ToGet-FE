import { useState, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PlusIcon from '../../components/icons/PlusIcon'
import MoreVerticalIcon from '../../components/icons/MoreVerticalIcon'
import CheckIcon from '../../components/icons/CheckIcon'
import WishEditModeSheet from './WishEditModeSheet'
import type { Product } from '../home/products'

interface WishProductCardProps {
  product: Product
  onRemoveWish: () => void
  isEditMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  isGiftSelected?: boolean
  onToggleGiftSelect?: () => void
}

/** 위시 페이지 상품 카드. 카드를 누르면 구매처 외부 링크로 이동, "⋮"를 누르면 수정하기/삭제하기 시트가 뜹니다 (피그마 기준) */
const WishProductCard = memo(function WishProductCard({
  product,
  onRemoveWish,
  isEditMode = false,
  isSelected = false,
  onToggleSelect,
  isGiftSelected = false,
  onToggleGiftSelect,
}: WishProductCardProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleCardClick = useCallback(() => {
    if (isEditMode) {
      onToggleSelect?.()
      return
    }
    if (product.link) window.open(product.link, '_blank', 'noopener,noreferrer')
  }, [isEditMode, onToggleSelect, product.link])

  const handleMoreClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      if (isEditMode) return
      setSheetOpen(true)
    },
    [isEditMode],
  )

  const handlePlusClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation()
      if (isEditMode) return
      onToggleGiftSelect?.()
    },
    [isEditMode, onToggleGiftSelect],
  )

  const handleSelectEdit = useCallback(() => {
    setSheetOpen(false)
    navigate(`/wish/${product.id}/edit`)
  }, [navigate, product.id])

  const handleSelectDelete = useCallback(() => {
    setSheetOpen(false)
    onRemoveWish()
  }, [onRemoveWish])

  return (
    <div className="relative flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCardClick}
        className={`flex flex-col gap-2 text-left transition-opacity ${
          isEditMode && !isSelected ? 'opacity-80' : 'opacity-100'
        }`}
      >
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-background p-3">
          <img src={product.image} alt={product.name} className="max-h-[85%] max-w-[85%] object-contain" />

          {/* Edit mode selection check indicator */}
          {isEditMode ? (
            <div
              className={`absolute left-3 top-3 flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors ${
                isSelected ? 'border-pink-500 bg-pink-500 text-white' : 'border-gray-300 bg-white text-transparent'
              }`}
            >
              <CheckIcon className="size-4 stroke-[3]" />
            </div>
          ) : (
            <span
              role="button"
              tabIndex={0}
              aria-label="선물 추가 선택"
              onClick={handlePlusClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handlePlusClick(e)
              }}
              className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full transition-all ${
                isGiftSelected
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-900 text-white hover:scale-105'
              }`}
            >
              {isGiftSelected ? <CheckIcon className="size-4 stroke-[3]" /> : <PlusIcon className="size-4" />}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-caption1-r text-gray-700">{product.brand}</span>
            {!isEditMode && (
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
                className="flex size-5 items-center justify-center text-gray-700 hover:text-black"
              >
                <MoreVerticalIcon className="size-5" />
              </span>
            )}
          </div>
          <p className="text-b2-m leading-normal text-black line-clamp-2">{product.name}</p>
        </div>

        <p className="text-b2-m text-black">
          <span className="font-semibold">{product.price.toLocaleString()}</span>원
        </p>
      </button>

      <WishEditModeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectEdit={handleSelectEdit}
        onSelectDelete={handleSelectDelete}
      />
    </div>
  )
})

export default WishProductCard
