import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import LetterCard from '../../components/common/LetterCard'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import { getMockReview } from './mockReview'
import type { ReviewPreviewData } from './reviewTypes'

/** 스와이프로 인정할 최소 드래그 거리(px) */
const SWIPE_THRESHOLD = 40

/**
 * J01-2) 선물 후기 조회 화면 (/gift/review/:id)
 * 서버 연동 전이라 작성 → 완료 화면에서 navigate state로 넘어온 데이터를 우선 사용하고,
 * 없으면(직접 URL 접근 등) mockReview로 대체한다.
 */
export default function GiftReviewDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const [imageIndex, setImageIndex] = useState(0)
  const [letterOpen, setLetterOpen] = useState(false)
  const pointerStartX = useRef<number | null>(null)

  const review = (location.state as ReviewPreviewData | null) ?? getMockReview(id)
  const letterColor = LETTER_COLORS.find((c) => c.id === review.colorId) ?? LETTER_COLORS[7]
  const hasImages = review.images.length > 0

  const goToImage = (next: number) => {
    setImageIndex(Math.min(Math.max(next, 0), review.images.length - 1))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return
    const delta = event.clientX - pointerStartX.current
    pointerStartX.current = null

    if (delta > SWIPE_THRESHOLD) goToImage(imageIndex - 1)
    else if (delta < -SWIPE_THRESHOLD) goToImage(imageIndex + 1)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-10">
      <Header title={`${review.senderName}님이 보낸 선물 후기`} />

      <div className="flex flex-col gap-4 px-[18px] pt-5">
        <h2 className="text-h3-sb text-black">{review.senderName}님이 보낸 선물 후기</h2>

        <div className="flex flex-col gap-2">
          {/* 피그마 기준: 대표 이미지가 있으면 실제 이미지, 없으면 placeholder (FundingDetailPage와 동일한 패턴) */}
          <div
            className="relative h-[300px] w-full touch-pan-y select-none overflow-hidden rounded-xl border border-gray-200 bg-background-2"
            onPointerDown={hasImages ? handlePointerDown : undefined}
            onPointerUp={hasImages ? handlePointerUp : undefined}
          >
            {hasImages ? (
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${imageIndex * 100}%)` }}
              >
                {review.images.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`${review.senderName}님이 보낸 선물 후기 이미지 ${index + 1}`}
                    draggable={false}
                    className="h-full w-full shrink-0 object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-t from-[#984463]/50 to-[#666666]/20">
                <p className="text-caption1-r text-[#888888]">대표 이미지 삽입 영역</p>
              </div>
            )}
          </div>

          {review.images.length > 1 && (
            <div className="flex items-center justify-center gap-1">
              {review.images.map((_, index) => (
                <span
                  key={index}
                  className={`rounded-full ${index === imageIndex ? 'size-1.5 bg-pink-500' : 'size-1 bg-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        <LetterCard
          color={letterColor}
          state={letterOpen ? 'open' : 'folded'}
          title={review.title}
          content={review.content}
          showFrom
          fromLabel={`from. ${review.senderName}`}
          onToggle={() => setLetterOpen((prev) => !prev)}
        />
      </div>
    </div>
  )
}
