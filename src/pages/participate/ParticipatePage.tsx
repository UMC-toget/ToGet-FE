import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useMockFunding } from '../funding/useMockFunding'
import { LETTER_COLORS } from '../../components/common/letterPalette'
import ProcessBar from './ProcessBar'
import NameStep from './NameStep'
import LetterStep from './LetterStep'
import AmountStep from './AmountStep'
import DepositStep from './DepositStep'
import { postContribution } from '../../api/contributions'

/**
 * E03) 내 선물 참여: 축하 페이지 (4단계 참여 흐름)
 * 자동 저장 없음 — 이탈 시 확인 모달을 띄웁니다.
 */
export default function ParticipatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const funding = useMockFunding()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [letter, setLetter] = useState('')
  const [letterColor, setLetterColor] = useState(LETTER_COLORS[7]) // 기본 화이트
  const [isPrivate, setIsPrivate] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canGoNext = [
    name.trim() !== '' || isAnonymous,
    letter.trim() !== '',
    amount != null, // 0 = 금액 없이 참여
    true,
  ][step - 1]

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else setShowExitModal(true)
  }

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1)
      return
    }
    if (submitting) return
    setSubmitting(true)
    try {
      // ⚠️ backgroundId: 로컬 팔레트와 BE background ID 매핑이 미완성
      // 추후 fetchContributionBackgrounds() 연동 후 letterColor.id → backgroundId 맵 교체
      const bgIdByColor: Record<string, number> = {
        pink: 1, red: 2, yellow: 3, green: 4, skyBlue: 5, darkPurple: 6, lightPurple: 7, white: 8,
      }
      await postContribution(id!, {
        senderName: isAnonymous ? '익명' : name.trim(),
        backgroundId: bgIdByColor[letterColor.id] ?? 1,
        isAnonymous,
        amount: amount ?? 0,
        content: letter,
        isPrivate,
      })
      navigate(`/funding/${id}/complete`)
    } catch (e) {
      console.error('참여 제출 실패', e)
      // 실패해도 UI 흐름 유지 (완료 페이지로 이동 — 추후 에러 처리 개선)
      navigate(`/funding/${id}/complete`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header
        title={`${funding.hostName}에게`}
        onBack={handleBack}
        right={
          <button type="button" onClick={() => setShowExitModal(true)} className="text-b2-m text-black">
            나가기
          </button>
        }
      />

      <div className="flex flex-col gap-5 px-[18px] pt-6">
        <ProcessBar currentStep={step} />

        {step === 1 && (
          <NameStep
            name={name}
            isAnonymous={isAnonymous}
            onNameChange={setName}
            onAnonymousChange={setIsAnonymous}
          />
        )}
        {step === 2 && (
          <LetterStep
            hostName={funding.hostName}
            letter={letter}
            letterColor={letterColor}
            isPrivate={isPrivate}
            onLetterChange={setLetter}
            onColorChange={setLetterColor}
            onPrivateChange={setIsPrivate}
          />
        )}
        {step === 3 && <AmountStep funding={funding} amount={amount} onAmountChange={setAmount} />}
        {step === 4 && (
          <DepositStep hostName={funding.hostName} letter={letter} letterColor={letterColor} amount={amount ?? 0} />
        )}
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 w-full max-w-[402px] -translate-x-1/2 bg-gradient-to-b from-white/0 to-white/80 px-[18px] pb-[34px] pt-10">
        <Button className="pointer-events-auto" disabled={!canGoNext || (step === 4 && submitting)} onClick={handleNext}>
          {step < 4 ? '다음' : '마음 보내기'}
        </Button>
      </div>

      {/* 디자인상 좌측이 나가기, 우측이 이어서 작성하기라 cancel/confirm이 평소와 반대로 매핑됨.
          ConfirmModal 구조상 딤 클릭도 나가기로 동작하는 건 팀 확인 필요 */}
      <ConfirmModal
        open={showExitModal}
        title="페이지를 나가시겠어요?"
        description={'지금 나가면, 작성 중인 메세지가\n사라질 수 있어요'}
        cancelText="나가기"
        confirmText="이어서 작성하기"
        onCancel={() => navigate(`/funding/${id}`)}
        onConfirm={() => setShowExitModal(false)}
      />
    </div>
  )
}
