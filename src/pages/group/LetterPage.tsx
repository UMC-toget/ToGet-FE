import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import StickyBottomBar from '../../components/common/StickyBottomBar'
import EmojiPopup from '../../components/common/EmojiPopup'
import CheckOption from '../../components/common/CheckOption'
import LetterCard from '../../components/common/LetterCard'
import LetterColorPicker from '../../components/common/LetterColorPicker'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import { useMyProfile } from '../../hooks/useMyProfile'
import { postContribution } from '../../api/contributions'

// 접근: 로그인한 모든 역할 | 편지 남기기
const LETTER_MAX_LENGTH = 234

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
        backgroundId: selectedColor.backgroundId,
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
          <LetterColorPicker selectedId={colorId} onSelect={c => setColorId(c.id)} />

          <LetterCard
            color={selectedColor}
            state="preInput"
            title={`${recipientName}에게`}
            content={content}
            onContentChange={setContent}
            maxLength={LETTER_MAX_LENGTH}
          />

          <CheckOption
            label="메세지 내용 비공개 설정"
            checked={isPrivate}
            onChange={setIsPrivate}
          />
        </div>
      </div>

      <StickyBottomBar>
        <Button
          className="pointer-events-auto"
          disabled={content.trim().length === 0 || submitting}
          onClick={handleComplete}
        >
          완료하기
        </Button>
      </StickyBottomBar>

      {/* 편지 작성 이탈 확인 — 피그마(3440:117304): 나가기(좌·회색)/이어서 작성하기(우·검정), 배경 탭은 닫힘(안전) */}
      <EmojiPopup
        open={showLeaveModal}
        title="페이지를 나가시겠어요?"
        description="지금 나가면, 작성 중인 메세지가 사라질 수 있어요"
        buttons={[
          { label: '나가기', variant: 'secondary', onClick: () => navigate(-1) },
          { label: '이어서 작성하기', variant: 'primary', onClick: () => setShowLeaveModal(false) },
        ]}
        onDimClick={() => setShowLeaveModal(false)}
      />
    </div>
  )
}
