import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import TextField from '../../components/common/TextField'
import ConfirmModal from '../../components/common/ConfirmModal'
import LetterCard from '../../components/common/LetterCard'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import { REVIEW_WRITE_TYPES, REVIEW_TITLE_MAX_LENGTH, REVIEW_CONTENT_MAX_LENGTH } from './reviewTypes'
import type { ReviewWriteType } from './reviewTypes'

/** J파트 작성물 3종 공용 작성 화면 (/gift/review/write/:type, 피그마 #1930:13637 외) */
export default function ReviewWritePage() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [colorId, setColorId] = useState(LETTER_COLORS[7].id) // 기본 화이트
  const [showExitModal, setShowExitModal] = useState(false)

  const config = type && type in REVIEW_WRITE_TYPES ? REVIEW_WRITE_TYPES[type as ReviewWriteType] : null
  if (!config) return <Navigate to="/home" replace />

  const letterColor = LETTER_COLORS.find((c) => c.id === colorId) ?? LETTER_COLORS[7]
  const canSubmit = title.trim() !== '' && content.trim() !== ''

  const handleExit = () => setShowExitModal(true)

  const handleSubmit = () => {
    // TODO: BE 연동 시 작성 데이터 전송
    navigate(config.completePath)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header
        title={config.headerTitle}
        onBack={handleExit}
        right={
          <button type="button" onClick={handleExit} className="text-b2-m text-black">
            나가기
          </button>
        }
      />

      <div className="flex flex-col gap-6 px-[18px] pt-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3-sb text-black">{config.guideTitle}</h2>
          <p className="text-caption1-r text-gray-600">{config.guideDescription}</p>
        </div>

        <TextField
          label={config.titleLabel}
          placeholder={config.titlePlaceholder}
          value={title}
          maxLength={REVIEW_TITLE_MAX_LENGTH}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label={config.contentLabel}
          placeholder={config.contentPlaceholder}
          value={content}
          maxLength={REVIEW_CONTENT_MAX_LENGTH}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <p className="text-b1-m text-black">편지지 색상</p>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {LETTER_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={`${c.name} 편지지`}
                onClick={() => setColorId(c.id)}
                className={`size-[35px] shrink-0 rounded-[4px] ${colorId === c.id ? '' : 'opacity-60'}`}
                style={{
                  backgroundColor: c.background,
                  ...(c.id === 'white' && { border: '2px solid var(--color-gray-500)' }),
                }}
              />
            ))}
          </div>
        </div>

        <LetterCard
          color={letterColor}
          state="open"
          title={title}
          titlePlaceholder={config.titlePlaceholder}
          content={content}
          contentPlaceholder={config.contentPlaceholder}
          showFrom={config.showFrom}
        />
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button className="pointer-events-auto" disabled={!canSubmit} onClick={handleSubmit}>
          다음
        </Button>
      </div>

      {/* 피그마 상 좌측이 나가기, 우측이 이어서 작성하기라 cancel/confirm이 평소와 반대로 매핑됨 (참여 흐름과 동일한 관례) */}
      <ConfirmModal
        open={showExitModal}
        title="페이지를 나가시겠어요?"
        description={'지금 나가면, 작성 중인 내용이\n사라질 수 있어요'}
        cancelText="나가기"
        confirmText="이어서 작성하기"
        onCancel={() => navigate(-1)}
        onConfirm={() => setShowExitModal(false)}
      />
    </div>
  )
}
