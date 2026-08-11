import { useState } from 'react'
import GiftIcon from '../../components/icons/GiftIcon'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useImageHasBackground } from '../../hooks/useImageHasBackground'
import type { Product } from './products'

interface ProductCardProps {
  product: Product
  /** 좌상단에 표시되는 순위 번호. '요즘 인기' 카테고리에서만 전달됩니다 */
  rank?: number
  isLoggedIn: boolean
  /** 위시 등록 여부 (전역 위시 스토어 기준) */
  wished: boolean
  /** 비로그인 상태에서 위시 버튼 클릭 시 호출 (로그인 화면으로 라우팅). 카드 클릭(상품 정보 보기)은 비로그인 상태에서도 가능합니다. */
  onLoginRequired: () => void
  /** 위시 버튼 클릭 시 호출 (위시 유형 선택 바텀시트 오픈 — 이미 등록된 상품이면 현재 유형이 미리 선택된 채로 열림) */
  onWishClick: () => void
}

/** 선물 둘러보기 상품 카드. 좌상단에 순위 번호, 우상단 버튼으로 위시 등록을 토글합니다. */
export default function ProductCard({ product, rank, isLoggedIn, wished, onLoginRequired, onWishClick }: ProductCardProps) {
  const [imageBroken, setImageBroken] = useState(false)
  const [linkConfirmOpen, setLinkConfirmOpen] = useState(false)
  const hasBackground = useImageHasBackground(product.image || null)

  const handleCardClick = () => {
    if (product.link) setLinkConfirmOpen(true)
  }

  const handleWishClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      onLoginRequired()
      return
    }
    onWishClick()
  }

  return (
    <>
      <button type="button" onClick={handleCardClick} className="flex flex-col text-left">
        <div
          className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-background ${hasBackground ? '' : 'p-3'}`}
        >
          {product.image && !imageBroken ? (
            <img
              src={product.image}
              alt={product.name}
              crossOrigin="anonymous"
              className={hasBackground ? 'size-full object-cover' : 'max-h-[75%] max-w-[80%] object-contain'}
              onError={() => setImageBroken(true)}
            />
          ) : (
            <GiftIcon className="size-10 text-gray-300" />
          )}
          {rank != null && (
            <span className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full bg-gray-700 text-caption1-m text-white">
              {/* 폰트 렌더링 특성상 숫자가 살짝 치우쳐 보여 보정합니다 (모바일 기준) */}
              <span className="translate-y-[-0.5px]">{rank}</span>
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            aria-label="위시 등록"
            aria-pressed={wished}
            onClick={handleWishClick}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              handleWishClick(e)
            }}
            className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full ${
              wished ? 'bg-gray-900 text-white' : 'bg-white text-gray-200'
            }`}
          >
            <GiftIcon className="size-4" />
          </span>
        </div>
        <div className="mt-2 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-caption1-r text-gray-700">{product.brand}</span>
            <ChevronRightIcon className="size-3 translate-y-0.5 text-gray-700" />
          </div>
          <p className="mt-3 line-clamp-2 min-h-[42px] leading-[1.5] text-b2-m text-black">{product.name}</p>
        </div>
        <p className="mt-3 text-b2-m text-black">
          <span className="font-semibold">{product.price.toLocaleString()}</span>원
        </p>
      </button>

      <ConfirmModal
        open={linkConfirmOpen}
        title="외부 사이트로 이동할까요?"
        description={'상품 정보를 확인하기 위해\n외부 사이트로 이동해요.'}
        cancelText="돌아가기"
        confirmText="이동하기"
        onCancel={() => setLinkConfirmOpen(false)}
        onConfirm={() => {
          setLinkConfirmOpen(false)
          if (product.link) window.open(product.link, '_blank', 'noopener,noreferrer')
        }}
      />
    </>
  )
}
