import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import { useMockFunding } from '../funding/useMockFunding'
import { useLetterColors, colorIdToBackgroundId } from '../gift-review/useDecorations'
import ProcessBar from '../../components/common/ProcessBar'
import NameStep from './NameStep'
import LetterStep from './LetterStep'
import AmountStep from './AmountStep'
import DepositStep from './DepositStep'
import { postContribution } from '../../api/contributions'
import { getSharedFunding, sharedFundingToFundingDetail } from '../../api/fundings'
import type { FundingDetail } from '../../types/funding'
import { trackEvent } from '../../lib/analytics'

/**
 * E03) 내 선물 참여: 축하 페이지 (4단계 참여 흐름)
 * 자동 저장 없음 — 이탈 시 확인 모달을 띄웁니다.
 */
export default function ParticipatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const locationState = useLocation().state as { hostName?: string; anniversaryDate?: string } | null
  const mockFunding = useMockFunding()
  const [realFunding, setRealFunding] = useState<FundingDetail | null>(null)

  // 진행카드·추천금액·개설자명·위시는 실펀딩(shared-fundings)에서 채웁니다.
  // 조회 실패 시 mock으로 fallback (계좌는 DepositStep이 fundingId로 따로 조회)
  useEffect(() => {
    if (!id) return
    getSharedFunding(id)
      .then((shared) => setRealFunding(sharedFundingToFundingDetail(shared, [])))
      .catch(() => {})
  }, [id])

  // 목 데이터는 개발 환경에서만 fallback으로 사용합니다.
  // API 실패 시 다른 사용자의 목 정보(호스트명·추천 금액 기준일 등)가 실제 데이터처럼 노출되면 안 됩니다.
  const funding = realFunding ??
    (import.meta.env.DEV
      ? locationState?.anniversaryDate
        ? { ...mockFunding, anniversaryDate: locationState.anniversaryDate }
        : mockFunding
      : null)
  const hostName = realFunding?.hostName ?? locationState?.hostName ?? (import.meta.env.DEV ? mockFunding.hostName : '')

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [letter, setLetter] = useState('')
  // 편지지 색은 BE(contribution-backgrounds) hexCode에서 파생. 제출 시 backgroundId만 전송
  const colors = useLetterColors()
  const [colorId, setColorId] = useState('white') // 기본 화이트
  const letterColor = colors.find((c) => c.id === colorId) ?? colors[colors.length - 1]
  const [isPrivate, setIsPrivate] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

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
      await postContribution(id!, {
        senderName: isAnonymous ? '익명' : name.trim(),
        backgroundId: letterColor?.backgroundId ?? colorIdToBackgroundId(colorId) ?? 8,
        isAnonymous,
        amount: amount ?? 0,
        content: letter,
        isPrivate,
      })
      trackEvent('funding_participate_complete', { funding_type: 'my' })
      navigate(`/funding/${id}/complete`, { state: { hostName } })
    } catch (e) {
      console.error('참여 제출 실패', e)
      setSubmitError(true)
      setTimeout(() => setSubmitError(false), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-white pb-[140px]">
      <Header
        title={`${hostName}에게`}
        onBack={handleBack}
        right={
          <button type="button" onClick={() => setShowExitModal(true)} className="text-b2-m text-black">
            나가기
          </button>
        }
      />

      <div className="flex flex-col gap-5 px-[18px] pt-6">
        <ProcessBar steps={['참여자 정보', '축하 메세지', '참여 금액 선택', '마음 전하기']} currentStep={step} />

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
            hostName={hostName}
            letter={letter}
            letterColor={letterColor}
            colors={colors}
            isPrivate={isPrivate}
            onLetterChange={setLetter}
            onColorChange={(c) => setColorId(c.id)}
            onPrivateChange={setIsPrivate}
          />
        )}
        {step === 3 && (
          funding ? (
            <AmountStep funding={funding} amount={amount} onAmountChange={setAmount} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-b1-m text-black">펀딩 정보를 불러오지 못했어요</p>
              <p className="text-caption1-r text-gray-500">잠시 후 다시 시도해 주세요</p>
            </div>
          )
        )}
        {step === 4 && (
          <DepositStep hostName={hostName} letter={letter} letterColor={letterColor} amount={amount ?? 0} fundingId={id} />
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

      <Toast open={submitError} message="참여 제출에 실패했어요. 다시 시도해주세요." />
    </div>
  )
}
