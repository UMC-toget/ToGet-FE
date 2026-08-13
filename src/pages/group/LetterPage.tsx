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
import { readLetterDraft, writeLetterDraft } from './letterDraft'

// 접근: 로그인한 모든 역할 | 편지 남기기
// 이 화면은 편지를 '작성/로컬 저장'만 한다. 실제 제출(입금 완료 신고)은 정산하기(SettlePage)에서 이 draft를 함께 보낸다.
const LETTER_MAX_LENGTH = 234

export default function LetterPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const recipientName = (location.state as { recipientName?: string } | null)?.recipientName ?? '받는 분'

  const [initialDraft] = useState(() => readLetterDraft(id))
  const [colorId, setColorId] = useState(initialDraft?.colorId ?? 'white')
  const [content, setContent] = useState(initialDraft?.content ?? '')
  const [isPrivate, setIsPrivate] = useState(initialDraft?.isPrivate ?? false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const selectedColor = LETTER_COLORS.find(c => c.id === colorId) ?? LETTER_COLORS[7]

  const handleBack = () => {
    if (content.trim()) {
      setShowLeaveModal(true)
    } else {
      navigate(-1)
    }
  }

  // 편지를 로컬에 저장하고 정산하기로 복귀. 제출은 정산하기 '입금 완료'에서 이 draft로 이뤄진다.
  const saveAndLeave = () => {
    writeLetterDraft(id, { colorId, content, isPrivate })
    setShowLeaveModal(false)
    navigate(-1)
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
        <Button className="pointer-events-auto" onClick={saveAndLeave}>
          완료하기
        </Button>
      </StickyBottomBar>

      {/* 편지 작성 이탈 — 로컬 임시저장 방식: 계속 작성하기(좌·회색)/저장하고 나가기(우·검정), 배경 탭은 닫힘(안전) */}
      <EmojiPopup
        open={showLeaveModal}
        title="작성 중인 페이지를 저장할까요?"
        description={'지금 나가면 현재까지 입력한 내용이 저장되고,\n다음에 다시 이어서 작성할 수 있어요'}
        buttons={[
          { label: '계속 작성하기', variant: 'secondary', onClick: () => setShowLeaveModal(false) },
          { label: '저장하고 나가기', variant: 'primary', onClick: saveAndLeave },
        ]}
        onDimClick={() => setShowLeaveModal(false)}
      />
    </div>
  )
}
