import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import CheckOption from '../../components/common/CheckOption'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import { useMyProfile } from '../../hooks/useMyProfile'
import { postContribution } from '../../api/contributions'

const LETTER_MAX_LENGTH = 234

const BG_ID_BY_COLOR: Record<string, number> = {
  pink: 1, red: 2, yellow: 3, green: 4, skyBlue: 5, darkPurple: 6, lightPurple: 7, white: 8,
}

export default function LetterPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profile } = useMyProfile()

  const recipientName = (location.state as { recipientName?: string } | null)?.recipientName ?? '받는 분'

  const [colorId, setColorId] = useState('white')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedColor = LETTER_COLORS.find(c => c.id === colorId) ?? LETTER_COLORS[7]

  const handleBack = () => {
    if (content.trim()) {
      setShowLeaveModal(true)
    } else {
      navigate(-1)
    }
  }

  const handleComplete = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await postContribution(id!, {
        senderName: profile?.nickname ?? '참여자',
        backgroundId: BG_ID_BY_COLOR[colorId] ?? 8,
        isAnonymous: false,
        amount: 0,
        content,
        isPrivate,
      })
    } catch (e) {
      console.error('편지 전송 실패', e)
    } finally {
      setSubmitting(false)
    }
    navigate(`/group/${id}`)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header title="편지 남기기" onBack={handleBack} />

      <div className="flex flex-col gap-5 px-[18px] py-5">
        <h2 className="text-h3-sb text-black">{recipientName}님에게 편지남기기</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-b1-m text-black">편지지 색상</p>
            <div className="flex items-center gap-3">
              {LETTER_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColorId(c.id)}
                  className={`size-[35px] shrink-0 rounded-full transition-transform ${
                    colorId === c.id ? 'scale-110 outline outline-2 outline-offset-1 outline-gray-700' : ''
                  }`}
                  style={{
                    background: c.background,
                    border: `1px solid ${c.border}`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 편지 카드 (줄 노트 스타일) */}
          <div
            className="rounded-xl border p-4"
            style={{ background: selectedColor.background, borderColor: selectedColor.border }}
          >
            <div className="flex flex-col gap-3">
              <p className="text-b1-m text-black">{recipientName}에게</p>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={e => {
                    const val = e.target.value
                    if (val.length <= LETTER_MAX_LENGTH) setContent(val)
                  }}
                  placeholder="내용을 입력해주세요"
                  rows={9}
                  className="w-full resize-none bg-transparent text-b2-r text-black focus:outline-none"
                  style={{
                    lineHeight: '28px',
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent 27px,
                      ${selectedColor.border} 27px,
                      ${selectedColor.border} 28px
                    )`,
                    backgroundAttachment: 'local',
                    color: selectedColor.id === 'white' ? 'var(--color-black)' : 'inherit',
                  }}
                />
              </div>
              <p className="text-right text-caption2-r text-gray-500">
                {content.length}/{LETTER_MAX_LENGTH}
              </p>
            </div>
          </div>

          <CheckOption
            label="메세지 내용 비공개 설정"
            checked={isPrivate}
            onChange={setIsPrivate}
          />
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button
          className="pointer-events-auto"
          disabled={content.trim().length === 0 || submitting}
          onClick={handleComplete}
        >
          완료하기
        </Button>
      </div>

      <ConfirmModal
        open={showLeaveModal}
        title="편지 작성을 그만 두시겠어요?"
        description="작성 중인 내용은 저장되지 않아요"
        confirmText="나가기"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => navigate(-1)}
      />
    </div>
  )
}
