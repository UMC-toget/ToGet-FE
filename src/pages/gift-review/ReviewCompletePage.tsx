import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import CloseIcon from '../../components/icons/CloseIcon'
import ShareIcon from '../../components/icons/ShareIcon'
import reviewCompleteHero from '../../assets/review-complete-hero.png'
import { REVIEW_COMPLETE_TYPES } from './reviewTypes'
import type { ReviewWriteType } from './reviewTypes'

const TOAST_DURATION_MS = 2000

/** J파트 작성물 3종 공용 완료 화면 (/gift/review/complete/:type, 피그마 #1933:103464 외) */
export default function ReviewCompletePage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toastMessage === null) return
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const config = type && type in REVIEW_COMPLETE_TYPES ? REVIEW_COMPLETE_TYPES[type as ReviewWriteType] : null
  if (!config) return <Navigate to="/home" replace />

  // TODO: BE 연동 후 실제 발급된 링크로 교체
  const linkPath = `toger.kr/p/${config.key}-mock`
  const linkUrl = `https://${linkPath}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl)
    } catch {
      // 카톡 인앱 브라우저 등 clipboard API 미지원 환경 fallback
      const textarea = document.createElement('textarea')
      textarea.value = linkUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setToastMessage('링크가 복사되었어요')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: config.completeTitle, url: linkUrl })
      } catch {
        // 사용자가 공유를 취소한 경우 등은 무시
      }
      return
    }
    await copyLink()
  }

  // TODO: 조회 화면(#86 등)이 머지되기 전까지는 목 id로 이동함
  const handlePreview = () => navigate(`/gift/review/${config.key}-mock`)

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-white pb-[140px] antialiased">
      <button
        type="button"
        aria-label="닫기"
        onClick={() => navigate('/home')}
        className="absolute right-[18px] top-[18px] z-10 text-black"
      >
        <CloseIcon />
      </button>

      {/* flex-1 + justify-center: 뷰포트가 콘텐츠보다 길어져도 남는 공간이 링크 섹션과 CTA 사이에
          몰리지 않고 위아래로 고르게 분산되도록 함 */}
      <div className="flex flex-1 flex-col justify-center">
        {/* 피그마 J03-1) 전달완료 : 초대장 만들기 (#1933:103464) 히어로 영역(그라데이션 배경 + 하트 +
            캐릭터 + 체크 배지)을 하나의 이미지로 export해 원본 비율 그대로 사용 (#1933:103545) */}
        <img src={reviewCompleteHero} alt="" aria-hidden className="w-full object-contain" />

        <div className="flex flex-col items-center gap-2 px-[18px] pt-7 text-center">
          <h1 className="text-h2-sb text-black">{config.completeTitle}</h1>
          <p className="text-b2-r text-gray-600">{config.completeDescription}</p>
        </div>

        <div className="flex flex-col gap-2 px-[18px] pt-4">
          <p className="text-b1-m text-black">{config.linkLabel}</p>
          <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
            <div className="flex h-12 items-center justify-between gap-2 rounded-lg bg-background px-4">
              <span className="truncate text-b1-r text-gray-400">{linkPath}</span>
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 rounded bg-gray-700 px-3 py-1.5 text-caption1-m text-white"
              >
                링크 복사
              </button>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 py-2"
            >
              <ShareIcon className="size-5 text-black" />
              <span className="text-caption1-m text-black">{config.shareLabel}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button className="pointer-events-auto" onClick={handlePreview}>
          {config.previewLabel}
        </Button>
      </div>

      <Toast open={toastMessage !== null} message={toastMessage ?? ''} />
    </div>
  )
}
