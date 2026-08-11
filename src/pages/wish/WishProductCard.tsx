import { useState, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PlusIcon from '../../components/icons/PlusIcon'
import MoreVerticalIcon from '../../components/icons/MoreVerticalIcon'
import CheckIcon from '../../components/icons/CheckIcon'
import GiftIcon from '../../components/icons/GiftIcon'
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
  /** 검색 페이지에서 전달되면, 상품 이름 중 이 키워드와 일치하는 부분을 회색으로 표시합니다 (피그마 1716:105914 기준) */
  highlightKeyword?: string
}

/** 상품 이름을 키워드 기준으로 나눠, 일치하는 부분만 gray-300으로 표시할 수 있게 세그먼트로 반환합니다 */
function splitByKeyword(text: string, keyword: string) {
  const trimmed = keyword.trim()
  if (!trimmed) return [{ text, matched: false }]

  const lowerText = text.toLowerCase()
  const lowerKeyword = trimmed.toLowerCase()
  const segments: { text: string; matched: boolean }[] = []
  let cursor = 0
  let idx = lowerText.indexOf(lowerKeyword, cursor)

  while (idx !== -1) {
    if (idx > cursor) segments.push({ text: text.slice(cursor, idx), matched: false })
    segments.push({ text: text.slice(idx, idx + trimmed.length), matched: true })
    cursor = idx + trimmed.length
    idx = lowerText.indexOf(lowerKeyword, cursor)
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false })
  return segments
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
  highlightKeyword,
}: WishProductCardProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [imageBroken, setImageBroken] = useState(false)

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
      <button type="button" onClick={handleCardClick} className="flex flex-col text-left">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-background p-3">
          {product.image && !imageBroken ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[85%] max-w-[85%] object-contain"
              onError={() => setImageBroken(true)}
            />
          ) : (
            <GiftIcon className="size-10 text-gray-300" />
          )}

          {/* 선택된 카드만 이미지 박스 전체에 어두운 레이어를 씌웁니다 (피그마 1746:51289 기준) */}
          {isEditMode && isSelected && <div className="absolute inset-0 rounded-xl bg-[rgba(30,29,30,0.1)]" />}

          {/* Edit mode selection check indicator (피그마 1716:99383 기준: 상품 추가 +버튼과 같은 자리) */}
          {isEditMode ? (
            <div
              className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full shadow-sm transition-colors ${
                isSelected ? 'bg-gray-900 text-white' : 'bg-white text-gray-300'
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

        <div className="mt-2 flex flex-col">
          <div className="flex items-center justify-end">
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
          </div>
          <p className="mt-3 min-h-[36px] leading-[1.5] text-b2-m text-black">
            {highlightKeyword
              ? splitByKeyword(product.name, highlightKeyword).map((segment, i) => (
                  <span key={i} className={segment.matched ? 'text-gray-300' : undefined}>
                    {segment.text}
                  </span>
                ))
              : product.name}
          </p>
        </div>

        <p className="mt-6 text-b2-m text-black">
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
