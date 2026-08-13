import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Header from '../../components/common/Header'
import LetterCard from '../../components/common/LetterCard'
import type { ReviewPreviewData } from './reviewTypes'
import { useLetterColors, backgroundIdToColorId } from './useDecorations'
import { useReview } from './useReviews'
import type { ReviewApiType } from '../../api/reviews'
import { getTogetherGiftDashboard } from '../../api/groupFundings'
import GiftDashboardSummary from './GiftDashboardSummary'

const REVIEW_API_TYPES: ReviewApiType[] = ['review', 'news', 'heartfelt']

/** 스와이프로 인정할 최소 드래그 거리(px) */
const SWIPE_THRESHOLD = 40

const EMPTY_STATE_TEXT = '아직 작성된 후기가 없어요'
const ERROR_STATE_TEXT = '후기를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
const LOADING_STATE_TEXT = '불러오는 중이에요'

/**
 * J01-2) 선물 후기 조회 화면 (/gift/review/:id/:fundingId?)
 * 우선순위: 작성 직후 navigate state → 실제 조회 API(getReview, fundingId 있을 때만).
 * 후기가 없거나(404/빈 응답) 조회 자체가 실패하면 로딩과 구분된 안내 상태를 보여준다.
 */
export default function GiftReviewDetailPage() {
  const { fundingId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [imageIndex, setImageIndex] = useState(0)
  const pointerStartX = useRef<number | null>(null)

  // 조회 대상은 기본값이 선물 후기(review)이며, 전달 소식(news)·마음 전하기(heartfelt)를 볼 땐 ?type=으로 지정됨
  const requestedType = searchParams.get('type')
  const reviewApiType: ReviewApiType = REVIEW_API_TYPES.includes(requestedType as ReviewApiType)
    ? (requestedType as ReviewApiType)
    : 'review'

  const colors = useLetterColors()
  const { data: apiReview, isLoading, isError } = useReview(fundingId, reviewApiType)

  // news/message(heartfelt) 조회 화면 상단은 함께 선물 대시보드(공개 API)를 추가로 보여준다. 실패해도 편지 본문은
  // 그대로 보여야 하므로 이 쿼리는 로딩/에러를 페이지 전체 상태에 관여시키지 않고, 데이터가 없으면 요약 블록만 생략한다.
  const showDashboard = reviewApiType === 'news' || reviewApiType === 'heartfelt'
  const { data: dashboard } = useQuery({
    queryKey: ['togetherGiftDashboard', fundingId],
    queryFn: () => getTogetherGiftDashboard(fundingId!),
    enabled: showDashboard && fundingId != null,
  })

  const previewState = location.state as ReviewPreviewData | null
  const review: ReviewPreviewData | null = previewState ?? (apiReview
    ? {
        authorName: apiReview.authorName,
        title: apiReview.title ?? '',
        content: apiReview.content,
        colorId: backgroundIdToColorId(apiReview.backgroundId),
        images: apiReview.images,
        fundingReviewId: apiReview.fundingReviewId,
      }
    : null)

  const goToImage = (next: number) => {
    if (!review) return
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

  // previewState가 있으면 이미 확정된 데이터라 API 로딩/에러 상태와 무관하게 그대로 보여준다
  if (!previewState && isLoading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-10">
        <Header title="선물 후기" />
        <p className="flex flex-1 items-center justify-center px-[18px] text-b2-r text-gray-400">{LOADING_STATE_TEXT}</p>
      </div>
    )
  }

  if (!previewState && isError) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-10">
        <Header title="선물 후기" />
        <p className="flex flex-1 items-center justify-center px-[18px] text-center text-b2-r text-gray-400">{ERROR_STATE_TEXT}</p>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-10">
        <Header title="선물 후기" />
        <p className="flex flex-1 items-center justify-center px-[18px] text-b2-r text-gray-400">{EMPTY_STATE_TEXT}</p>
      </div>
    )
  }

  const letterColor = colors.find((c) => c.id === review.colorId) ?? colors[colors.length - 1]
  const hasImages = review.images.length > 0
  const heading = review.authorName ? `${review.authorName}님이 보낸 선물 후기` : '선물 후기'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-10">
      <Header title={heading} />

      {showDashboard && dashboard && <GiftDashboardSummary dashboard={dashboard} />}

      <div className="flex flex-col gap-4 px-[18px] pt-5">
        <h2 className="text-h3-sb text-black">{heading}</h2>

        {hasImages && (
          <div className="flex flex-col gap-2">
            <div
              className="relative h-[300px] w-full touch-pan-y select-none overflow-hidden rounded-xl border border-gray-200 bg-background-2"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${imageIndex * 100}%)` }}
              >
                {review.images.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`${heading} 이미지 ${index + 1}`}
                    draggable={false}
                    className="h-full w-full shrink-0 object-cover"
                  />
                ))}
              </div>
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
        )}

        {letterColor && (
          <LetterCard
            color={letterColor}
            state="open"
            title={review.title}
            content={review.content}
            showFrom={review.authorName != null}
            fromLabel={review.authorName ? `from. ${review.authorName}` : undefined}
          />
        )}
      </div>
    </div>
  )
}
